
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

const RegionFilter = ({
  regions,
  selectedRegions,
  onChange,
  className
}: RegionFilterProps) => {
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
      <CardHeader className="py-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center">
            <MapPin size={16} className="mr-2" /> 
            Region Filter
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="select-all" 
                checked={selectedRegions.length === regions.length} 
                onCheckedChange={toggleAll}
              />
              <Label htmlFor="select-all" className="text-sm font-medium">
                {selectedRegions.length === regions.length ? "Deselect All" : "Select All"}
              </Label>
            </div>
            
            {regions.map(region => (
              <div key={region.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`region-${region.id}`} 
                  checked={selectedRegions.includes(region.id)}
                  onCheckedChange={() => toggleRegion(region.id)}
                />
                <Label 
                  htmlFor={`region-${region.id}`} 
                  className="flex items-center text-sm"
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: region.color }}
                  />
                  {region.name}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default RegionFilter;
