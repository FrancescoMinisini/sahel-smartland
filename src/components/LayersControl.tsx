
import React from 'react';
import { Layers, MapPin, Droplets, Globe } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface LayerOption {
  id: string;
  name: string;
  type: 'base' | 'overlay';
  icon?: React.ReactNode;
}

interface LayersControlProps {
  options: LayerOption[];
  selectedBaseLayer: string;
  activeOverlays: string[];
  onBaseLayerChange: (layer: string) => void;
  onOverlayChange: (layers: string[]) => void;
}

const LayersControl: React.FC<LayersControlProps> = ({
  options,
  selectedBaseLayer,
  activeOverlays,
  onBaseLayerChange,
  onOverlayChange,
}) => {
  const baseLayers = options.filter(layer => layer.type === 'base');
  const overlayLayers = options.filter(layer => layer.type === 'overlay');

  const handleOverlayToggle = (id: string) => {
    if (activeOverlays.includes(id)) {
      onOverlayChange(activeOverlays.filter(layer => layer !== id));
    } else {
      onOverlayChange([...activeOverlays, id]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Layers</span>
        </div>
      </div>

      {baseLayers.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs text-muted-foreground">Base Layers</span>
          <ToggleGroup 
            type="single" 
            value={selectedBaseLayer} 
            onValueChange={(value) => {
              if (value) onBaseLayerChange(value);
            }}
            className="justify-start"
          >
            {baseLayers.map((layer) => (
              <ToggleGroupItem 
                key={layer.id} 
                value={layer.id} 
                size="sm"
                className="text-xs"
              >
                {layer.icon}
                <span className="ml-1.5">{layer.name}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}

      {overlayLayers.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs text-muted-foreground">Overlays</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between">
                <span>Select Overlays</span>
                <span className="ml-1 text-xs text-muted-foreground">
                  ({activeOverlays.length} active)
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel>Toggle Layers</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {overlayLayers.map((layer) => (
                <DropdownMenuCheckboxItem
                  key={layer.id}
                  checked={activeOverlays.includes(layer.id)}
                  onCheckedChange={() => handleOverlayToggle(layer.id)}
                >
                  <div className="flex items-center">
                    {layer.icon && <span className="mr-2">{layer.icon}</span>}
                    {layer.name}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

export default LayersControl;
