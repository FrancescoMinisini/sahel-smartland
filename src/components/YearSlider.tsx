
import { useState, useEffect, useRef } from 'react';
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Play, Pause } from "lucide-react";

interface YearSliderProps {
  minYear?: number;
  maxYear?: number;
  min?: number; // Add support for both naming conventions
  max?: number; // Add support for both naming conventions
  initialValue?: number;
  value?: number;
  onChange?: (year: number) => void;
  onValueChange?: (year: number) => void;
  className?: string;
  showLabels?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  step?: number; // Add step property
}

const YearSlider = ({
  minYear,
  maxYear,
  min,
  max,
  initialValue,
  value,
  onChange,
  onValueChange,
  className,
  showLabels = true,
  autoPlay = false,
  autoPlayInterval = 1200,
  step = 1
}: YearSliderProps) => {
  // Use either minYear/maxYear or min/max
  const actualMinYear = minYear !== undefined ? minYear : (min !== undefined ? min : 2010);
  const actualMaxYear = maxYear !== undefined ? maxYear : (max !== undefined ? max : 2023);
  
  // Use value if provided, otherwise use initialValue or default
  const [currentYear, setCurrentYear] = useState<number>(
    value !== undefined ? value : (initialValue || actualMinYear)
  );
  
  // Update internal state when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setCurrentYear(value);
    }
  }, [value]);
  
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const autoPlayTimerRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const previousYearRef = useRef<number | null>(null);

  useEffect(() => {
    if (initialValue && initialValue >= actualMinYear && initialValue <= actualMaxYear) {
      setCurrentYear(initialValue);
    }
  }, [initialValue, actualMinYear, actualMaxYear]);

  // Handle auto-play functionality with optimization to prevent unnecessary data reloading
  useEffect(() => {
    if (isPlaying && !isDraggingRef.current) {
      // Clear any existing timer
      if (autoPlayTimerRef.current) {
        window.clearInterval(autoPlayTimerRef.current);
      }
      
      // Set up a new timer
      autoPlayTimerRef.current = window.setInterval(() => {
        setCurrentYear((prevYear) => {
          const nextYear = prevYear >= actualMaxYear ? actualMinYear : prevYear + step;
          
          // Only trigger onChange when the year actually changes and is different from previous
          if ((onChange || onValueChange) && nextYear !== previousYearRef.current) {
            previousYearRef.current = nextYear; // Set the previous year reference before triggering onChange
            if (onChange) onChange(nextYear);
            if (onValueChange) onValueChange(nextYear);
          }
          return nextYear;
        });
      }, autoPlayInterval);
    } else if (autoPlayTimerRef.current) {
      // Stop the timer if isPlaying is false
      window.clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }

    // Reset previousYearRef when play/pause state changes
    if (!isPlaying) {
      previousYearRef.current = null;
    }

    // Clean up the timer when component unmounts
    return () => {
      if (autoPlayTimerRef.current) {
        window.clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    };
  }, [isPlaying, actualMinYear, actualMaxYear, onChange, onValueChange, autoPlayInterval, step]);

  const handleSliderChange = (value: number[]) => {
    const year = value[0];
    if (year !== currentYear) {
      setCurrentYear(year);
      previousYearRef.current = year; // Set the previous year reference before triggering onChange
      if (onChange) {
        onChange(year);
      }
      if (onValueChange) {
        onValueChange(year);
      }
    }
  };

  const handleDragStart = () => {
    isDraggingRef.current = true;
    // Pause autoplay during dragging
    if (isPlaying && autoPlayTimerRef.current) {
      window.clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
    // Resume autoplay if it was playing
    if (isPlaying) {
      previousYearRef.current = currentYear; // Set current year as previous to avoid immediate retriggering
      
      if (autoPlayTimerRef.current) {
        window.clearInterval(autoPlayTimerRef.current);
      }
      
      autoPlayTimerRef.current = window.setInterval(() => {
        setCurrentYear((prevYear) => {
          const nextYear = prevYear >= actualMaxYear ? actualMinYear : prevYear + step;
          
          // Only trigger onChange when the year actually changes and is different from previous
          if ((onChange || onValueChange) && nextYear !== previousYearRef.current) {
            previousYearRef.current = nextYear; // Set before triggering onChange
            if (onChange) onChange(nextYear);
            if (onValueChange) onValueChange(nextYear);
          }
          return nextYear;
        });
      }, autoPlayInterval);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Reset previousYearRef when toggling play/pause
    previousYearRef.current = null;
  };

  // Calculate percentage position for the year label
  const yearPercentage = ((currentYear - actualMinYear) / (actualMaxYear - actualMinYear)) * 100;

  return (
    <div className={cn("relative pt-10 pb-8 w-full", className)}>
      <div className="flex items-center gap-2 w-full">
        {/* Play/Pause Button */}
        <button 
          onClick={togglePlayPause}
          className="p-1 bg-muted hover:bg-muted/80 rounded-full transition-colors flex-shrink-0"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5 text-primary" />
          ) : (
            <Play className="h-3.5 w-3.5 text-primary" />
          )}
        </button>
        
        <div className="relative flex-1 w-full">
          {/* Year Display - Above the slider */}
          <div 
            className="absolute text-sm font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-md transform -translate-x-1/2 -top-6 transition-all duration-150 z-10"
            style={{ left: `${yearPercentage}%` }}
          >
            {currentYear}
          </div>
          
          <Slider
            min={actualMinYear}
            max={actualMaxYear}
            step={step}
            value={[currentYear]}
            onValueChange={handleSliderChange}
            onValueCommit={() => handleDragEnd()}
            onPointerDown={handleDragStart}
            className="transition-all w-full"
          />
          
          {showLabels && (
            <div className="flex justify-between mt-2">
              <span className="text-xs text-muted-foreground">{actualMinYear}</span>
              <span className="text-xs text-muted-foreground">{actualMaxYear}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YearSlider;
