
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Layers, Map, Mountain, Droplets, Globe } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface LayerSelectorProps {
  onLayerChange: (layer: string) => void;
  currentLayer: string;
  onToggleAdminLayer: (layer: string) => void;
  onToggleNetworkLayer: (layer: string) => void;
  showRegionBoundaries: boolean;
  showDistrictBoundaries: boolean;
  showRoadNetwork: boolean;
  showRiverNetwork: boolean;
}

const LayerSelector = ({ 
  onLayerChange, 
  currentLayer, 
  onToggleAdminLayer,
  onToggleNetworkLayer,
  showRegionBoundaries,
  showDistrictBoundaries,
  showRoadNetwork,
  showRiverNetwork
}: LayerSelectorProps) => {
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Base Layer</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
        <h3 className="text-lg font-medium mb-3">Administrative Overlays</h3>
        <div className="space-y-3">
          {adminLayers.map((layer) => (
            <div key={layer.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`admin-${layer.id}`} 
                checked={layer.id === 'region' ? showRegionBoundaries : showDistrictBoundaries}
                onCheckedChange={() => onToggleAdminLayer(layer.id)}
              />
              <Label 
                htmlFor={`admin-${layer.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {layer.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-3">Network Overlays</h3>
        <div className="space-y-3">
          {networkLayers.map((layer) => (
            <div key={layer.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`network-${layer.id}`} 
                checked={layer.id === 'roads' ? showRoadNetwork : showRiverNetwork}
                onCheckedChange={() => onToggleNetworkLayer(layer.id)}
              />
              <Label 
                htmlFor={`network-${layer.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {layer.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LayerSelector;
