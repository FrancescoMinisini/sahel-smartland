import { useEffect, useRef, useState, useMemo } from 'react';
import { cn } from "@/lib/utils";
import { Layers, ZoomIn, ZoomOut, RotateCcw, Eye, Loader2, Info } from 'lucide-react';
import { 
  loadTIFF, 
  renderTIFFToCanvas, 
  interpolateData, 
  landCoverColors, 
  landCoverClasses,
  getAvailableYears,
  calculateLandCoverStats,
  calculatePrecipitationStats,
  precipitationColorScale
} from '@/lib/geospatialUtils';
import { useToast } from '@/components/ui/use-toast';

interface MapVisualizationProps {
  className?: string;
  year?: number;
  onStatsChange?: (stats: Record<string, number>) => void;
  expandedView?: boolean;
  dataType?: 'landCover' | 'precipitation' | 'vegetation' | 'population';
}

const MapVisualization = ({ 
  className, 
  year = 2023, 
  onStatsChange,
  expandedView = false,
  dataType = 'landCover'
}: MapVisualizationProps) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLayer, setActiveLayer] = useState(dataType);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapData, setMapData] = useState<{
    [dataType: string]: {
      [year: number]: { 
        data: number[], 
        width: number, 
        height: number,
        min?: number,
        max?: number
      }
    }
  }>({
    landCover: {},
    precipitation: {},
    vegetation: {},
    population: {}
  });
  const [currentStats, setCurrentStats] = useState<Record<string, number>>({});
  const [transitionAnimationId, setTransitionAnimationId] = useState<number | null>(null);
  const previousYearRef = useRef<number | null>(null);
  const previousDataTypeRef = useRef<string | null>(null);
  
  // Find the closest available years for interpolation
  const { prevYear, nextYear, progress } = useMemo(() => {
    const availableYears = getAvailableYears(dataType);
    
    if (availableYears.includes(year)) {
      return { prevYear: year, nextYear: year, progress: 0 };
    }
    
    // Find the closest previous and next years
    const prevYear = Math.max(...availableYears.filter(y => y <= year));
    const nextYear = Math.min(...availableYears.filter(y => y >= year));
    
    // Calculate interpolation progress (0-1)
    const yearRange = nextYear - prevYear;
    const progress = yearRange > 0 ? (year - prevYear) / yearRange : 0;
    
    return { prevYear, nextYear, progress };
  }, [year, dataType]);

  // Notify parent component when stats change
  useEffect(() => {
    if (onStatsChange && Object.keys(currentStats).length > 0) {
      onStatsChange(currentStats);
    }
  }, [currentStats, onStatsChange]);

  // Update active layer when dataType prop changes
  useEffect(() => {
    setActiveLayer(dataType);
    previousDataTypeRef.current = dataType;
  }, [dataType]);

  // Preload data for all years when the component mounts
  useEffect(() => {
    const preloadAllYears = async () => {
      setIsLoading(true);
      
      try {
        // Get all available years
        const availableYears = getAvailableYears(dataType);
        
        // Create a queue to load years in sequence
        for (const yearToLoad of availableYears) {
          if (!mapData[dataType]?.[yearToLoad]) {
            // Load data for this year
            const data = await loadTIFF(yearToLoad, dataType);
            setMapData(prev => ({
              ...prev,
              [dataType]: {
                ...(prev[dataType] || {}),
                [yearToLoad]: data
              }
            }));
          }
        }
      } catch (error) {
        console.error(`Error preloading ${dataType} data:`, error);
        toast({
          title: `Error loading ${dataType} data`,
          description: `Could not preload all the ${dataType} data years.`,
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Check if we need to load data for this data type
    if (!mapData[dataType] || Object.keys(mapData[dataType]).length === 0) {
      preloadAllYears();
    } else {
      setIsLoading(false);
    }
    
    // Cleanup function
    return () => {
      if (transitionAnimationId !== null) {
        cancelAnimationFrame(transitionAnimationId);
      }
    };
  }, [dataType]);

  // Render the map with smooth transitions when the year changes
  useEffect(() => {
    if (isLoading || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get data for the current data type
    const dataForType = mapData[dataType] || {};
    const prevYearData = dataForType[prevYear];
    const nextYearData = dataForType[nextYear];
    
    if (!prevYearData || prevYearData.data.length === 0) {
      console.error(`No data for ${dataType} for year ${prevYear}`);
      return;
    }
    
    // Set canvas dimensions if not already set
    if (canvas.width !== prevYearData.width || canvas.height !== prevYearData.height) {
      canvas.width = prevYearData.width;
      canvas.height = prevYearData.height;
    }
    
    // Handle smooth transition when year changes
    if (previousYearRef.current !== null && 
        (previousYearRef.current !== year || previousDataTypeRef.current !== dataType)) {
      // Cancel any existing animation
      if (transitionAnimationId !== null) {
        cancelAnimationFrame(transitionAnimationId);
      }
      
      // Determine if data type has changed
      const dataTypeChanged = previousDataTypeRef.current !== dataType;
      
      if (dataTypeChanged) {
        // If data type changed, just render the new data type without animation
        renderDataToCanvas(prevYearData, nextYearData, progress);
      } else {
        // Animate year transition for the same data type
        animateYearTransition(prevYearData, nextYearData, progress);
      }
    } else {
      // Regular render without transition animation
      renderDataToCanvas(prevYearData, nextYearData, progress);
    }
    
    // Update the previous year and data type refs
    previousYearRef.current = year;
    previousDataTypeRef.current = dataType;
  }, [mapData, prevYear, nextYear, progress, isLoading, year, dataType, transitionAnimationId]);

  // Helper function to render data to canvas
  const renderDataToCanvas = (
    prevYearData: typeof mapData[string][number],
    nextYearData: typeof mapData[string][number] | undefined,
    progress: number
  ) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    let renderData;
    let min = prevYearData.min || 0;
    let max = prevYearData.max || 0;
    
    if (nextYearData && prevYear !== nextYear) {
      renderData = interpolateData(
        prevYearData.data,
        nextYearData.data,
        progress
      );
      
      // For precipitation, interpolate min/max as well
      if (dataType === 'precipitation') {
        const nextMin = nextYearData.min || 0;
        const nextMax = nextYearData.max || 0;
        min = min + (nextMin - min) * progress;
        max = max + (nextMax - max) * progress;
      }
    } else {
      renderData = prevYearData.data;
    }
    
    // Render based on data type
    renderTIFFToCanvas(
      ctx, 
      renderData, 
      prevYearData.width, 
      prevYearData.height,
      {
        opacity: 1,
        dataType,
        min,
        max
      }
    );
    
    // Update statistics based on data type
    if (dataType === 'landCover') {
      const stats = calculateLandCoverStats(renderData);
      setCurrentStats(stats);
    } else if (dataType === 'precipitation') {
      const stats = calculatePrecipitationStats(renderData);
      setCurrentStats(stats);
    }
  };

  // Helper function to animate year transition
  const animateYearTransition = (
    prevYearData: typeof mapData[string][number],
    nextYearData: typeof mapData[string][number] | undefined,
    targetProgress: number
  ) => {
    if (!canvasRef.current || !nextYearData) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Determine the previous year's data
    const previousYear = previousYearRef.current || year;
    const previousDataType = previousDataTypeRef.current || dataType;
    const previousData = mapData[previousDataType]?.[previousYear];
    
    if (!previousData) return;
    
    // Create a starting point for the animation
    const startInterpolatedData = [...previousData.data];
    
    // Create ending interpolated data
    const endInterpolatedData = nextYearData && prevYear !== nextYear
      ? interpolateData(prevYearData.data, nextYearData.data, targetProgress)
      : prevYearData.data;
    
    // Animate between the two states
    let animationProgress = 0;
    const animationDuration = 500; // ms
    const startTime = performance.now();
    
    const animateTransition = (time: number) => {
      // Calculate progress for the animation
      animationProgress = Math.min((time - startTime) / animationDuration, 1);
      
      // Interpolate between the start and end states
      const transitionData = startInterpolatedData.map((startValue, index) => {
        if (animationProgress >= 1) {
          return endInterpolatedData[index];
        }
        
        // Use progress to determine which value to show
        return Math.random() < animationProgress ? endInterpolatedData[index] : startValue;
      });
      
      // Calculate min/max for precipitation
      let min = prevYearData.min || 0;
      let max = prevYearData.max || 0;
      
      if (dataType === 'precipitation' && nextYearData) {
        const nextMin = nextYearData.min || 0;
        const nextMax = nextYearData.max || 0;
        min = min + (nextMin - min) * targetProgress;
        max = max + (nextMax - max) * targetProgress;
      }
      
      // Render the transitional state
      renderTIFFToCanvas(
        ctx, 
        transitionData, 
        prevYearData.width, 
        prevYearData.height,
        {
          opacity: 1,
          dataType,
          min,
          max
        }
      );
      
      // Continue animation if not complete
      if (animationProgress < 1) {
        const newAnimationId = requestAnimationFrame(animateTransition);
        setTransitionAnimationId(newAnimationId);
      } else {
        setTransitionAnimationId(null);
        // Update statistics after animation completes
        if (dataType === 'landCover') {
          setCurrentStats(calculateLandCoverStats(endInterpolatedData));
        } else if (dataType === 'precipitation') {
          setCurrentStats(calculatePrecipitationStats(endInterpolatedData));
        }
      }
    };
    
    // Start the animation
    const animationId = requestAnimationFrame(animateTransition);
    setTransitionAnimationId(animationId);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetView = () => {
    setZoomLevel(1);
  };

  // Fix Type 1: Properly type the layer parameter to match the expected dataType type
  const handleLayerChange = (layer: 'landCover' | 'precipitation' | 'vegetation' | 'population') => {
    setActiveLayer(layer);
  };

  const mapLayers = [
    { id: 'landCover' as const, name: 'Land Cover', color: 'bg-sahel-green' },
    { id: 'vegetation' as const, name: 'Vegetation', color: 'bg-sahel-greenLight' },
    { id: 'precipitation' as const, name: 'Rainfall', color: 'bg-sahel-blue' },
    { id: 'population' as const, name: 'Population', color: 'bg-sahel-earth' },
  ];
  
  // Generate legend based on data type
  const renderLegend = () => {
    if (dataType === 'landCover') {
      return (
        <div className="absolute bottom-3 left-3 bg-white/90 rounded-lg p-2 max-w-xs max-h-36 overflow-auto text-xs shadow-md">
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(landCoverClasses)
              .filter(([key]) => key !== '0')
              .map(([key, name]) => (
                <div key={key} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-sm mr-1"
                    // Fix Type 2: Convert string key to number before using it as an index
                    style={{ backgroundColor: landCoverColors[Number(key) as keyof typeof landCoverColors] }}
                  />
                  <span className="truncate">{name}</span>
                </div>
              ))}
          </div>
        </div>
      );
    } else if (dataType === 'precipitation') {
      return (
        <div className="absolute bottom-3 left-3 bg-white/90 rounded-lg p-2 shadow-md">
          <div className="flex flex-col">
            <span className="text-xs font-medium mb-1">Precipitation (mm)</span>
            <div className="flex h-4 w-full">
              {precipitationColorScale.map((color, i) => (
                <div 
                  key={i} 
                  className="h-full flex-1" 
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn(
      "relative rounded-xl overflow-hidden w-full h-full flex items-center justify-center", 
      className
    )}>
      {/* Year indicator */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10 bg-white/80 dark:bg-muted/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5 shadow-sm">
        {year}
      </div>
      
      {/* Map Container - Take full size of parent container */}
      <div className="absolute inset-0 bg-sahel-sandLight overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-sahel-green animate-spin mb-3" />
              <p className="text-sm text-sahel-earth">Loading map data...</p>
            </div>
          </div>
        ) : (
          <div 
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out" 
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <canvas 
              ref={canvasRef} 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}
      </div>
      
      {/* Map Controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5">
        <button 
          onClick={handleZoomIn} 
          className="w-7 h-7 bg-white rounded-lg shadow-md flex items-center justify-center text-sahel-earth hover:bg-sahel-green hover:text-white transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn size={14} />
        </button>
        <button 
          onClick={handleZoomOut} 
          className="w-7 h-7 bg-white rounded-lg shadow-md flex items-center justify-center text-sahel-earth hover:bg-sahel-green hover:text-white transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut size={14} />
        </button>
        <button 
          onClick={handleResetView} 
          className="w-7 h-7 bg-white rounded-lg shadow-md flex items-center justify-center text-sahel-earth hover:bg-sahel-green hover:text-white transition-colors"
          aria-label="Reset view"
        >
          <RotateCcw size={14} />
        </button>
      </div>
      
      {/* Layer Selector - Smaller version */}
      <div className="absolute top-3 left-3">
        <div className="bg-white rounded-lg shadow-md p-1.5">
          <div className="flex items-center gap-1 mb-1 px-1.5">
            <Layers size={12} className="text-sahel-earth" />
            <span className="text-xs font-medium">Layers</span>
          </div>
          <div className="space-y-0.5">
            {mapLayers.map(layer => (
              <button
                key={layer.id}
                onClick={() => handleLayerChange(layer.id)}
                className={cn(
                  "w-full text-left px-2 py-1 text-xs rounded-md flex items-center gap-1.5 transition-colors",
                  activeLayer === layer.id ? "bg-sahel-green/10 text-sahel-green" : "text-sahel-earth hover:bg-muted"
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", layer.color)}></span>
                {layer.name}
                {activeLayer === layer.id && <Eye size={10} className="ml-auto" />}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Legend based on data type */}
      {renderLegend()}
      
      {/* Data type indicator */}
      <div className="absolute top-3 right-12 bg-white/80 rounded-full px-2 py-1 text-xs font-medium flex items-center shadow-sm">
        <Info size={10} className="mr-1" />
        {dataType === 'landCover' ? 'Land Cover' : 
         dataType === 'precipitation' ? 'Precipitation' : 
         dataType === 'vegetation' ? 'Vegetation' : 'Population'}
      </div>
    </div>
  );
};

export default MapVisualization;
