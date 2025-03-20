
import { useEffect, useRef, useState } from 'react';
import { cn } from "@/lib/utils";
import { Layers, MapPin, ZoomIn, ZoomOut, RotateCcw, Eye, CornerUpRight, Calendar } from 'lucide-react';

interface MapVisualizationProps {
  className?: string;
  year?: number;
}

const MapVisualization = ({ className, year = 2023 }: MapVisualizationProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLayer, setActiveLayer] = useState('landCover');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Simulate map loading when year changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [year]);

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
        <Calendar size={12} />
        {year}
      </div>
      
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full aspect-[4/3] bg-sahel-sandLight"
        style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.3s ease' }}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-t-sahel-green border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm text-sahel-earth">Loading map data...</p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-sahel-sandLight to-sahel-sand">
            {/* This is a placeholder for the actual map visualization */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-sahel-earth/40 text-lg font-medium">
                Map Visualization Placeholder
              </div>
            </div>
            
            {/* Sample map elements */}
            <div className="absolute top-1/4 left-1/3 w-4 h-4 rounded-full bg-sahel-green animate-pulse"></div>
            <div className="absolute top-1/3 left-1/2 w-3 h-3 rounded-full bg-sahel-blue animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-1/2 left-1/4 w-5 h-5 rounded-full bg-sahel-earth animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            {/* Geographic features */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-1/4 left-1/3 right-1/3 h-0.5 bg-sahel-blue rounded-full"></div>
              <div className="absolute top-1/3 left-1/4 right-1/4 h-0.5 bg-sahel-blue rounded-full"></div>
              <div className="absolute top-1/2 left-1/5 right-1/5 h-0.5 bg-sahel-blue rounded-full"></div>
            </div>
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
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-3">
        <div className="flex items-center gap-2 mb-2">
          <CornerUpRight size={14} className="text-sahel-earth" />
          <span className="text-xs font-medium">Legend</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sahel-green"></span>
            <span className="text-xs">Restored Areas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sahel-blue"></span>
            <span className="text-xs">Water Bodies</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sahel-sand"></span>
            <span className="text-xs">Degraded Land</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sahel-earth"></span>
            <span className="text-xs">Urban Areas</span>
          </div>
        </div>
      </div>
      
      {/* Locations */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-3">
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={14} className="text-sahel-earth" />
          <span className="text-xs font-medium">Focus Areas</span>
        </div>
        <div className="space-y-2">
          <button className="flex items-center gap-2 text-xs hover:text-sahel-green transition-colors">
            <span className="w-2 h-2 rounded-full bg-sahel-green"></span>
            Senegal River Basin
          </button>
          <button className="flex items-center gap-2 text-xs hover:text-sahel-green transition-colors">
            <span className="w-2 h-2 rounded-full bg-sahel-blue"></span>
            Lake Chad
          </button>
          <button className="flex items-center gap-2 text-xs hover:text-sahel-green transition-colors">
            <span className="w-2 h-2 rounded-full bg-sahel-earth"></span>
            Niger Delta
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapVisualization;
