
import { useState, useRef, useEffect } from 'react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartCarouselProps {
  children: React.ReactNode[];
  className?: string;
}

const ChartCarousel = ({ children, className }: ChartCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = children.length;
  
  const handleSlideChange = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className={cn("w-full", className)}>
      <Carousel
        className="w-full"
        onSelect={(index) => handleSlideChange(index)}
      >
        <CarouselContent>
          {children.map((child, index) => (
            <CarouselItem key={index} className="w-full">
              {child}
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex items-center justify-between mt-4">
          <CarouselPrevious 
            variant="outline" 
            size="sm" 
            className="relative inset-0 translate-y-0 h-9 w-9 border-border/50"
          />
          
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 p-0",
                  currentSlide === index ? "text-primary" : "text-muted-foreground"
                )}
                onClick={() => handleSlideChange(index)}
              >
                <Circle 
                  className={cn(
                    "h-2 w-2", 
                    currentSlide === index ? "fill-primary" : "fill-transparent"
                  )} 
                />
              </Button>
            ))}
          </div>
          
          <CarouselNext 
            variant="outline" 
            size="sm" 
            className="relative inset-0 translate-y-0 h-9 w-9 border-border/50"
          />
        </div>
      </Carousel>
    </div>
  );
};

export default ChartCarousel;
