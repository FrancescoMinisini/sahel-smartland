
import { useState } from 'react';
import { Layers, Map, Mountain, Droplets, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LayerSelectorProps {
  onLayersChange: (layers: string[]) => void;
}

const LayerSelector = ({ onLayersChange }: LayerSelectorProps) => {
  const [selectedLayers, setSelectedLayers] = useState<string[]>(['landCover']);
  
  const availableLayers = [
    { id: 'landCover', name: 'Land Cover', icon: <Globe className="h-4 w-4" /> },
    { id: 'region', name: 'Region Borders', icon: <Map className="h-4 w-4" /> },
    { id: 'district', name: 'District Borders', icon: <Map className="h-4 w-4" /> },
    { id: 'road', name: 'Road Network', icon: <Mountain className="h-4 w-4" /> },
    { id: 'stream', name: 'Stream Water', icon: <Droplets className="h-4 w-4" /> },
  ];

  const handleLayerToggle = (layerId: string) => {
    setSelectedLayers((prev) => {
      // If the layer is being toggled off and it's 'landCover', don't remove it
      // to ensure there's always at least one base layer
      if (layerId === 'landCover' && prev.includes('landCover')) {
        return prev;
      }
      
      const newLayers = prev.includes(layerId)
        ? prev.filter(l => l !== layerId)
        : [...prev, layerId];
      
      onLayersChange(newLayers);
      return newLayers;
    });
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Map Layers</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {availableLayers.map((layer) => (
          <div key={layer.id} className="flex items-center space-x-2">
            <Checkbox 
              id={`layer-${layer.id}`}
              checked={selectedLayers.includes(layer.id)}
              onCheckedChange={() => handleLayerToggle(layer.id)}
              disabled={layer.id === 'landCover'} // Land cover is always enabled as the base layer
            />
            <label 
              htmlFor={`layer-${layer.id}`}
              className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {layer.icon}
              <span>{layer.name}</span>
              {layer.id === 'landCover' && (
                <span className="text-xs text-muted-foreground">(Base layer)</span>
              )}
            </label>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p>Toggle layers to customize the map visualization</p>
      </div>
    </Card>
  );
};

export default LayerSelector;
