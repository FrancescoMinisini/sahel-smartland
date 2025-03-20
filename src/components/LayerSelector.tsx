
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Layers, Map, Mountain, Droplets, Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LayerSelectorProps {
  onLayerChange: (layer: string) => void;
  currentLayer: string;
}

const LayerSelector = ({ onLayerChange, currentLayer }: LayerSelectorProps) => {
  const [showAdminLayers, setShowAdminLayers] = useState(false);
  const [showNetworkLayers, setShowNetworkLayers] = useState(false);

  const layers = [
    { id: 'landCover', name: 'Land Cover', icon: <Globe className="h-4 w-4" /> },
    { id: 'precipitation', name: 'Rainfall', icon: <Droplets className="h-4 w-4" /> },
    { id: 'vegetation', name: 'Vegetation', icon: <Mountain className="h-4 w-4" /> },
  ];

  const adminLayers = [
    { id: 'region', name: 'Region Boundaries' },
    { id: 'districts', name: 'District Boundaries' },
  ];

  const networkLayers = [
    { id: 'roads', name: 'Road Network' },
    { id: 'rivers', name: 'River Network' },
  ];

  const handleLayerChange = (layerId: string) => {
    onLayerChange(layerId);
  };

  const toggleAdminLayers = () => {
    setShowAdminLayers(!showAdminLayers);
  };

  const toggleNetworkLayers = () => {
    setShowNetworkLayers(!showNetworkLayers);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Base Layer</h3>
        <div className="grid grid-cols-3 gap-2">
          {layers.map((layer) => (
            <Button
              key={layer.id}
              variant={currentLayer === layer.id ? "default" : "outline"}
              className="flex items-center justify-center gap-2"
              onClick={() => handleLayerChange(layer.id)}
            >
              {layer.icon}
              <span>{layer.name}</span>
            </Button>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Administrative Overlays</h3>
        <div className="grid grid-cols-2 gap-2">
          {adminLayers.map((layer) => (
            <Button
              key={layer.id}
              variant="outline"
              className={`flex items-center justify-center ${showAdminLayers ? 'bg-muted' : ''}`}
              onClick={toggleAdminLayers}
            >
              <span>{layer.name}</span>
            </Button>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Network Overlays</h3>
        <div className="grid grid-cols-2 gap-2">
          {networkLayers.map((layer) => (
            <Button
              key={layer.id}
              variant="outline"
              className={`flex items-center justify-center ${showNetworkLayers ? 'bg-muted' : ''}`}
              onClick={toggleNetworkLayers}
            >
              <span>{layer.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LayerSelector;
