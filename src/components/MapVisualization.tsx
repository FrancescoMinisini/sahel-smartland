
import { useEffect, useRef, useState, useMemo } from 'react';
import { cn } from "@/lib/utils";
import { Layers, ZoomIn, ZoomOut, RotateCcw, Eye, Loader2, Info, Globe, MapPin, Droplets } from 'lucide-react';
import { 
  loadTIFF, 
  renderTIFFToCanvas, 
  interpolateData, 
  landCoverColors, 
  landCoverClasses,
  getAvailableYears,
  calculateLandCoverStats,
  calculatePrecipitationStats,
  precipitationColorScale,
  loadVectorLayer,
  renderVectorLayer,
  vectorLayerStyles
} from '@/lib/geospatialUtils';
import { useToast } from '@/components/ui/use-toast';
import LayersControl, { LayerOption } from './LayersControl';

interface MapVisualizationProps {
  className?: string;
  year?: number;
  onStatsChange?: (stats: Record<string, number>) => void;
  expandedView?: boolean;
  dataType?: 'landCover' | 'precipitation';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLayer, setActiveLayer] = useState<string>(dataType);
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
  const [vectorData, setVectorData] = useState<{
    [layerType: string]: any[]
  }>({
    region: [],
    district: [],
    road: [],
    stream: []
  });
  const [selectedBaseLayer, setSelectedBaseLayer] = useState<string>(dataType);
  const [activeOverlays, setActiveOverlays] = useState<string[]>([]);
  const [currentStats, setCurrentStats] = useState<Record<string, number>>({});
  const [transitionAnimationId, setTransitionAnimationId] = useState<number | null>(null);
  const previousYearRef = useRef<number | null>(null);
  const previousDataTypeRef = useRef<string | null>(null);

  // Define layer options
  const layerOptions: LayerOption[] = [
    { id: 'landCover', name: 'Land Cover', type: 'base', icon: <Layers size={12} /> },
    { id: 'precipitation', name: 'Precipitation', type: 'base', icon: <Eye size={12} /> },
    { id: 'region', name: 'Region Boundaries', type: 'overlay', icon: <Globe size={12} /> },
    { id: 'district', name: 'District Boundaries', type: 'overlay', icon: <Globe size={12} /> },
    { id: 'road', name: 'Road Network', type: 'overlay', icon: <MapPin size={12} /> },
    { id: 'stream', name: 'Stream Network', type: 'overlay', icon: <Droplets size={12} /> },
  ];
  
  const { prevYear, nextYear, progress } = useMemo(() => {
    const availableYears = getAvailableYears(dataType);
    
    if (availableYears.includes(year)) {
      return { prevYear: year, nextYear: year, progress: 0 };
    }
    
    const prevYear = Math.max(...availableYears.filter(y => y <= year));
    const nextYear = Math.min(...availableYears.filter(y => y >= year));
    
    const yearRange = nextYear - prevYear;
    const progress = yearRange > 0 ? (year - prevYear) / yearRange : 0;
    
    return { prevYear, nextYear, progress };
  }, [year, dataType]);

  useEffect(() => {
    if (onStatsChange && Object.keys(currentStats).length > 0) {
      onStatsChange(currentStats);
    }
  }, [currentStats, onStatsChange]);

  useEffect(() => {
    setActiveLayer(dataType);
    previousDataTypeRef.current = dataType;
  }, [dataType]);

  // Load vector layers on component mount
  useEffect(() => {
    const loadVectorLayers = async () => {
      const vectorLayerTypes = ['region', 'district', 'road', 'stream'] as const;
      
      for (const layerType of vectorLayerTypes) {
        try {
          const features = await loadVectorLayer(layerType);
          console.log(`Loaded ${features.length} features for layer type: ${layerType}`);
          
          setVectorData(prev => ({
            ...prev,
            [layerType]: features
          }));
        } catch (error) {
          console.error(`Error loading ${layerType} vector layer:`, error);
          toast({
            title: `Error loading ${layerType} data`,
            description: `Could not load the ${layerType} boundaries.`,
            variant: 'destructive'
          });
        }
      }
    };
    
    loadVectorLayers();
  }, [toast]);

  useEffect(() => {
    const preloadAllYears = async () => {
      setIsLoading(true);
      
      try {
        const availableYears = getAvailableYears(dataType);
        
        for (const yearToLoad of availableYears) {
          if (!mapData[dataType]?.[yearToLoad]) {
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
    
    if (!mapData[dataType] || Object.keys(mapData[dataType]).length === 0) {
      preloadAllYears();
    } else {
      setIsLoading(false);
    }
    
    return () => {
      if (transitionAnimationId !== null) {
        cancelAnimationFrame(transitionAnimationId);
      }
    };
  }, [dataType]);

  // Resize handler to maintain proper canvas dimensions
  useEffect(() => {
    const handleResize = () => {
      if (isLoading || !canvasRef.current || !containerRef.current) return;
      adjustCanvasSize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isLoading]);

  const adjustCanvasSize = () => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const dataForType = mapData[selectedBaseLayer] || {};
    const prevYearData = dataForType[prevYear];
    
    if (!prevYearData) return;
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const dataAspectRatio = prevYearData.width / prevYearData.height;
    
    // Set canvas display size to fill the container while maintaining aspect ratio
    let displayWidth, displayHeight;
    
    if (containerWidth / containerHeight > dataAspectRatio) {
      // Container is wider than data
      displayHeight = containerHeight;
      displayWidth = displayHeight * dataAspectRatio;
    } else {
      // Container is taller than data
      displayWidth = containerWidth;
      displayHeight = displayWidth / dataAspectRatio;
    }
    
    // Apply CSS sizing (this is what's visually shown)
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    
    // For better rendering quality, set canvas dimensions higher than display size
    const scaleFactor = selectedBaseLayer === 'precipitation' ? 2 : 1; // Higher resolution for precipitation
    canvas.width = prevYearData.width * scaleFactor; 
    canvas.height = prevYearData.height * scaleFactor;
    
    // Render with the adjusted canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(scaleFactor, scaleFactor);
      renderCurrentData();
    }
  };

  useEffect(() => {
    if (isLoading || !canvasRef.current || !containerRef.current) return;
    
    adjustCanvasSize();
    
    if (previousYearRef.current !== null && 
        (previousYearRef.current !== year || previousDataTypeRef.current !== dataType)) {
      if (transitionAnimationId !== null) {
        cancelAnimationFrame(transitionAnimationId);
      }
      
      const dataTypeChanged = previousDataTypeRef.current !== dataType;
      
      if (dataTypeChanged) {
        renderCurrentData();
      } else {
        animateYearTransition();
      }
    } else {
      renderCurrentData();
    }
    
    previousYearRef.current = year;
    previousDataTypeRef.current = dataType;
  }, [mapData, prevYear, nextYear, progress, isLoading, year, dataType, transitionAnimationId, selectedBaseLayer, activeOverlays]);

  const renderCurrentData = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas before drawing
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Render the base layer (land cover or precipitation)
    const dataForType = mapData[selectedBaseLayer] || {};
    const prevYearData = dataForType[prevYear];
    const nextYearData = dataForType[nextYear];
    
    if (prevYearData && prevYearData.data.length > 0) {
      let renderData;
      let min = 0;
      let max = 500;
      
      if (nextYearData && prevYear !== nextYear) {
        renderData = interpolateData(
          prevYearData.data,
          nextYearData.data,
          progress
        );
        
        if (selectedBaseLayer === 'precipitation') {
          min = 0;
          max = 500;
        }
      } else {
        renderData = prevYearData.data;
      }
      
      // Use the enhanced rendering with appropriate options for the base layer
      renderTIFFToCanvas(
        ctx, 
        renderData, 
        prevYearData.width, 
        prevYearData.height,
        {
          opacity: 1,
          dataType: selectedBaseLayer,
          min,
          max,
          smoothing: selectedBaseLayer === 'precipitation'
        }
      );
      
      if (selectedBaseLayer === 'landCover') {
        const stats = calculateLandCoverStats(renderData);
        setCurrentStats(stats);
      } else if (selectedBaseLayer === 'precipitation') {
        const stats = calculatePrecipitationStats(renderData);
        setCurrentStats(stats);
      }
    } else {
      console.warn(`No data available for ${selectedBaseLayer} at year ${prevYear}`);
    }
    
    // Render overlay layers on top of the base layer
    for (const overlayId of activeOverlays) {
      const overlayFeatures = vectorData[overlayId];
      if (overlayFeatures && overlayFeatures.length > 0) {
        const canvasWidth = canvasRef.current.width;
        const canvasHeight = canvasRef.current.height;
        
        renderVectorLayer(
          ctx,
          overlayFeatures,
          overlayId as 'region' | 'district' | 'road' | 'stream',
          canvasWidth,
          canvasHeight,
          0.8
        );
      } else {
        console.warn(`No vector data available for overlay: ${overlayId}`);
      }
    }
  };

  const animateYearTransition = () => {
    const dataForType = mapData[selectedBaseLayer] || {};
    const prevYearData = dataForType[prevYear];
    const nextYearData = dataForType[nextYear];
    
    if (!canvasRef.current || !prevYearData) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const previousYear = previousYearRef.current || year;
    const previousDataType = previousDataTypeRef.current || dataType;
    const previousData = mapData[previousDataType]?.[previousYear];
    
    if (!previousData) return;
    
    const startInterpolatedData = [...previousData.data];
    
    const endInterpolatedData = nextYearData && prevYear !== nextYear
      ? interpolateData(prevYearData.data, nextYearData.data, progress)
      : prevYearData.data;
    
    let animationProgress = 0;
    const animationDuration = 500;
    const startTime = performance.now();
    
    const animateTransition = (time: number) => {
      animationProgress = Math.min((time - startTime) / animationDuration, 1);
      
      const transitionData = startInterpolatedData.map((startValue, index) => {
        if (animationProgress >= 1) {
          return endInterpolatedData[index];
        }
        
        return Math.random() < animationProgress ? endInterpolatedData[index] : startValue;
      });
      
      let min = 0;
      let max = 500;
      
      // Clear canvas before drawing
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      
      renderTIFFToCanvas(
        ctx, 
        transitionData, 
        prevYearData.width, 
        prevYearData.height,
        {
          opacity: 1,
          dataType: selectedBaseLayer,
          min,
          max,
          smoothing: selectedBaseLayer === 'precipitation'
        }
      );
      
      // Render overlay layers after the base layer
      for (const overlayId of activeOverlays) {
        const overlayFeatures = vectorData[overlayId];
        if (overlayFeatures && overlayFeatures.length > 0) {
          const canvasWidth = canvasRef.current!.width;
          const canvasHeight = canvasRef.current!.height;
          
          renderVectorLayer(
            ctx,
            overlayFeatures,
            overlayId as 'region' | 'district' | 'road' | 'stream',
            canvasWidth,
            canvasHeight,
            0.8
          );
        }
      }
      
      if (animationProgress < 1) {
        const newAnimationId = requestAnimationFrame(animateTransition);
        setTransitionAnimationId(newAnimationId);
      } else {
        setTransitionAnimationId(null);
        if (selectedBaseLayer === 'landCover') {
          setCurrentStats(calculateLandCoverStats(endInterpolatedData));
        } else if (selectedBaseLayer === 'precipitation') {
          setCurrentStats(calculatePrecipitationStats(endInterpolatedData));
        }
      }
    };
    
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

  const handleBaseLayerChange = (layerId: string) => {
    setSelectedBaseLayer(layerId);
    setActiveLayer(layerId);
  };

  const handleOverlayChange = (overlayIds: string[]) => {
    setActiveOverlays(overlayIds);
    renderCurrentData();
  };

  const renderLegend = () => {
    if (selectedBaseLayer === 'landCover') {
      return (
        <div className="absolute bottom-3 left-3 bg-white/90 rounded-lg p-2 max-w-xs max-h-36 overflow-auto text-xs shadow-md">
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(landCoverClasses)
              .filter(([key]) => key !== '0')
              .map(([key, name]) => (
                <div key={key} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-sm mr-1"
                    style={{ backgroundColor: landCoverColors[Number(key) as keyof typeof landCoverColors] }}
                  />
                  <span className="truncate">{name}</span>
                </div>
              ))}
          </div>
        </div>
      );
    } else if (selectedBaseLayer === 'precipitation') {
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
              <span>0 mm</span>
              <span>500 mm</span>
            </div>
          </div>
        </div>
      );
    }
    
    // Add legend for vector layers if any are active
    if (activeOverlays.length > 0) {
      return (
        <div className="absolute bottom-3 right-3 bg-white/90 rounded-lg p-2 shadow-md">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium">Overlays</span>
            {activeOverlays.map(overlayId => {
              const style = vectorLayerStyles[overlayId as keyof typeof vectorLayerStyles];
              const layerOption = layerOptions.find(l => l.id === overlayId);
              
              return (
                <div key={overlayId} className="flex items-center">
                  <div 
                    className="w-3 h-3 mr-1"
                    style={{ 
                      backgroundColor: overlayId.includes('road') || overlayId.includes('stream') 
                        ? 'transparent'
                        : style.fillColor || 'transparent',
                      borderColor: style.lineColor,
                      borderWidth: style.lineWidth,
                      borderStyle: 'solid'
                    }}
                  />
                  <span className="text-xs truncate">{layerOption?.name}</span>
                </div>
              );
            })}
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
    )} ref={containerRef}>
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10 bg-white/80 dark:bg-muted/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5 shadow-sm">
        {year}
      </div>
      
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
      
      <div className="absolute top-3 left-3 bg-white/90 rounded-lg shadow-md p-2 max-w-[200px]">
        <LayersControl
          options={layerOptions}
          selectedBaseLayer={selectedBaseLayer}
          activeOverlays={activeOverlays}
          onBaseLayerChange={handleBaseLayerChange}
          onOverlayChange={handleOverlayChange}
        />
      </div>
      
      {renderLegend()}
    </div>
  );
};

export default MapVisualization;
