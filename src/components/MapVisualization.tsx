
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
}

const MapVisualization = ({ className, year = 2023 }: MapVisualizationProps) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLayer, setActiveLayer] = useState('landCover');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapData, setMapData] = useState<{
    [year: number]: { data: number[], width: number, height: number }
  }>({});
  const [currentStats, setCurrentStats] = useState<Record<string, number>>({});
  
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

  // Load the data for the closest years
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Load data for both years needed for interpolation
        if (!mapData[prevYear]) {
          const data = await loadTIFF(prevYear);
          setMapData(prev => ({ ...prev, [prevYear]: data }));
        }
        
        if (prevYear !== nextYear && !mapData[nextYear]) {
          const data = await loadTIFF(nextYear);
          setMapData(prev => ({ ...prev, [nextYear]: data }));
        }
      } catch (error) {
        console.error('Error loading TIFF data:', error);
        toast({
          title: 'Error loading map data',
          description: 'Could not load the land cover data for the selected year.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [prevYear, nextYear, toast]);

  // Render the data to the canvas with interpolation
  useEffect(() => {
    if (isLoading || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const prevYearData = mapData[prevYear];
    const nextYearData = mapData[nextYear];
    
    if (!prevYearData || prevYearData.data.length === 0) return;
    
    // Set canvas dimensions
    canvas.width = prevYearData.width;
    canvas.height = prevYearData.height;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // If we have both years of data and they're different, interpolate
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
      setCurrentStats(calculateLandCoverStats(interpolatedData));
    } else {
      // Just render the previous year's data
      renderTIFFToCanvas(
        ctx, 
        prevYearData.data, 
        prevYearData.width, 
        prevYearData.height
      );
      
      // Update statistics
      setCurrentStats(calculateLandCoverStats(prevYearData.data));
    }
  }, [mapData, prevYear, nextYear, progress, isLoading]);

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
    <div className={cn("relative rounded-xl overflow-hidden shadow-lg", className)}>
      {/* Year indicator */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10 bg-white/80 dark:bg-muted/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5 shadow-sm">
        {year}
      </div>
      
      {/* Map Container */}
      <div className="w-full aspect-[4/3] bg-sahel-sandLight overflow-hidden relative">
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
      
      {/* Layer Selector */}
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
    </div>
  );
};

export default MapVisualization;
