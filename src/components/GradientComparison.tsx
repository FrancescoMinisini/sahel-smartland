
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MapVisualization from '@/components/MapVisualization';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { ArrowLeftRight, ChevronDown } from 'lucide-react';

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

const GradientComparison = ({ year, className }: GradientComparisonProps) => {
  const [leftMapType, setLeftMapType] = useState<string>('landCover');
  const [rightMapType, setRightMapType] = useState<string>('vegetation');
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Map Comparisons</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
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
                year={year}
                dataType={leftMapType as any}
              />
            </div>
            
            <div className="h-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
              <MapVisualization 
                className="w-full h-full"
                year={year}
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
