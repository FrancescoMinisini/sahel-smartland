
import { Layers, Eye } from 'lucide-react';
import { cn } from "@/lib/utils";
import { MapLayerType } from '@/types/map';

interface LayerSelectorProps {
  mapLayers: MapLayerType[];
  activeLayer: string;
  onLayerChange: (layer: string) => void;
}

const LayerSelector = ({ mapLayers, activeLayer, onLayerChange }: LayerSelectorProps) => {
  return (
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
              onClick={() => onLayerChange(layer.id)}
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
  );
};

export default LayerSelector;
