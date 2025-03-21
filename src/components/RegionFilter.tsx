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
  return <Card className={className}>
      
      
      
    </Card>;
};
export default RegionFilter;