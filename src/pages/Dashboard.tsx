import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import YearSlider from '@/components/YearSlider';
import { ArrowDown, ArrowUp, Info, Download, Plus, BarChart, LineChart, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider, Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import MapVisualization from '@/components/MapVisualization';
import DataCard from '@/components/DataCard';
import RegionFilter from '@/components/RegionFilter';
import ChartCarousel from '@/components/ChartCarousel';
import GradientAnalysis from '@/components/GradientAnalysis';
import LandCoverGradientChart from '@/components/LandCoverGradientChart';
import CorrelationAnalysis from '@/components/CorrelationAnalysis';
import { useToast } from '@/hooks/use-toast';
import { useMobileView } from '@/hooks/use-mobile';

const transformToCarouselData = (data: any) => {
  return data.map((item: any) => ({
    name: item.name || "Unknown",
    value: item.value || 0,
    color: item.color || "#999",
    change: item.change || 0,
    rawChange: item.rawChange || 0,
  }));
};

const landCoverData = [
  { name: "Forests", value: 1532, color: "#1a9850", change: -2.3, rawChange: -36 },
  { name: "Grasslands", value: 3214, color: "#fee08b", change: 1.4, rawChange: 45 },
  { name: "Croplands", value: 2156, color: "#fc8d59", change: 3.8, rawChange: 82 },
  { name: "Urban", value: 423, color: "#d73027", change: 5.2, rawChange: 22 },
  { name: "Barren", value: 978, color: "#bababa", change: -1.8, rawChange: -18 },
  { name: "Water", value: 321, color: "#4575b4", change: 0.3, rawChange: 1 },
];

const precipitationData = [
  { name: "North", value: 342, color: "#4575b4", change: 5.6, rawChange: 19 },
  { name: "Center", value: 231, color: "#91bfdb", change: -3.8, rawChange: -9 },
  { name: "South", value: 156, color: "#e0f3f8", change: -8.2, rawChange: -13 },
  { name: "Extreme Events", value: 6, color: "#d73027", change: 100, rawChange: 3 },
  { name: "Water Stress Index", value: 65, color: "#fc8d59", change: 18.2, rawChange: 10 },
];

const vegetationData = [
  { name: "Forest Productivity", value: 487, color: "#1a9850", change: -3.6, rawChange: -18 },
  { name: "Grassland Productivity", value: 312, color: "#91cf60", change: 1.9, rawChange: 6 },
  { name: "Cropland Productivity", value: 423, color: "#fc8d59", change: 5.8, rawChange: 24 },
  { name: "Shrubland Productivity", value: 276, color: "#fee08b", change: -2.3, rawChange: -6 },
  { name: "NDVI Anomaly", value: 0.15, color: "#d73027", change: 50, rawChange: 0.05 },
];

const landCoverTimeSeriesData = [
  { year: 2010, "Forests": 1630, "Grasslands": 3090, "Croplands": 1980, "Urban": 380, "Barren": 1020 },
  { year: 2011, "Forests": 1618, "Grasslands": 3110, "Croplands": 2010, "Urban": 384, "Barren": 1014 },
  { year: 2012, "Forests": 1605, "Grasslands": 3125, "Croplands": 2038, "Urban": 391, "Barren": 1006 },
  { year: 2013, "Forests": 1590, "Grasslands": 3140, "Croplands": 2069, "Urban": 399, "Barren": 998 },
  { year: 2014, "Forests": 1580, "Grasslands": 3155, "Croplands": 2092, "Urban": 407, "Barren": 992 },
  { year: 2015, "Forests": 1568, "Grasslands": 3176, "Croplands": 2112, "Urban": 414, "Barren": 986 },
  { year: 2016, "Forests": 1553, "Grasslands": 3190, "Croplands": 2128, "Urban": 420, "Barren": 984 },
  { year: 2017, "Forests": 1547, "Grasslands": 3201, "Croplands": 2139, "Urban": 424, "Barren": 982 },
  { year: 2018, "Forests": 1540, "Grasslands": 3208, "Croplands": 2148, "Urban": 427, "Barren": 980 },
  { year: 2019, "Forests": 1535, "Grasslands": 3210, "Croplands": 2152, "Urban": 430, "Barren": 979 },
  { year: 2020, "Forests": 1535, "Grasslands": 3213, "Croplands": 2155, "Urban": 431, "Barren": 979 },
  { year: 2021, "Forests": 1532, "Grasslands": 3214, "Croplands": 2156, "Urban": 423, "Barren": 978 },
];

const regions = [
  { id: "north", name: "Northern District", color: "#4575b4" },
  { id: "central", name: "Central District", color: "#91bfdb" },
  { id: "south", name: "Southern District", color: "#e0f3f8" },
  { id: "west", name: "Western District", color: "#fee08b" },
  { id: "east", name: "Eastern District", color: "#fc8d59" }
];

const correlationVariables = [
  { id: "forestCover", name: "Forest Cover", unit: "km²" },
  { id: "precipitation", name: "Annual Precipitation", unit: "mm" },
  { id: "temperature", name: "Temperature", unit: "°C" },
  { id: "ndvi", name: "Vegetation Health", unit: "NDVI" },
  { id: "population", name: "Population Density", unit: "people/km²" }
];

const correlationData = [
  { year: 2015, forestCover: 1580, precipitation: 250, temperature: 28.5, ndvi: 0.62, population: 45 },
  { year: 2016, forestCover: 1568, precipitation: 245, temperature: 28.7, ndvi: 0.61, population: 46 },
  { year: 2017, forestCover: 1553, precipitation: 235, temperature: 29.1, ndvi: 0.60, population: 48 },
  { year: 2018, forestCover: 1547, precipitation: 230, temperature: 29.2, ndvi: 0.59, population: 49 },
  { year: 2019, forestCover: 1540, precipitation: 225, temperature: 29.5, ndvi: 0.58, population: 51 },
  { year: 2020, forestCover: 1535, precipitation: 220, temperature: 29.7, ndvi: 0.57, population: 52 },
  { year: 2021, forestCover: 1532, precipitation: 215, temperature: 29.9, ndvi: 0.56, population: 54 }
];

const Dashboard = () => {
  const [year, setYear] = useState(2022);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(regions.map(region => region.id));
  const { isMobile } = useMobileView();
  const { toast } = useToast();

  const handleYearChange = (newYear: number) => {
    setYear(newYear);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      toast({
        title: "Dashboard updated",
        description: `Data loaded for year ${year}`,
      });
    }, 500);
    
    return () => clearTimeout(timer);
  }, [year, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sahel-sandLight/10">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-sahel-earth">
              Assaba Region Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive analysis of environmental and land use data
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            <YearSlider
              initialValue={year}
              onValueChange={handleYearChange}
              min={2010}
              max={2023}
              className="w-full sm:w-80"
            />
            
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download report</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add new widget</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          <DataCard 
            title="Forest Cover" 
            value="1,532 km²" 
            trend={{ value: 2.3, isPositive: false }}
            icon={<div className="w-12 h-12 rounded-full bg-sahel-green/20 flex items-center justify-center"><div className="w-8 h-8 rounded-full bg-sahel-green"></div></div>}
            description="Change since last year"
          />
          
          <DataCard 
            title="Annual Precipitation" 
            value="231 mm" 
            trend={{ value: 3.8, isPositive: false }}
            icon={<div className="w-12 h-12 rounded-full bg-sahel-blue/20 flex items-center justify-center"><div className="w-8 h-8 rounded-full bg-sahel-blue"></div></div>}
            description="Change since last year"
          />
          
          <DataCard 
            title="Vegetation Health" 
            value="0.64 NDVI" 
            trend={{ value: 2.1, isPositive: true }}
            icon={<div className="w-12 h-12 rounded-full bg-sahel-green/20 flex items-center justify-center"><div className="w-8 h-8 rounded-full bg-sahel-green"></div></div>}
            description="Change since last year"
          />
          
          <DataCard 
            title="Cropland Area" 
            value="2,156 km²" 
            trend={{ value: 3.8, isPositive: true }}
            icon={<div className="w-12 h-12 rounded-full bg-sahel-earth/20 flex items-center justify-center"><div className="w-8 h-8 rounded-full bg-sahel-earth"></div></div>}
            description="Change since last year"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Assaba Region Map</CardTitle>
              <CardDescription>Geospatial visualization of selected data</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <MapVisualization year={year} expandedView={false} dataType="landCover" />
            </CardContent>
            <CardFooter className="flex justify-between py-2">
              <div className="flex space-x-2">
                <Badge variant="outline">Land Cover</Badge>
                <Badge variant="outline">Vegetation</Badge>
                <Badge variant="outline">Precipitation</Badge>
              </div>
              <Button variant="ghost" size="sm">View Full Map</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Land Cover Distribution</CardTitle>
              <CardDescription>Current breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartCarousel 
                data={transformToCarouselData(landCoverData)}
                timeSeriesData={landCoverTimeSeriesData}
                dataType="landCover"
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <LandCoverGradientChart />
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Regional Comparisons</CardTitle>
                  <CardDescription>District-level environmental indicators</CardDescription>
                </div>
                <RegionFilter 
                  regions={regions}
                  selectedRegions={selectedRegions}
                  onChange={setSelectedRegions}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="precipitation">
                <TabsList className="mb-4">
                  <TabsTrigger value="precipitation">Precipitation</TabsTrigger>
                  <TabsTrigger value="vegetation">Vegetation</TabsTrigger>
                  <TabsTrigger value="population">Population</TabsTrigger>
                </TabsList>
                <TabsContent value="precipitation">
                  <ChartCarousel 
                    data={transformToCarouselData(precipitationData)}
                    dataType="precipitation"
                  />
                </TabsContent>
                <TabsContent value="vegetation">
                  <ChartCarousel 
                    data={transformToCarouselData(vegetationData)}
                    dataType="vegetation"
                  />
                </TabsContent>
                <TabsContent value="population">
                  {/* Population charts would go here */}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 gap-6 mb-6">
          <CorrelationAnalysis 
            data={correlationData} 
            variables={correlationVariables}
          />
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <GradientAnalysis year={year} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
