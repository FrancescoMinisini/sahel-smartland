
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

interface TimeWindowSelectorProps {
  startYear: number;
  endYear: number;
  minYear: number;
  maxYear: number;
  onChange: (startYear: number, endYear: number) => void;
  className?: string;
}

const TimeWindowSelector = ({
  startYear,
  endYear,
  minYear,
  maxYear,
  onChange,
  className
}: TimeWindowSelectorProps) => {
  const handleChange = (values: number[]) => {
    if (values.length === 2) {
      // Make sure start is always less than or equal to end
      const [newStart, newEnd] = values[0] <= values[1] ? [values[0], values[1]] : [values[1], values[0]];

      // Only trigger onChange if values actually changed
      if (newStart !== startYear || newEnd !== endYear) {
        onChange(newStart, newEnd);
      }
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Time Window Selection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">{startYear}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{endYear}</span>
          </div>
          <Slider 
            defaultValue={[startYear, endYear]} 
            min={minYear} 
            max={maxYear} 
            step={1} 
            onValueChange={handleChange}
            value={[startYear, endYear]}
          />
        </div>
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>{minYear}</span>
          <span>{maxYear}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeWindowSelector;
