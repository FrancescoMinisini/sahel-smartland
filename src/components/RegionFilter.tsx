import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Check, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Region {
  id: string;
  name: string;
  color: string;
}

interface RegionFilterProps {
  regions: Region[];
  selectedRegions: string[];
  onChange: (selectedRegions: string[]) => void;
  className?: string;
}

const RegionFilter = ({ regions, selectedRegions, onChange, className }: RegionFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleRegion = (regionId: string) => {
    if (selectedRegions.includes(regionId)) {
      onChange(selectedRegions.filter(id => id !== regionId));
    } else {
      onChange([...selectedRegions, regionId]);
    }
    
    console.log("Region selection updated:", selectedRegions);
  };

  const toggleAll = () => {
    if (selectedRegions.length === regions.length) {
      onChange([]);
    } else {
      onChange(regions.map(region => region.id));
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3 pt-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center gap-1.5">
            <MapPin size={16} />
            <span>Spatial Filtering</span>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 w-7 p-0"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className={cn("pt-0 space-y-2", !isExpanded && "max-h-16 overflow-hidden")}>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="select-all" 
            checked={selectedRegions.length === regions.length} 
            onClick={toggleAll}
            className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          />
          <Label htmlFor="select-all" className="text-sm cursor-pointer">
            {selectedRegions.length === regions.length ? "Deselect All" : "Select All"}
          </Label>
        </div>
        
        <div className="space-y-1.5">
          {regions.map(region => (
            <div key={region.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`region-${region.id}`} 
                checked={selectedRegions.includes(region.id)}
                onClick={() => toggleRegion(region.id)}
                className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: region.color }} />
                <Label htmlFor={`region-${region.id}`} className="text-sm cursor-pointer">
                  {region.name}
                </Label>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RegionFilter;
