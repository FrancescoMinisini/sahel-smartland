import { useEffect, useRef, useState, useMemo } from 'react';
import { cn } from "@/lib/utils";
import { Layers, ZoomIn, ZoomOut, RotateCcw, Eye, Loader2, Info } from 'lucide-react';
import { loadTIFF, renderTIFFToCanvas, interpolateData, landCoverColors, landCoverClasses, getAvailableYears, calculateLandCoverStats, calculatePrecipitationStats, calculateVegetationStats, calculatePopulationStats, precipitationColorScale, vegetationProductivityScale, populationDensityScale } from '@/lib/geospatialUtils';
import { useToast } from '@/components/ui/use-toast';
interface MapVisualizationProps {
  className?: string;
  year?: number;
  onStatsChange?: (stats: Record<string, number>) => void;
  expandedView?: boolean;
  dataType?: 'landCover' | 'vegetation' | 'precipitation' | 'population' | 'landCoverGradient' | 'vegetationGradient' | 'precipitationGradient';
}
const MapVisualization = ({
  className,
  year = 2023,
  onStatsChange,
  expandedView = false,
  dataType = 'landCover'
}: MapVisualizationProps) => {
  const {
    toast
  } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLayer, setActiveLayer] = useState(dataType);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapData, setMapData] = useState<{
    [dataType: string]: {
      [year: number]: {
        data: number[];
        width: number;
        height: number;
        min?: number;
        max?: number;
      };
    };
  }>({
    landCover: {},
    precipitation: {},
    vegetation: {},
    population: {},
    landCoverGradient: {},
    vegetationGradient: {},
    precipitationGradient: {}
  });
  const [currentStats, setCurrentStats] = useState<Record<string, number>>({});
  const [transitionAnimationId, setTransitionAnimationId] = useState<number | null>(null);
  const previousYearRef = useRef<number | null>(null);
  const previousDataTypeRef = useRef<string | null>(null);
  const {
    prevYear,
    nextYear,
    progress
  } = useMemo(() => {
    const availableYears = getAvailableYears(dataType);
    if (availableYears.includes(year)) {
      return {
        prevYear: year,
        nextYear: year,
        progress: 0
      };
    }
    const prevYear = Math.max(...availableYears.filter(y => y <= year));
    const nextYear = Math.min(...availableYears.filter(y => y >= year));
    const yearRange = nextYear - prevYear;
    const progress = yearRange > 0 ? (year - prevYear) / yearRange : 0;
    return {
      prevYear,
      nextYear,
      progress
    };
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
  }, [dataType, mapData, toast, transitionAnimationId]);
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
    const dataForType = mapData[dataType] || {};
    const prevYearData = dataForType[prevYear];
    if (!prevYearData) return;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const dataAspectRatio = prevYearData.width / prevYearData.height;
    let displayWidth, displayHeight;
    if (containerWidth / containerHeight > dataAspectRatio) {
      displayHeight = containerHeight;
      displayWidth = displayHeight * dataAspectRatio;
    } else {
      displayWidth = containerWidth;
      displayHeight = displayWidth / dataAspectRatio;
    }
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    const scaleFactor = dataType === 'precipitation' || dataType === 'vegetation' || dataType === 'population' ? 2 : 1;
    canvas.width = prevYearData.width * scaleFactor;
    canvas.height = prevYearData.height * scaleFactor;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(scaleFactor, scaleFactor);
      renderCurrentData();
    }
  };
  useEffect(() => {
    if (isLoading || !canvasRef.current || !containerRef.current) return;
    adjustCanvasSize();
    if (previousYearRef.current !== null && (previousYearRef.current !== year || previousDataTypeRef.current !== dataType)) {
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
  }, [mapData, prevYear, nextYear, progress, isLoading, year, dataType, transitionAnimationId]);
  const renderCurrentData = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const dataForType = mapData[dataType] || {};
    const prevYearData = dataForType[prevYear];
    const nextYearData = dataForType[nextYear];
    if (!prevYearData || prevYearData.data.length === 0) {
      console.error(`No data for ${dataType} for year ${prevYear}`);
      return;
    }
    let renderData;
    let min = 0;
    let max = 500;
    if (nextYearData && prevYear !== nextYear) {
      renderData = interpolateData(prevYearData.data, nextYearData.data, progress);
      if (dataType === 'precipitation') {
        min = 0;
        max = 500;
      } else if (dataType === 'vegetation') {
        const validPrevData = prevYearData.data.filter(val => val !== 65533 && val > 0 && val < 3000);
        const validNextData = nextYearData.data.filter(val => val !== 65533 && val > 0 && val < 3000);
        min = Math.min(validPrevData.length > 0 ? Math.min(...validPrevData) : 0, validNextData.length > 0 ? Math.min(...validNextData) : 0);
        max = Math.max(validPrevData.length > 0 ? Math.max(...validPrevData) : 3000, validNextData.length > 0 ? Math.max(...validNextData) : 3000);
      } else if (dataType === 'population') {
        min = 0;
        max = 1000;
      }
    } else {
      renderData = prevYearData.data;
      if (dataType === 'precipitation') {
        min = prevYearData.min || 0;
        max = prevYearData.max || 500;
      } else if (dataType === 'vegetation') {
        const validData = prevYearData.data.filter(val => val !== 65533 && val > 0 && val < 3000);
        min = validData.length > 0 ? Math.min(...validData) : 0;
        max = validData.length > 0 ? Math.max(...validData) : 3000;
      } else if (dataType === 'population') {
        min = prevYearData.min || 0;
        max = prevYearData.max || 1000;
      }
    }
    renderTIFFToCanvas(ctx, renderData, prevYearData.width, prevYearData.height, {
      opacity: 1,
      dataType,
      min,
      max,
      smoothing: dataType === 'precipitation' || dataType === 'vegetation' || dataType === 'population'
    });
    if (dataType === 'landCover') {
      const stats = calculateLandCoverStats(renderData);
      setCurrentStats(stats);
    } else if (dataType === 'precipitation') {
      const stats = calculatePrecipitationStats(renderData);
      setCurrentStats(stats);
    } else if (dataType === 'vegetation') {
      const stats = calculateVegetationStats(renderData);
      setCurrentStats(stats);
    } else if (dataType === 'population') {
      const stats = calculatePopulationStats(renderData);
      setCurrentStats(stats);
    }
  };
  const animateYearTransition = () => {
    const dataForType = mapData[dataType] || {};
    const prevYearData = dataForType[prevYear];
    const nextYearData = dataForType[nextYear];
    if (!canvasRef.current || !prevYearData || !nextYearData) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const previousYear = previousYearRef.current || year;
    const previousDataType = previousDataTypeRef.current || dataType;
    const previousData = mapData[previousDataType]?.[previousYear];
    if (!previousData) return;
    const startInterpolatedData = [...previousData.data];
    const endInterpolatedData = nextYearData && prevYear !== nextYear ? interpolateData(prevYearData.data, nextYearData.data, progress) : prevYearData.data;
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
      if (dataType === 'vegetation') {
        min = 0;
        max = 3000;
      } else if (dataType === 'population') {
        min = 0;
        max = 1000;
      }
      renderTIFFToCanvas(ctx, transitionData, prevYearData.width, prevYearData.height, {
        opacity: 1,
        dataType,
        min,
        max,
        smoothing: dataType === 'precipitation' || dataType === 'vegetation' || dataType === 'population'
      });
      if (animationProgress < 1) {
        const newAnimationId = requestAnimationFrame(animateTransition);
        setTransitionAnimationId(newAnimationId);
      } else {
        setTransitionAnimationId(null);
        if (dataType === 'landCover') {
          setCurrentStats(calculateLandCoverStats(endInterpolatedData));
        } else if (dataType === 'precipitation') {
          setCurrentStats(calculatePrecipitationStats(endInterpolatedData));
        } else if (dataType === 'vegetation') {
          setCurrentStats(calculateVegetationStats(endInterpolatedData));
        } else if (dataType === 'population') {
          setCurrentStats(calculatePopulationStats(endInterpolatedData));
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
  const handleLayerChange = (layer: 'landCover' | 'precipitation' | 'vegetation' | 'population' | 'landCoverGradient' | 'vegetationGradient' | 'precipitationGradient') => {
    setActiveLayer(layer);
  };
  const getMapDataType = () => {
    return activeLayer;
  };
  const mapLayers = [{
    id: 'landCover' as const,
    name: 'Land Cover',
    color: 'bg-sahel-green'
  }, {
    id: 'landCoverGradient' as const,
    name: 'Land Cover Gradient',
    color: 'bg-sahel-greenLight'
  }, {
    id: 'vegetation' as const,
    name: 'Vegetation',
    color: 'bg-sahel-greenLight'
  }, {
    id: 'vegetationGradient' as const,
    name: 'Vegetation Gradient',
    color: 'bg-sahel-earth'
  }, {
    id: 'precipitation' as const,
    name: 'Rainfall',
    color: 'bg-sahel-blue'
  }, {
    id: 'precipitationGradient' as const,
    name: 'Rainfall Gradient',
    color: 'bg-sahel-earthLight'
  }, {
    id: 'population' as const,
    name: 'Population',
    color: 'bg-sahel-earth'
  }];
  const getCurrentLayerName = () => {
    const currentLayer = mapLayers.find(layer => layer.id === activeLayer);
    return currentLayer ? currentLayer.name : 'Layer';
  };
  const renderLegend = () => {
    if (dataType === 'landCover') {
      const nonZeroClasses = {
        '7': 'Forests',
        '10': 'Grasslands',
        '12': 'Croplands',
        '13': 'Urban',
        '16': 'Barren'
      };
      return <div className="absolute bottom-3 left-3 bg-white/90 rounded-lg p-2 max-w-xs max-h-36 overflow-auto text-xs shadow-md">
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(nonZeroClasses).map(([key, name]) => <div key={key} className="flex items-center">
                <div className="w-3 h-3 rounded-sm mr-1" style={{
              backgroundColor: landCoverColors[Number(key) as keyof typeof landCoverColors]
            }} />
                <span className="truncate">{name}</span>
              </div>)}
          </div>
        </div>;
    } else if (dataType === 'landCoverGradient') {
      return <div className="absolute bottom-3 left-3 bg-white/90 rounded-lg p-2 shadow-md">
          <div className="flex flex-col">
            <span className="text-xs font-medium mb-1">Land Cover Change</span>
            <div className="flex h-4 w-full">
              {['#ef4444', '#f97316', '#3b82f6', '#84cc16', '#22c55e'].map((color, i) => <div key={i} className="h-full flex-1" style={{
              backgroundColor: color
            }} />)}
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>Degradation</span>
              <span>Stable</span>
              <span>Improvement</span>
            </div>
          </div>
        </div>;
    } else if (dataType === 'precipitation') {
      return <div className="absolute bottom-3 left-3 bg-white/90 rounded-lg p-2 shadow-md">
          <div className="flex flex-col">
            <span className="text-xs font-medium mb-1">Precipitation (mm)</span>
            <div className="flex h-4 w-full">
              {precipitationColorScale.map((color, i) => <div key={i} className="h-full flex-1" style={{
              backgroundColor: color
            }} />)}
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>0 mm</span>
              <span>500 mm</span>
            </div>
          </div>
        </div>;
    } else if (dataType === 'precipitationGradient') {
      return <div className="absolute bottom-3 left-3 bg-white/90 rounded-lg p-2 shadow-md">
          <div className="flex flex-col">
            <span className="text-xs font-medium mb-1">Precipitation Change</span>
            <div className="flex h-4 w-full">
              {['#ef4444', '#f97316', '#3b82f6', '#84cc16', '#22c55e'].map((color, i) => <div key={i} className="h-full flex-1" style={{
              backgroundColor: color
            }} />)}
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>Decrease</span>
              <span>Stable</span>
              <span>Increase</span>
            </div>
          </div>
        </div>;
    } else if (dataType === 'vegetation') {
      return <div className="absolute bottom-3 left-3 bg-white/90 rounded-lg p-2 shadow-md">
          <div className="flex flex-col">
            <span className="text-xs font-medium mb-1">GPP (gC/m²/year)</span>
            <div className="flex h-4 w-full">
              {vegetationProductivityScale.map((color, i) => <div key={i} className="h-full flex-1" style={{
              backgroundColor: color
            }} />)}
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>0</span>
              <span>3000</span>
            </div>
          </div>
        </div>;
    } else if (dataType === 'vegetationGradient') {
      return <div className="absolute bottom-3 left-3 bg-white/90 rounded-lg p-2 shadow-md">
          <div className="flex flex-col">
            <span className="text-xs font-medium mb-1">Vegetation Change</span>
            <div className="flex h-4 w-full">
              {['#ef4444', '#f97316', '#3b82f6', '#84cc16', '#22c55e'].map((color, i) => <div key={i} className="h-full flex-1" style={{
              backgroundColor: color
            }} />)}
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>Decrease</span>
              <span>Stable</span>
              <span>Increase</span>
            </div>
          </div>
        </div>;
    } else if (dataType === 'population') {
      return <div className="absolute bottom-3 left-3 bg-white/90 rounded-lg p-2 shadow-md">
          <div className="flex flex-col">
            <span className="text-xs font-medium mb-1">Population Density</span>
            <div className="flex h-4 w-full">
              {populationDensityScale.map((color, i) => <div key={i} className="h-full flex-1" style={{
              backgroundColor: color
            }} />)}
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>;
    }
    return null;
  };
  return <div className={cn("relative rounded-xl overflow-hidden w-full h-full flex items-center justify-center", className)} ref={containerRef}>
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10 bg-white/80 dark:bg-muted/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5 shadow-sm">
        {year}
      </div>
      
      <div className={`absolute inset-0 overflow-hidden ${dataType === 'precipitation' ? 'bg-[#f8fcfc]' : dataType === 'vegetation' ? 'bg-[#18441c]' : 'bg-[#504c4c]'}`}>
        {isLoading ? <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-neutral-600 animate-spin mb-3" />
              <p className="text-sm text-sahel-earth">Loading map data...</p>
            </div>
          </div> : <div className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out" style={{
        transform: `scale(${zoomLevel})`,
        maxWidth: "90%",
        margin: "0 auto",
        left: "5%",
        right: "5%"
      }}>
            <canvas ref={canvasRef} className="max-w-full max-h-full object-contain this canvas is not rendering correctly\n" />
          </div>}
      </div>
      
      <div className="absolute top-3 right-3 flex flex-col gap-1.5">
        <button onClick={handleZoomIn} className="w-7 h-7 bg-white rounded-lg shadow-md flex items-center justify-center text-sahel-earth hover:bg-neutral-200 hover:text-neutral-700 transition-colors" aria-label="Zoom in">
          <ZoomIn size={14} />
        </button>
        <button onClick={handleZoomOut} className="w-7 h-7 bg-white rounded-lg shadow-md flex items-center justify-center text-sahel-earth hover:bg-neutral-200 hover:text-neutral-700 transition-colors" aria-label="Zoom out">
          <ZoomOut size={14} />
        </button>
        <button onClick={handleResetView} className="w-7 h-7 bg-white rounded-lg shadow-md flex items-center justify-center text-sahel-earth hover:bg-neutral-200 hover:text-neutral-700 transition-colors" aria-label="Reset view">
          <RotateCcw size={14} />
        </button>
      </div>
      
      <div className="absolute top-3 left-3">
        <div className="bg-white rounded-lg shadow-md p-1.5">
          <div className="flex items-center gap-1 px-1.5">
            <Layers size={12} className="text-neutral-600" />
            <span className="text-xs font-medium">{getCurrentLayerName()}</span>
          </div>
        </div>
      </div>
      
      {renderLegend()}
    </div>;
};
export default MapVisualization;