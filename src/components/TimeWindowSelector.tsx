
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
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
  className,
}: TimeWindowSelectorProps) => {
  const handleChange = (values: number[]) => {
    if (values.length === 2) {
      onChange(values[0], values[1]);
    }
  };

  return (
    <Card className={className}>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Temporal Window</Label>
            <div className="flex items-center gap-1 text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded-md">
              <span>{startYear}</span>
              <ChevronRight size={14} />
              <span>{endYear}</span>
            </div>
          </div>

          <Slider
            value={[startYear, endYear]}
            min={minYear}
            max={maxYear}
            step={1}
            onValueChange={handleChange}
            className="py-4"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{minYear}</span>
            <span>{maxYear}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeWindowSelector;
