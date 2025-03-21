
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MapVisualization from '@/components/MapVisualization';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { ArrowLeftRight, ChevronDown, Info, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { getAvailableYears } from '@/lib/geospatialUtils';

interface GradientComparisonProps {
  year: number;
  className?: string;
}

const mapOptions = [
  { value: 'landCover', label: 'Land Cover' },
  { value: 'landCoverGradient', label: 'Land Cover Gradient' },
  { value: 'vegetation', label: 'Vegetation' },
  { value: 'vegetationGradient', label: 'Vegetation Gradient' },
  { value: 'precipitation', label: 'Precipitation' },
  { value: 'precipitationGradient', label: 'Precipitation Gradient' },
  { value: 'population', label: 'Population' }
];

// Insights about each map type and its gradient
const mapInsights = {
  landCover: "Land cover maps show the physical material at the surface of the earth. Categories include forests, wetlands, croplands, and urban areas.",
  landCoverGradient: "Land cover gradients highlight transitions between different land types, revealing edges and ecotones where ecological interactions are most dynamic.",
  vegetation: "Vegetation maps show plant productivity and biomass. Darker green areas typically indicate higher vegetation density and health.",
  vegetationGradient: "Vegetation gradients reveal areas of rapid change in plant productivity, potentially indicating areas of improvement or degradation.",
  precipitation: "Precipitation maps display rainfall patterns across regions. Blues indicate higher rainfall while reds indicate drier areas.",
  precipitationGradient: "Precipitation gradients show rapid changes in rainfall patterns, highlighting transition zones between wet and dry areas.",
  population: "Population maps show human density distribution. Brighter areas indicate higher population density."
};

// Insights about comparing specific map types
const comparisonInsights = {
  landCover_vegetation: "Comparing land cover with vegetation productivity reveals relationships between land use and plant health. Look for areas where changes in land cover correlate with changes in vegetation.",
  landCover_precipitation: "This comparison helps identify how rainfall patterns influence land cover types. Areas with higher precipitation often support denser vegetation.",
  vegetation_precipitation: "Comparing vegetation with precipitation reveals the direct relationship between rainfall and plant productivity. Look for lag effects where vegetation responds to previous months' rainfall.",
  landCover_population: "This comparison shows how human settlements impact land cover patterns. Urban expansion often comes at the expense of natural vegetation.",
  vegetation_population: "Reveals the human impact on plant productivity. Areas with high population density often show reduced vegetation health due to development.",
  precipitation_population: "Shows how human settlements relate to water availability. Historically, settlements developed near reliable water sources."
};

const getComparisonInsight = (leftType: string, rightType: string) => {
  const key1 = `${leftType}_${rightType}`;
  const key2 = `${rightType}_${leftType}`;
  
  return comparisonInsights[key1 as keyof typeof comparisonInsights] || 
         comparisonInsights[key2 as keyof typeof comparisonInsights] || 
         "Compare these maps to identify spatial correlations and patterns between different environmental factors.";
};

const GradientComparison = ({ year, className }: GradientComparisonProps) => {
  const [leftMapType, setLeftMapType] = useState<string>('landCover');
  const [rightMapType, setRightMapType] = useState<string>('vegetation');
  const [showInsights, setShowInsights] = useState(true);
  const [currentYear, setCurrentYear] = useState(year);
  const [isPlaying, setIsPlaying] = useState(false);
  const [yearInterval, setYearInterval] = useState<NodeJS.Timeout | null>(null);
  
  const availableYears = getAvailableYears();
  const minYear = availableYears[0];
  const maxYear = availableYears[availableYears.length - 1];
  
  // Handle play/pause animation
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentYear(prevYear => {
          if (prevYear >= maxYear) {
            setIsPlaying(false);
            return minYear;
          }
          return prevYear + 1;
        });
      }, 1000);
      
      setYearInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else if (yearInterval) {
      clearInterval(yearInterval);
      setYearInterval(null);
    }
  }, [isPlaying, maxYear, minYear]);
  
  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Handle year slider change
  const handleYearChange = (newValue: number[]) => {
    setCurrentYear(newValue[0]);
    // Stop animation if user manually changes year
    if (isPlaying) {
      setIsPlaying(false);
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Map Comparisons</CardTitle>
          <button 
            onClick={() => setShowInsights(!showInsights)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showInsights ? "Hide insights" : "Show insights"}
          >
            <Info size={18} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Time Slider Controls */}
          <div className="flex items-center gap-4 mb-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={togglePlayPause}
              className="flex-shrink-0 h-8 w-8"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </Button>
            
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs">{minYear}</span>
              <Slider
                value={[currentYear]}
                min={minYear}
                max={maxYear}
                step={1}
                onValueChange={handleYearChange}
                className="flex-1"
              />
              <span className="text-xs">{maxYear}</span>
            </div>
            
            <div className="bg-muted px-2 py-1 rounded text-sm font-medium min-w-16 text-center">
              {currentYear}
            </div>
          </div>
          
          {/* Insights Panel */}
          {showInsights && (
            <div className="bg-muted/40 border border-border/60 rounded-lg p-4 mb-2 text-sm">
              <h4 className="font-medium mb-2">Comparison Insights</h4>
              <p className="mb-3">{getComparisonInsight(leftMapType, rightMapType)}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div>
                  <h5 className="font-medium text-xs mb-1">{mapOptions.find(o => o.value === leftMapType)?.label}</h5>
                  <p className="text-xs text-muted-foreground">{mapInsights[leftMapType as keyof typeof mapInsights]}</p>
                </div>
                <div>
                  <h5 className="font-medium text-xs mb-1">{mapOptions.find(o => o.value === rightMapType)?.label}</h5>
                  <p className="text-xs text-muted-foreground">{mapInsights[rightMapType as keyof typeof mapInsights]}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Controls for selecting map types */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="space-y-2">
              <Label htmlFor="left-map">Left Map</Label>
              <Select 
                value={leftMapType} 
                onValueChange={setLeftMapType}
              >
                <SelectTrigger id="left-map">
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  {mapOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="right-map">Right Map</Label>
              <Select 
                value={rightMapType} 
                onValueChange={setRightMapType}
              >
                <SelectTrigger id="right-map">
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  {mapOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Map comparison container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-[500px]">
            <div className="h-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
              <MapVisualization 
                className="w-full h-full"
                year={currentYear}
                dataType={leftMapType as any}
              />
            </div>
            
            <div className="h-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
              <MapVisualization 
                className="w-full h-full"
                year={currentYear}
                dataType={rightMapType as any}
              />
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            Compare different data types side by side to identify correlations and patterns.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GradientComparison;
