
import { useEffect, useRef, useState, useMemo } from 'react';
import { cn } from "@/lib/utils";
import { Layers, ZoomIn, ZoomOut, RotateCcw, Eye, Loader2 } from 'lucide-react';
import { 
  loadTIFF, 
  renderTIFFToCanvas, 
  interpolateData, 
  landCoverColors, 
  landCoverClasses,
  getAvailableYears,
  calculateLandCoverStats
} from '@/lib/geospatialUtils';
import { useToast } from '@/components/ui/use-toast';

interface MapVisualizationProps {
  className?: string;
  year?: number;
  onStatsChange?: (stats: Record<string, number>) => void;
  expandedView?: boolean; // New prop to control expanded view mode
}

const MapVisualization = ({ 
  className, 
  year = 2023, 
  onStatsChange,
  expandedView = false // Default to false for backwards compatibility
}: MapVisualizationProps) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLayer, setActiveLayer] = useState('landCover');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapData, setMapData] = useState<{
    [year: number]: { data: number[], width: number, height: number }
  }>({});
  const [currentStats, setCurrentStats] = useState<Record<string, number>>({});
  const [transitionAnimationId, setTransitionAnimationId] = useState<number | null>(null);
  const previousYearRef = useRef<number | null>(null);
  
  // Find the closest available years for interpolation
  const { prevYear, nextYear, progress } = useMemo(() => {
    const availableYears = getAvailableYears();
    
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
  }, [year]);

  // Notify parent component when stats change
  useEffect(() => {
    if (onStatsChange && Object.keys(currentStats).length > 0) {
      onStatsChange(currentStats);
    }
  }, [currentStats, onStatsChange]);

  // Preload data for all years when the component mounts
  useEffect(() => {
    const preloadAllYears = async () => {
      setIsLoading(true);
      
      try {
        // Get all available years
        const availableYears = getAvailableYears();
        
        // Create a queue to load years in sequence
        for (const yearToLoad of availableYears) {
          if (!mapData[yearToLoad]) {
            // Load data for this year
            const data = await loadTIFF(yearToLoad);
            setMapData(prev => ({ ...prev, [yearToLoad]: data }));
          }
        }
      } catch (error) {
        console.error('Error preloading TIFF data:', error);
        toast({
          title: 'Error loading map data',
          description: 'Could not preload all the land cover data years.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    preloadAllYears();
    
    // Cleanup function
    return () => {
      if (transitionAnimationId !== null) {
        cancelAnimationFrame(transitionAnimationId);
      }
    };
  }, []);

  // Render the map with smooth transitions when the year changes
  useEffect(() => {
    if (isLoading || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const prevYearData = mapData[prevYear];
    const nextYearData = mapData[nextYear];
    
    if (!prevYearData || prevYearData.data.length === 0) return;
    
    // Set canvas dimensions if not already set
    if (canvas.width !== prevYearData.width || canvas.height !== prevYearData.height) {
      canvas.width = prevYearData.width;
      canvas.height = prevYearData.height;
    }
    
    // Handle smooth transition when year changes
    if (previousYearRef.current !== null && previousYearRef.current !== year) {
      // Cancel any existing animation
      if (transitionAnimationId !== null) {
        cancelAnimationFrame(transitionAnimationId);
      }
      
      // Determine the previous year's data
      const previousYear = previousYearRef.current;
      const previousPrevYear = Math.max(...getAvailableYears().filter(y => y <= previousYear));
      const previousNextYear = Math.min(...getAvailableYears().filter(y => y >= previousYear));
      const previousProgress = (previousYear - previousPrevYear) / (previousNextYear - previousPrevYear || 1);
      
      const startPrevData = mapData[previousPrevYear]?.data;
      const startNextData = mapData[previousNextYear]?.data;
      
      if (startPrevData && startNextData) {
        // Create a starting interpolated data
        const startInterpolatedData = interpolateData(
          startPrevData,
          startNextData,
          previousProgress
        );
        
        // Create ending interpolated data
        const endInterpolatedData = nextYearData && prevYear !== nextYear
          ? interpolateData(prevYearData.data, nextYearData.data, progress)
          : prevYearData.data;
        
        // Animate between the two interpolated states
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
          
          // Render the transitional state
          renderTIFFToCanvas(
            ctx, 
            transitionData, 
            prevYearData.width, 
            prevYearData.height
          );
          
          // Continue animation if not complete
          if (animationProgress < 1) {
            const newAnimationId = requestAnimationFrame(animateTransition);
            setTransitionAnimationId(newAnimationId);
          } else {
            setTransitionAnimationId(null);
            // Update statistics after animation completes
            setCurrentStats(calculateLandCoverStats(endInterpolatedData));
          }
        };
        
        // Start the animation
        const animationId = requestAnimationFrame(animateTransition);
        setTransitionAnimationId(animationId);
      }
    } else {
      // Regular render without transition animation
      if (nextYearData && prevYear !== nextYear) {
        const interpolatedData = interpolateData(
          prevYearData.data,
          nextYearData.data,
          progress
        );
        
        renderTIFFToCanvas(
          ctx, 
          interpolatedData, 
          prevYearData.width, 
          prevYearData.height
        );
        
        // Update statistics
        const stats = calculateLandCoverStats(interpolatedData);
        setCurrentStats(stats);
      } else {
        // Just render the previous year's data
        renderTIFFToCanvas(
          ctx, 
          prevYearData.data, 
          prevYearData.width, 
          prevYearData.height
        );
        
        // Update statistics
        const stats = calculateLandCoverStats(prevYearData.data);
        setCurrentStats(stats);
      }
    }
    
    // Update the previous year ref
    previousYearRef.current = year;
  }, [mapData, prevYear, nextYear, progress, isLoading, year, transitionAnimationId]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetView = () => {
    setZoomLevel(1);
  };

  const handleLayerChange = (layer: string) => {
    setActiveLayer(layer);
  };

  const mapLayers = [
    { id: 'landCover', name: 'Land Cover', color: 'bg-sahel-green' },
    { id: 'vegetation', name: 'Vegetation', color: 'bg-sahel-greenLight' },
    { id: 'rainfall', name: 'Rainfall', color: 'bg-sahel-blue' },
    { id: 'population', name: 'Population', color: 'bg-sahel-earth' },
  ];

  return (
    <div className={cn(
      "relative rounded-xl overflow-hidden shadow-lg", 
      expandedView ? "w-full" : "", // Apply full width if expanded
      className
    )}>
      {/* Year indicator */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10 bg-white/80 dark:bg-muted/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5 shadow-sm">
        {year}
      </div>
      
      {/* Map Container - Adjust aspect ratio based on expanded view */}
      <div className={cn(
        "w-full bg-sahel-sandLight overflow-hidden relative",
        expandedView ? "aspect-[16/9]" : "aspect-[4/3]" // Wider aspect ratio when expanded
      )}>
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
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button 
          onClick={handleZoomIn} 
          className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-sahel-earth hover:bg-sahel-green hover:text-white transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn size={16} />
        </button>
        <button 
          onClick={handleZoomOut} 
          className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-sahel-earth hover:bg-sahel-green hover:text-white transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut size={16} />
        </button>
        <button 
          onClick={handleResetView} 
          className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-sahel-earth hover:bg-sahel-green hover:text-white transition-colors"
          aria-label="Reset view"
        >
          <RotateCcw size={16} />
        </button>
      </div>
      
      {/* Layer Selector - Only show if not in expanded view */}
      {!expandedView && (
        <div className="absolute top-4 left-4">
          <div className="bg-white rounded-lg shadow-md p-2">
            <div className="flex items-center gap-2 mb-2 px-2">
              <Layers size={14} className="text-sahel-earth" />
              <span className="text-xs font-medium">Layers</span>
            </div>
            <div className="space-y-1">
              {mapLayers.map(layer => (
                <button
                  key={layer.id}
                  onClick={() => handleLayerChange(layer.id)}
                  className={cn(
                    "w-full text-left px-3 py-1.5 text-xs rounded-md flex items-center gap-2 transition-colors",
                    activeLayer === layer.id ? "bg-sahel-green/10 text-sahel-green" : "text-sahel-earth hover:bg-muted"
                  )}
                >
                  <span className={cn("w-2 h-2 rounded-full", layer.color)}></span>
                  {layer.name}
                  {activeLayer === layer.id && <Eye size={12} className="ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapVisualization;
