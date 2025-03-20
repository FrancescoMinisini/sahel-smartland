
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
  onChange?: (year: number) => void;
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
  onChange,
  className,
  showLabels = true,
  autoPlay = false,
  autoPlayInterval = 1200,
  step = 1
}: YearSliderProps) => {
  // Use either minYear/maxYear or min/max
  const actualMinYear = minYear !== undefined ? minYear : (min !== undefined ? min : 2010);
  const actualMaxYear = maxYear !== undefined ? maxYear : (max !== undefined ? max : 2023);
  
  const [currentYear, setCurrentYear] = useState<number>(initialValue || actualMinYear);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const autoPlayTimerRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  useEffect(() => {
    if (initialValue && initialValue >= actualMinYear && initialValue <= actualMaxYear) {
      setCurrentYear(initialValue);
    }
  }, [initialValue, actualMinYear, actualMaxYear]);

  // Handle auto-play functionality
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
          if (onChange) {
            onChange(nextYear);
          }
          return nextYear;
        });
      }, autoPlayInterval);
    } else if (autoPlayTimerRef.current) {
      // Stop the timer if isPlaying is false
      window.clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }

    // Clean up the timer when component unmounts
    return () => {
      if (autoPlayTimerRef.current) {
        window.clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    };
  }, [isPlaying, actualMinYear, actualMaxYear, onChange, autoPlayInterval, step]);

  const handleSliderChange = (value: number[]) => {
    const year = value[0];
    setCurrentYear(year);
    if (onChange) {
      onChange(year);
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
      if (autoPlayTimerRef.current) {
        window.clearInterval(autoPlayTimerRef.current);
      }
      autoPlayTimerRef.current = window.setInterval(() => {
        setCurrentYear((prevYear) => {
          const nextYear = prevYear >= actualMaxYear ? actualMinYear : prevYear + step;
          if (onChange) {
            onChange(nextYear);
          }
          return nextYear;
        });
      }, autoPlayInterval);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Calculate percentage position for the year label
  const yearPercentage = ((currentYear - actualMinYear) / (actualMaxYear - actualMinYear)) * 100;

  return (
    <div className={cn("relative pt-6 pb-8 px-1 w-full", className)}>
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button 
          onClick={togglePlayPause}
          className="p-1.5 bg-muted hover:bg-muted/80 rounded-full transition-colors flex-shrink-0"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 text-primary" />
          ) : (
            <Play className="h-4 w-4 text-primary" />
          )}
        </button>
        
        <div className="relative flex-1 w-full">
          {/* Year Display */}
          <div 
            className="absolute text-sm font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-md transform -translate-x-1/2 -top-1 transition-all duration-150"
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
