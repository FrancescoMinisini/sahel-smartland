
import { useState, useEffect, useMemo } from 'react';
import { 
  loadTIFF, 
  getAvailableYears,
  calculateLandCoverStats
} from '@/lib/geospatialUtils';
import { useToast } from '@/components/ui/use-toast';

export const useMapData = (year: number) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [mapData, setMapData] = useState<{
    [year: number]: { data: number[], width: number, height: number }
  }>({});
  const [currentStats, setCurrentStats] = useState<Record<string, number>>({});

  // Find the closest available years for interpolation
  const { prevYear, nextYear, progress } = useMemo(() => {
    const availableYears = getAvailableYears();
    
    if (availableYears.includes(year)) {
      return { prevYear: year, nextYear: year, progress: 0 };
    }
    
    // Find the closest previous and next years
    const prevYear = Math.max(...availableYears.filter(y => y <= year));
    const nextYear = Math.min(...availableYears.filter(y => y >= year));
    
    // Calculate interpolation progress (0-1)
    const yearRange = nextYear - prevYear;
    const progress = yearRange > 0 ? (year - prevYear) / yearRange : 0;
    
    return { prevYear, nextYear, progress };
  }, [year]);

  // Preload data for all years when the component mounts
  useEffect(() => {
    const preloadAllYears = async () => {
      setIsLoading(true);
      
      try {
        // Get all available years
        const availableYears = getAvailableYears();
        
        // Create a queue to load years in sequence
        for (const yearToLoad of availableYears) {
          if (!mapData[yearToLoad]) {
            // Load data for this year
            const data = await loadTIFF(yearToLoad);
            setMapData(prev => ({ ...prev, [yearToLoad]: data }));
          }
        }
      } catch (error) {
        console.error('Error preloading TIFF data:', error);
        toast({
          title: 'Error loading map data',
          description: 'Could not preload all the land cover data years.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    preloadAllYears();
  }, []);

  return {
    isLoading,
    mapData,
    currentStats,
    setCurrentStats,
    prevYear,
    nextYear,
    progress
  };
};
