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
  return <Card className={className}>
      
    </Card>;
};
export default TimeWindowSelector;