
import { useState } from 'react';
import { Layers, Map, Info, Eye, EyeOff, Filter, MapPin, Waves } from 'lucide-react';
import { cn } from "@/lib/utils";

interface LayersControlProps {
  activeLayers: Record<string, boolean>;
  onLayerToggle: (layerId: string) => void;
  className?: string;
}

const LayersControl = ({ activeLayers, onLayerToggle, className }: LayersControlProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const availableLayers = [
    { id: 'landCover', name: 'Land Cover', icon: <Map size={16} /> },
    { id: 'precipitation', name: 'Precipitation', icon: <Filter size={16} /> },
    { id: 'regionBoundaries', name: 'Region Boundaries', icon: <Layers size={16} /> },
    { id: 'districtBoundaries', name: 'District Boundaries', icon: <Layers size={16} /> },
    { id: 'roadNetwork', name: 'Road Network', icon: <MapPin size={16} /> },
    { id: 'riverNetwork', name: 'River Network', icon: <Waves size={16} /> }
  ];

  return (
    <div className={cn("absolute top-14 left-3 z-10", className)}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-sahel-earth hover:bg-sahel-green hover:text-white transition-colors"
        aria-label="Toggle layers panel"
      >
        <Layers size={16} />
      </button>
      
      {isExpanded && (
        <div className="mt-2 p-3 bg-white rounded-lg shadow-md w-48 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-gray-100">
            <Layers size={14} />
            <h3 className="text-sm font-medium">Map Layers</h3>
          </div>
          
          <div className="space-y-2">
            {availableLayers.map(layer => (
              <div 
                key={layer.id}
                className="flex items-center justify-between py-1.5 px-1 rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={() => onLayerToggle(layer.id)}
              >
                <div className="flex items-center gap-2">
                  {layer.icon}
                  <span className="text-sm">{layer.name}</span>
                </div>
                <button className="text-gray-500">
                  {activeLayers[layer.id] ? (
                    <Eye size={16} className="text-sahel-green" />
                  ) : (
                    <EyeOff size={16} className="text-gray-400" />
                  )}
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500 flex items-start gap-1.5">
            <Info size={12} className="mt-0.5 shrink-0" />
            <p>Toggle layers to customize your view</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayersControl;
