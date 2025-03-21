
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, CircleUserRound, Sprout, BarChart3, Activity, ArrowDownRight, ArrowUpRight, CloudRain, HelpCircle, Share2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip } from "@/components/ui/tooltip";
import DataCard from "@/components/DataCard";
import ChartCarousel from '@/components/ChartCarousel';
import YearSlider from '@/components/YearSlider';
import MapVisualization from '@/components/MapVisualization';
import PopulationInsightsCharts from '@/components/PopulationInsightsCharts';
import GradientAnalysis from '@/components/GradientAnalysis';
import LandCoverGradientCard from '@/components/LandCoverGradientCard';

// Dummy function to fetch region data - would be replaced with real data
const fetchRegionData = async (year = 2023) => {
  // Simulating API request
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return {
    populationTotal: 923157 + (year - 2010) * 32456,
    greenCoverPercentage: 35.4 - (2023 - year) * 0.7,
    precipitationAverage: 142.8 + (year - 2010) * 3.2 * (Math.random() > 0.5 ? 1 : -1),
    landDegradationRate: 4.8 + (2023 - year) * 0.3,
    cropYield: 1.2 + (year - 2010) * 0.04,
    landAreaTotal: 36800, // km²
    vegetationHealthIndex: 62.3 - (2023 - year) * 0.8,
    carbonSequestration: 12.8 + (year - 2015) * 0.2 * (year > 2018 ? 1 : -1),
    waterStressIndex: 76.4 - (year - 2010) * 0.5 * (Math.random() > 0.6 ? 1 : -1),
    soilOrganicCarbon: 45.7 - (2023 - year) * 1.1,
  };
};

const Dashboard = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2023);
  const [selectedTab, setSelectedTab] = useState<string>("overview");
  
  const { data, isLoading } = useQuery({
    queryKey: ['regionData', selectedYear],
    queryFn: () => fetchRegionData(selectedYear),
  });

  useEffect(() => {
    document.title = "Assaba Sahel Dashboard - UNCCD Earth OS Hub";
  }, []);

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 max-w-full mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sahel Dashboard</h1>
          <p className="text-muted-foreground">
            Assaba Region, Mauritania - Environmental Monitoring & Assessment
          </p>
        </div>
        
        <div className="w-full lg:w-auto flex flex-col xs:flex-row gap-4">
          <YearSlider 
            year={selectedYear} 
            onChange={(newYear) => setSelectedYear(newYear)} 
            min={2010}
            max={2023}
            className="flex-1"
          />
          
          <Button variant="outline" className="h-10 px-4">
            <Share2 className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Share</span>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DataCard
          title="Population"
          value={isLoading ? "..." : `${(data?.populationTotal / 1000000).toFixed(2)}M`}
          description="Total estimated population"
          icon={<CircleUserRound className="h-4 w-4" />}
          trend={{ value: 3.2, isPositive: true }}
        />
        
        <DataCard
          title="Green Cover"
          value={isLoading ? "..." : `${data?.greenCoverPercentage.toFixed(1)}%`}
          description="Vegetation coverage"
          icon={<Sprout className="h-4 w-4" />}
          trend={{ value: 1.8, isPositive: false }}
        />
        
        <DataCard
          title="Annual Precipitation"
          value={isLoading ? "..." : `${data?.precipitationAverage.toFixed(1)} mm`}
          description="Average annual rainfall"
          icon={<CloudRain className="h-4 w-4" />}
          trend={{ value: 5.4, isPositive: true }}
        />
        
        <DataCard
          title="Land Degradation"
          value={isLoading ? "..." : `${data?.landDegradationRate.toFixed(1)}%`}
          description="Annual rate of land degradation"
          icon={<Activity className="h-4 w-4" />}
          trend={{ value: 2.3, isPositive: false }}
        />
      </div>
      
      <Tabs defaultValue="overview" className="mt-6" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="population">Population</TabsTrigger>
          <TabsTrigger value="vegetation">Vegetation</TabsTrigger>
          <TabsTrigger value="landGradient">Land Gradient</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-xl">Regional Map Overview</CardTitle>
                  <CardDescription>
                    Spatial distribution of key environmental factors in {selectedYear}
                  </CardDescription>
                </div>
                
                <TooltipProvider>
                  <Tooltip>
                    <Tooltip.Trigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <HelpCircle className="h-4 w-4" />
                        <span className="sr-only">Help</span>
                      </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      <p className="max-w-xs">
                        This map shows the spatial distribution of land cover, vegetation health, and precipitation across the Assaba region.
                      </p>
                    </Tooltip.Content>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[500px] w-full">
                  <MapVisualization year={selectedYear} className="w-full h-full" expandedView={true} />
                </div>
              </CardContent>
            </Card>
            
            <LandCoverGradientCard />
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold">Vegetation Health</CardTitle>
                    <CardDescription className="mt-1">Vegetation Health Index Trend</CardDescription>
                  </div>
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Sprout className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-2xl font-bold">{isLoading ? "--" : data?.vegetationHealthIndex.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground ml-2">VHI Score</span>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    <ArrowDownRight className="h-3 w-3" />
                    3.2%
                  </div>
                </div>
                
                <div className="h-[200px] mt-4 text-center text-muted-foreground flex items-center justify-center">
                  Vegetation health chart will appear here
                </div>
                
                <div className="space-y-2 mt-4 text-sm text-muted-foreground">
                  <p>Vegetation health shows moderate decline since 2010</p>
                  <p>Drought conditions are contributing to reduced plant vigor</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <ChartCarousel year={selectedYear} />
          </div>
        </TabsContent>
        
        <TabsContent value="population" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Population Distribution and Demographics</CardTitle>
                <CardDescription>Analysis of population patterns and their interaction with environmental factors</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <PopulationInsightsCharts year={selectedYear} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="vegetation" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Vegetation Health Analysis</CardTitle>
                <CardDescription>Detailed analysis of vegetation health and productivity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <MapVisualization year={selectedYear} className="w-full h-full" expandedView={true} dataType="vegetation" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="landGradient" className="space-y-6">
          <GradientAnalysis year={selectedYear} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
