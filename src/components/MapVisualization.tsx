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
  dataType?: string;
  onStatsChange?: (stats: Record<string, number>) => void;
  expandedView?: boolean;
}

const MapVisualization = ({ 
  className, 
  year = 2023, 
  dataType = 'landCover',
  onStatsChange,
  expandedView = false
}: MapVisualizationProps) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLayer, setActiveLayer] = useState(dataType);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapData, setMapData] = useState<{
    [year: number]: { data: number[], width: number, height: number }
  }>({});
  const [currentStats, setCurrentStats] = useState<Record<string, number>>({});
  const [transitionAnimationId, setTransitionAnimationId] = useState<number | null>(null);
  const previousYearRef = useRef<number | null>(null);
  
  useEffect(() => {
    setActiveLayer(dataType);
  }, [dataType]);
  
  const { prevYear, nextYear, progress } = useMemo(() => {
    const availableYears = getAvailableYears();
    
    if (availableYears.includes(year)) {
      return { prevYear: year, nextYear: year, progress: 0 };
    }
    
    const prevYear = Math.max(...availableYears.filter(y => y <= year));
    const nextYear = Math.min(...availableYears.filter(y => y >= year));
    
    const yearRange = nextYear - prevYear;
    const progress = yearRange > 0 ? (year - prevYear) / yearRange : 0;
    
    return { prevYear, nextYear, progress };
  }, [year]);

  useEffect(() => {
    if (onStatsChange && Object.keys(currentStats).length > 0) {
      onStatsChange(currentStats);
    }
  }, [currentStats, onStatsChange]);

  useEffect(() => {
    const preloadAllYears = async () => {
      setIsLoading(true);
      
      try {
        const availableYears = getAvailableYears();
        
        for (const yearToLoad of availableYears) {
          if (!mapData[yearToLoad]) {
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
    
    return () => {
      if (transitionAnimationId !== null) {
        cancelAnimationFrame(transitionAnimationId);
      }
    };
  }, []);

  useEffect(() => {
    if (isLoading || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const prevYearData = mapData[prevYear];
    const nextYearData = mapData[nextYear];
    
    if (!prevYearData || prevYearData.data.length === 0) return;
    
    if (canvas.width !== prevYearData.width || canvas.height !== prevYearData.height) {
      canvas.width = prevYearData.width;
      canvas.height = prevYearData.height;
    }
    
    if (previousYearRef.current !== null && previousYearRef.current !== year) {
      if (transitionAnimationId !== null) {
        cancelAnimationFrame(transitionAnimationId);
      }
      
      const previousYear = previousYearRef.current;
      const previousPrevYear = Math.max(...getAvailableYears().filter(y => y <= previousYear));
      const previousNextYear = Math.min(...getAvailableYears().filter(y => y >= previousYear));
      const previousProgress = (previousYear - previousPrevYear) / (previousNextYear - previousPrevYear || 1);
      
      const startPrevData = mapData[previousPrevYear]?.data;
      const startNextData = mapData[previousNextYear]?.data;
      
      if (startPrevData && startNextData) {
        const startInterpolatedData = interpolateData(
          startPrevData,
          startNextData,
          previousProgress
        );
        
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
          
          renderTIFFToCanvas(
            ctx, 
            transitionData, 
            prevYearData.width, 
            prevYearData.height
          );
          
          if (animationProgress < 1) {
            const newAnimationId = requestAnimationFrame(animateTransition);
            setTransitionAnimationId(newAnimationId);
          } else {
            setTransitionAnimationId(null);
            setCurrentStats(calculateLandCoverStats(endInterpolatedData));
          }
        };
        
        const animationId = requestAnimationFrame(animateTransition);
        setTransitionAnimationId(animationId);
      }
    } else {
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
        
        const stats = calculateLandCoverStats(interpolatedData);
        setCurrentStats(stats);
      } else {
        renderTIFFToCanvas(
          ctx, 
          prevYearData.data, 
          prevYearData.width, 
          prevYearData.height
        );
        
        const stats = calculateLandCoverStats(prevYearData.data);
        setCurrentStats(stats);
      }
    }
    
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
      "relative rounded-xl overflow-hidden w-full h-full flex items-center justify-center", 
      className
    )}>
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
    </div>
  );
};

export default MapVisualization;
