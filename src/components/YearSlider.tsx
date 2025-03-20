
import { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface YearSliderProps {
  minYear: number;
  maxYear: number;
  initialValue?: number;
  onChange?: (year: number) => void;
  className?: string;
  showLabels?: boolean;
}

const YearSlider = ({
  minYear,
  maxYear,
  initialValue,
  onChange,
  className,
  showLabels = true
}: YearSliderProps) => {
  const [currentYear, setCurrentYear] = useState<number>(initialValue || minYear);

  useEffect(() => {
    if (initialValue && initialValue >= minYear && initialValue <= maxYear) {
      setCurrentYear(initialValue);
    }
  }, [initialValue, minYear, maxYear]);

  const handleSliderChange = (value: number[]) => {
    const year = value[0];
    setCurrentYear(year);
    if (onChange) {
      onChange(year);
    }
  };

  // Calculate percentage position for the year label
  const yearPercentage = ((currentYear - minYear) / (maxYear - minYear)) * 100;

  return (
    <div className={cn("relative pt-6 pb-8 px-1", className)}>
      {/* Year Display */}
      <div 
        className="absolute text-sm font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-md transform -translate-x-1/2 -top-1 transition-all duration-200"
        style={{ left: `${yearPercentage}%` }}
      >
        {currentYear}
      </div>
      
      <Slider
        min={minYear}
        max={maxYear}
        step={1}
        value={[currentYear]}
        onValueChange={handleSliderChange}
      />
      
      {showLabels && (
        <div className="flex justify-between mt-2">
          <span className="text-xs text-muted-foreground">{minYear}</span>
          <span className="text-xs text-muted-foreground">{maxYear}</span>
        </div>
      )}
    </div>
  );
};

export default YearSlider;
