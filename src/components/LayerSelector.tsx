
import { useState } from 'react';
import { 
  Layers, 
  Map as MapIcon, 
  CloudRain, 
  Box, 
  Network, 
  MapPin 
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface LayerSelectorProps {
  activeLayer: string;
  onLayerChange: (layer: string) => void;
  showAdminBoundaries: boolean;
  showNetworks: boolean;
  onToggleAdminBoundaries: () => void;
  onToggleNetworks: () => void;
}

const LayerSelector = ({
  activeLayer,
  onLayerChange,
  showAdminBoundaries,
  showNetworks,
  onToggleAdminBoundaries,
  onToggleNetworks
}: LayerSelectorProps) => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Layers className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Layer Selection</h2>
        </div>
        
        <div className="space-y-4">
          <Tabs value={activeLayer} onValueChange={onLayerChange} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="landCover" className="flex gap-1.5 items-center">
                <MapIcon className="h-4 w-4" />
                Land Cover
              </TabsTrigger>
              <TabsTrigger value="precipitation" className="flex gap-1.5 items-center">
                <CloudRain className="h-4 w-4" />
                Precipitation
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="bg-muted/30 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-medium mb-2">Vector Overlays</h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="admin-boundaries" 
                checked={showAdminBoundaries}
                onCheckedChange={onToggleAdminBoundaries}
              />
              <Label htmlFor="admin-boundaries" className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Admin Boundaries
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="networks" 
                checked={showNetworks}
                onCheckedChange={onToggleNetworks}
              />
              <Label htmlFor="networks" className="flex items-center gap-1.5">
                <Network className="h-3.5 w-3.5 text-muted-foreground" />
                Roads & Rivers
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayerSelector;
