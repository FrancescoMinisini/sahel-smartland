
import { useEffect, useRef } from 'react';
import { renderTIFFToCanvas, interpolateData } from '@/lib/geospatialUtils';
import { Loader2 } from 'lucide-react';

interface MapRendererProps {
  isLoading: boolean;
  mapData: {
    [year: number]: { data: number[], width: number, height: number }
  };
  prevYear: number;
  nextYear: number;
  progress: number;
  zoomLevel: number;
  year: number;
  transitionAnimationId: number | null;
  setTransitionAnimationId: (id: number | null) => void;
  previousYearRef: React.MutableRefObject<number | null>;
  setCurrentStats: (stats: Record<string, number>) => void;
}

const MapRenderer = ({
  isLoading,
  mapData,
  prevYear,
  nextYear,
  progress,
  zoomLevel,
  year,
  transitionAnimationId,
  setTransitionAnimationId,
  previousYearRef,
  setCurrentStats
}: MapRendererProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // This useEffect handles map rendering and transitions
  useEffect(() => {
    if (isLoading || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const prevYearData = mapData[prevYear];
    const nextYearData = mapData[nextYear];
    
    if (!prevYearData || prevYearData.data.length === 0) return;
    
    // Set canvas dimensions if not already set
    if (canvas.width !== prevYearData.width || canvas.height !== prevYearData.height) {
      canvas.width = prevYearData.width;
      canvas.height = prevYearData.height;
    }
    
    // Handle smooth transition when year changes
    if (previousYearRef.current !== null && previousYearRef.current !== year) {
      // Cancel any existing animation
      if (transitionAnimationId !== null) {
        cancelAnimationFrame(transitionAnimationId);
      }
      
      // Get previous year's data for transition
      const startPrevData = mapData[prevYear]?.data;
      const startNextData = mapData[nextYear]?.data;
      
      if (startPrevData && startNextData) {
        // Create a starting interpolated data
        const startInterpolatedData = startPrevData;
        
        // Create ending interpolated data
        const endInterpolatedData = nextYearData && prevYear !== nextYear
          ? interpolateData(prevYearData.data, nextYearData.data, progress)
          : prevYearData.data;
        
        // Animate between the two interpolated states
        let animationProgress = 0;
        const animationDuration = 500; // ms
        const startTime = performance.now();
        
        const animateTransition = (time: number) => {
          // Calculate progress for the animation
          animationProgress = Math.min((time - startTime) / animationDuration, 1);
          
          // Interpolate between the start and end states
          const transitionData = startInterpolatedData.map((startValue, index) => {
            if (animationProgress >= 1) {
              return endInterpolatedData[index];
            }
            
            // Use progress to determine which value to show
            return Math.random() < animationProgress ? endInterpolatedData[index] : startValue;
          });
          
          // Render the transitional state
          renderTIFFToCanvas(
            ctx, 
            transitionData, 
            prevYearData.width, 
            prevYearData.height
          );
          
          // Continue animation if not complete
          if (animationProgress < 1) {
            const newAnimationId = requestAnimationFrame(animateTransition);
            setTransitionAnimationId(newAnimationId);
          } else {
            setTransitionAnimationId(null);
            // Update statistics after animation completes
            setCurrentStats(calculateLandCoverStats(endInterpolatedData));
          }
        };
        
        // Start the animation
        const animationId = requestAnimationFrame(animateTransition);
        setTransitionAnimationId(animationId);
      }
    } else {
      // Regular render without transition animation
      if (nextYearData && prevYear !== nextYear) {
        const interpolatedData = interpolateData(
          prevYearData.data,
          nextYearData.data,
          progress
        );
        
        renderTIFFToCanvas(
          ctx, 
          interpolatedData, 
          prevYearData.width, 
          prevYearData.height
        );
        
        // Update statistics
        setCurrentStats(calculateLandCoverStats(interpolatedData));
      } else {
        // Just render the previous year's data
        renderTIFFToCanvas(
          ctx, 
          prevYearData.data, 
          prevYearData.width, 
          prevYearData.height
        );
        
        // Update statistics
        setCurrentStats(calculateLandCoverStats(prevYearData.data));
      }
    }
    
    // Update the previous year ref
    previousYearRef.current = year;
  }, [mapData, prevYear, nextYear, progress, isLoading, year, transitionAnimationId, setTransitionAnimationId, previousYearRef, setCurrentStats]);

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-sahel-green animate-spin mb-3" />
          <p className="text-sm text-sahel-earth">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out" 
      style={{ transform: `scale(${zoomLevel})` }}
    >
      <canvas 
        ref={canvasRef} 
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
};

// Import here to avoid circular dependency
import { calculateLandCoverStats } from '@/lib/geospatialUtils';

export default MapRenderer;
