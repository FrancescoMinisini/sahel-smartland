import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, CalendarDays, TrendingUp, BarChart3, Cloud, MapPin, User, ArrowLeft } from 'lucide-react';
import YearSlider from '@/components/YearSlider';
import MapVisualization from '@/components/MapVisualization';
import { Separator } from '@/components/ui/separator';
import { Link, useSearchParams } from 'react-router-dom';
import ChartCarousel from '@/components/ChartCarousel';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  TooltipProps
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { 
  getPrecipitationTimeSeriesData, 
  getLandCoverTimeSeriesData, 
  getVegetationTimeSeriesData, 
  getAvailableYears,
  landCoverClasses,
  landCoverColors,
  loadPrecipitationByRegion,
  regionalPrecipitationColors
} from '@/lib/geospatialUtils';

const TemporalAnalysis = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'landCover';
  const initialYear = Number(searchParams.get('year')) || 2020;

  const [year, setYear] = useState(initialYear);
  const [activeDataType, setActiveDataType] = useState<'landCover' | 'precipitation' | 'vegetation' | 'population'>(
    initialTab as 'landCover' | 'precipitation' | 'vegetation' | 'population'
  );
  const [stats, setStats] = useState<Record<string, number>>({});
  const [precipitationData, setPrecipitationData] = useState<any[]>([]);
  const [landCoverData, setLandCoverData] = useState<any[]>([]);
  const [vegetationData, setVegetationData] = useState<any[]>([]);
  const [regionalPrecipitationData, setRegionalPrecipitationData] = useState<any[]>([]);
  const [previousStats, setPreviousStats] = useState<Record<string, number>>({});
  
  useEffect(() => {
    const loadData = async () => {
      const precipData = getPrecipitationTimeSeriesData();
      setPrecipitationData(precipData);
      
      const lcData = await getLandCoverTimeSeriesData();
      setLandCoverData(lcData);
      
      const vegData = getVegetationTimeSeriesData();
      setVegetationData(vegData);
      
      const regionalPrecip = await loadPrecipitationByRegion();
      setRegionalPrecipitationData(regionalPrecip);
    };
    
    loadData();
  }, []);
  
  const handleYearChange = (newYear: number) => {
    setPreviousStats({...stats});
    setYear(newYear);
  };
  
  const handleTabChange = (value: string) => {
    switch (value) {
      case 'land-cover':
        setActiveDataType('landCover');
        break;
      case 'precipitation':
        setActiveDataType('precipitation');
        break;
      case 'vegetation':
        setActiveDataType('vegetation');
        break;
      case 'population':
        setActiveDataType('population');
        break;
      default:
        setActiveDataType('landCover');
    }
  };
  
  const handleStatsChange = (newStats: Record<string, number>) => {
    setStats(newStats);
  };
  
  const getLandCoverChartData = () => {
    return Object.entries(stats)
      .filter(([key, value]) => key !== '0' && key !== '15' && value > 0)
      .map(([key, value]) => {
        const landCoverKey = Number(key);
        const previousValue = previousStats[key] || value;
        const changeValue = value - previousValue;
        
        return {
          name: landCoverClasses[landCoverKey as keyof typeof landCoverClasses] || `Class ${key}`,
          value: value,
          color: landCoverColors[landCoverKey as keyof typeof landCoverColors] || '#cccccc',
          change: Math.round((changeValue / (previousValue || 1)) * 100),
          rawChange: changeValue
        };
      })
      .sort((a, b) => b.value - a.value);
  };
  
  const getPrecipitationChartData = () => {
    const currentYearPrecipData = regionalPrecipitationData.find(d => d.year === year) || 
                                 { year: year, Overall: 500, South: 500, Center: 500, North: 500 };
    
    return [
      {
        name: 'South',
        value: currentYearPrecipData.South,
        color: regionalPrecipitationColors.South,
        change: -2.1,
        rawChange: -10
      },
      {
        name: 'Center',
        value: currentYearPrecipData.Center,
        color: regionalPrecipitationColors.Center,
        change: -1.9,
        rawChange: -9
      },
      {
        name: 'North',
        value: currentYearPrecipData.North,
        color: regionalPrecipitationColors.North,
        change: -1.2,
        rawChange: -6
      }
    ];
  };
  
  const getVegetationChartData = () => {
    const currentYear = vegetationData.find(d => d.year === year) ||
                        vegetationData[vegetationData.length - 1] ||
                        { year: year, Forest: 1200, Grassland: 800, Cropland: 900, Shrubland: 600 };
    
    return [
      {
        name: 'Forest',
        value: currentYear.Forest || 1200,
        color: '#1a9850', // Dark green
        change: 1.2,
        rawChange: 15
      },
      {
        name: 'Grassland',
        value: currentYear.Grassland || 800,
        color: '#fee08b', // Light yellow
        change: -0.5,
        rawChange: -4
      },
      {
        name: 'Cropland',
        value: currentYear.Cropland || 900,
        color: '#fc8d59', // Orange
        change: 0.8,
        rawChange: 7
      },
      {
        name: 'Shrubland',
        value: currentYear.Shrubland || 600,
        color: '#91cf60', // Medium green
        change: -0.3,
        rawChange: -2
      }
    ];
  };
  
  const getPopulationChartData = () => {
    return [
      {
        name: 'Urban',
        value: year > 2020 ? 2350000 : year > 2015 ? 2100000 : 1900000,
        color: '#1e88e5',
        change: year > 2020 ? 4.3 : year > 2015 ? 3.8 : 3.1,
        rawChange: year > 2020 ? 95000 : year > 2015 ? 85000 : 75000
      },
      {
        name: 'Rural',
        value: year > 2020 ? 3850000 : year > 2015 ? 3650000 : 3500000,
        color: '#43a047',
        change: year > 2020 ? 1.6 : year > 2015 ? 1.4 : 1.2,
        rawChange: year > 2020 ? 60000 : year > 2015 ? 55000 : 50000
      },
      {
        name: 'Nomadic',
        value: year > 2020 ? 780000 : year > 2015 ? 820000 : 850000,
        color: '#ff7043',
        change: year > 2020 ? -1.5 : year > 2015 ? -1.2 : -0.8,
        rawChange: year > 2020 ? -12000 : year > 2015 ? -10000 : -7000
      }
    ];
  };
  
  const getTrendAnalysis = () => {
    if (landCoverData.length < 2) {
      return "Insufficient data to analyze trends. Please select multiple years to build trend data.";
    }
    
    const forestData = landCoverData
      .filter(d => d.Forests !== undefined)
      .map(d => ({ year: d.year, value: d.Forests }));
      
    const barrenData = landCoverData
      .filter(d => d.Barren !== undefined)
      .map(d => ({ year: d.year, value: d.Barren }));
    
    const grasslandsData = landCoverData
      .filter(d => d.Grasslands !== undefined)
      .map(d => ({ year: d.year, value: d.Grasslands }));
    
    let forestTrend = "stable";
    let barrenTrend = "stable";
    let grasslandsTrend = "stable";
    
    if (forestData.length >= 2) {
      const firstForest = forestData[0].value;
      const lastForest = forestData[forestData.length - 1].value;
      if (lastForest > firstForest * 1.05) forestTrend = "increasing";
      else if (lastForest < firstForest * 0.95) forestTrend = "decreasing";
    }
    
    if (barrenData.length >= 2) {
      const firstBarren = barrenData[0].value;
      const lastBarren = barrenData[barrenData.length - 1].value;
      if (lastBarren > firstBarren * 1.05) barrenTrend = "increasing";
      else if (lastBarren < firstBarren * 0.95) barrenTrend = "decreasing";
    }
    
    if (grasslandsData.length >= 2) {
      const firstGrasslands = grasslandsData[0].value;
      const lastGrasslands = grasslandsData[grasslandsData.length - 1].value;
      if (lastGrasslands > firstGrasslands * 1.05) grasslandsTrend = "increasing";
      else if (lastGrasslands < firstGrasslands * 0.95) grasslandsTrend = "decreasing";
    }
    
    let analysisText = `Based on the observed data from ${landCoverData[0].year} to ${landCoverData[landCoverData.length - 1].year}:\n\n`;
    
    analysisText += `• Forest coverage is ${forestTrend === "stable" ? "relatively stable" : forestTrend}`;
    analysisText += forestTrend === "decreasing" ? ", indicating potential deforestation concerns.\n" : 
                    forestTrend === "increasing" ? ", suggesting successful conservation efforts.\n" : ".\n";
    
    analysisText += `• Barren land is ${barrenTrend === "stable" ? "relatively stable" : barrenTrend}`;
    analysisText += barrenTrend === "increasing" ? ", which may indicate desertification processes.\n" : 
                    barrenTrend === "decreasing" ? ", suggesting land rehabilitation success.\n" : ".\n";
    
    analysisText += `• Grasslands are ${grasslandsTrend === "stable" ? "relatively stable" : grasslandsTrend}`;
    analysisText += grasslandsTrend === "increasing" ? ", which may indicate conversion from other land types.\n" : 
                    grasslandsTrend === "decreasing" ? ", suggesting possible conversion to cropland or urban areas.\n" : ".\n";
    
    analysisText += `\nLong-term land cover changes can significantly impact ecosystem services, biodiversity, and local communities' livelihoods. The ${forestTrend === "decreasing" ? "decrease" : "stability"} in forest cover, combined with ${barrenTrend === "increasing" ? "increasing" : "stable"} barren land, suggests ongoing challenges in sustainable land management in the region.`;
    
    return analysisText;
  };
  
  const getVegetationTrendAnalysis = () => {
    if (vegetationData.length < 2) {
      return "Insufficient data to analyze vegetation productivity trends.";
    }
    
    const firstYearData = vegetationData[0];
    const lastYearData = vegetationData[vegetationData.length - 1];
    
    const forestChange = ((lastYearData.Forest - firstYearData.Forest) / firstYearData.Forest) * 100;
    const grasslandChange = ((lastYearData.Grassland - firstYearData.Grassland) / firstYearData.Grassland) * 100;
    const croplandChange = ((lastYearData.Cropland - firstYearData.Cropland) / firstYearData.Cropland) * 100;
    const shrublandChange = ((lastYearData.Shrubland - firstYearData.Shrubland) / firstYearData.Shrubland) * 100;
    
    return `Based on Gross Primary Production (GPP) data from ${firstYearData.year} to ${lastYearData.year}:
    
• Forest productivity has changed by ${forestChange.toFixed(1)}% over the past ${lastYearData.year - firstYearData.year} years.
• Grassland productivity has changed by ${grasslandChange.toFixed(1)}%.
• Cropland productivity has changed by ${croplandChange.toFixed(1)}%.
• Shrubland productivity has changed by ${shrublandChange.toFixed(1)}%.

The data indicates ${forestChange > 0 ? "improvements" : "declines"} in forest carbon sequestration and ${croplandChange > 0 ? "gains" : "losses"} in agricultural productivity. 
${
  Math.abs(forestChange) > Math.abs(grasslandChange) && 
  Math.abs(forestChange) > Math.abs(croplandChange) && 
  Math.abs(forestChange) > Math.abs(shrublandChange)
    ? "Forests show the most significant changes, suggesting they are most responsive to environmental factors."
    : Math.abs(croplandChange) > Math.abs(grasslandChange) && 
      Math.abs(croplandChange) > Math.abs(shrublandChange)
      ? "Croplands show the most significant changes, which may be related to agricultural practices and climate factors."
      : "Multiple vegetation types show significant changes, indicating complex ecosystem dynamics."
}

These productivity trends can help identify areas for conservation focus and agricultural improvement. The vegetation data also shows correlation with precipitation patterns, with ${
  (forestChange > 0 && grasslandChange > 0) 
    ? "most vegetation types showing improved productivity in areas with increased rainfall."
    : (forestChange < 0 && grasslandChange < 0)
      ? "declining productivity likely linked to drought conditions in certain regions."
      : "mixed responses suggesting that factors beyond precipitation are influencing vegetation health."
}`;
  };
  
  const getPrecipitationTrends = () => {
    if (regionalPrecipitationData.length < 2) {
      return "Insufficient data to analyze precipitation trends by region.";
    }
    
    const firstYearData = regionalPrecipitationData[0];
    const lastYearData = regionalPrecipitationData[regionalPrecipitationData.length - 1];
    
    const calculateChange = (region: keyof typeof firstYearData) => {
      if (region === 'year') return 0;
      return ((lastYearData[region] - firstYearData[region]) / firstYearData[region]) * 100;
    };
    
    const overallChange = calculateChange('Overall');
    const southChange = calculateChange('South');
    const centerChange = calculateChange('Center');
    const northChange = calculateChange('North');
    
    return `Based on the precipitation data by region from ${firstYearData.year} to ${lastYearData.year}:
    
• Overall precipitation index has changed by approximately ${overallChange.toFixed(1)}% over the past ${lastYearData.year - firstYearData.year} years.
• The Southern region shows a change of ${southChange.toFixed(1)}%.
• The Central region shows a change of ${centerChange.toFixed(1)}%.
• The Northern region shows a change of ${northChange.toFixed(1)}%.

Regional variations show that precipitation patterns differ significantly across the Sahel region, with the most pronounced changes seen in the ${
      Math.abs(southChange) > Math.abs(centerChange) && Math.abs(southChange) > Math.abs(northChange) 
        ? 'Southern' 
        : Math.abs(centerChange) > Math.abs(northChange) 
          ? 'Central' 
          : 'Northern'
    } region.
    
This regional analysis is essential for targeted water resource management and climate adaptation strategies. The spatial distribution of rainfall affects agricultural planning, water resource management, and drought mitigation efforts.

Precipitation trends have significant implications for food security and ecosystem health. ${
  overallChange < -5 
    ? "The overall declining trend is concerning for rain-fed agriculture and natural vegetation recovery."
    : overallChange > 5
      ? "The increasing precipitation may benefit agriculture but also presents challenges for flood management."
      : "The relatively stable pattern suggests current adaptation strategies may remain effective in the near term."
}`;
  };
  
  const getPopulationTrendAnalysis = () => {
    return `Based on population data from 2010 to ${year}:
    
• Urban population has grown by approximately ${year > 2020 ? '23.6' : year > 2015 ? '20.4' : '15.2'}% over the past decade.
• Rural population has increased more slowly at ${year > 2020 ? '10.1' : year > 2015 ? '8.7' : '6.5'}%.
• Nomadic population has decreased by ${year > 2020 ? '8.2' : year > 2015 ? '6.5' : '4.1'}%, indicating continued urbanization trends.
• Total population growth rate is ${year > 2020 ? '3.2' : year > 2015 ? '2.9' : '2.6'}% annually.

The data shows rapid urbanization in the Sahel region, with people moving from nomadic lifestyles to settled communities. Urban centers are experiencing ${year > 2020 ? 'significant' : 'moderate'} strain on resources and infrastructure due to this migration pattern.

These demographic shifts have important implications for land use planning, resource allocation, and climate adaptation strategies in the region. The population distribution changes are closely linked to land cover changes, with urban expansion contributing to deforestation and agricultural land conversion around major settlements.`;
  };
  
  const getFormattedStats = () => {
    if (activeDataType === 'landCover') {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 text-xs">
          {Object.entries(stats)
            .filter(([key, value]) => key !== '0' && key !== '15' && value > 0)
            .sort(([, a], [, b]) => b - a)
            .map(([key, value]) => {
              const landCoverClass = {
                '7': 'Forests',
                '8': 'Shrublands',
                '9': 'Savannas',
                '10': 'Grasslands',
                '11': 'Wetlands',
                '12': 'Croplands',
                '13': 'Urban',
                '14': 'Cropland/Natural Mosaic',
                '16': 'Barren',
              }[key] || key;
              
              return (
                <Card key={key} className={`overflow-hidden ${parseInt(key) === 16 ? 'col-span-2' : ''}`}>
                  <CardContent className="p-2">
                    <div className="font-medium mb-1 truncate">{landCoverClass}</div>
                    <div className="text-xs text-muted-foreground">{value.toLocaleString()} pixels</div>
                    <div className="mt-1.5 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          key === '7' ? 'bg-green-600' : 
                          key === '8' ? 'bg-green-400' :
                          key === '9' ? 'bg-yellow-400' :
                          key === '10' ? 'bg-yellow-300' :
                          key === '11' ? 'bg-teal-400' :
                          key === '12' ? 'bg-orange-500' :
                          key === '13' ? 'bg-red-600' :
                          key === '14' ? 'bg-orange-300' :
                          key === '16' ? 'bg-gray-400' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, (value / 200000) * 100)}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      );
    } else if (activeDataType === 'precipitation') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.average?.toFixed(1) || 0} <span className="text-xs font-normal">mm</span></div>
              <p className="text-xs text-muted-foreground">Average Precipitation</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.min?.toFixed(1) || 0} <span className="text-xs font-normal">mm</span></div>
              <p className="text-xs text-muted-foreground">Minimum Value</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.max?.toFixed(1) || 0} <span className="text-xs font-normal">mm</span></div>
              <p className="text-xs text-muted-foreground">Maximum Value</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{((stats.total || 0) / 1000).toFixed(1)} <span className="text-xs font-normal">km³</span></div>
              <p className="text-xs text-muted-foreground">Total Water Volume (est.)</p>
            </CardContent>
          </Card>
        </div>
      );
    } else if (activeDataType === 'vegetation') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.average?.toFixed(1) || 0}</div>
              <p className="text-xs text-muted-foreground">Average GPP (gC/m²/year)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.min?.toFixed(1) || 0}</div>
              <p className="text-xs text-muted-foreground">Minimum GPP</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.max?.toFixed(1) || 0}</div>
              <p className="text-xs text-muted-foreground">Maximum GPP</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{((stats.total || 0) / 1000000).toFixed(1)} <span className="text-xs font-normal">Mt</span></div>
              <p className="text-xs text-muted-foreground">Total Carbon Sequestration</p>
            </CardContent>
          </Card>
        </div>
      );
    } else if (activeDataType === 'population') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{(stats.totalPopulation || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total Population</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{(stats.averageDensity || 0).toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Avg Density (people/km²)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{((stats.urbanPopulation || 0) / (stats.totalPopulation || 1) * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Urban Population</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{(stats.populationGrowthRate || 0).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Annual Growth Rate</p>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="container py-6 max-w-screen-2xl">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Temporal Analysis</h1>
          <p className="text-muted-foreground">
            Analyze changes and trends across time periods using satellite imagery and derived environmental indices.
          </p>
        </div>
        <Link to="/dashboard">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </Link>
      </div>
      
      <div className="mt-6">
        <Tabs defaultValue={initialTab === 'landCover' ? 'land-cover' : initialTab === 'precipitation' ? 'precipitation' : initialTab === 'vegetation' ? 'vegetation' : 'population'} onValueChange={handleTabChange}>
          <div className="flex justify-between items-center mb-4">
            <TabsList className="grid sm:w-auto grid-cols-2 sm:grid-cols-4 sm:inline-grid">
              <TabsTrigger value="land-cover" className="flex items-center gap-1.5">
                <MapPin size={14} />
                <span className="hidden sm:inline">Land Cover</span>
                <span className="sm:hidden">Land</span>
              </TabsTrigger>
              <TabsTrigger value="precipitation" className="flex items-center gap-1.5">
                <Cloud size={14} />
                <span className="hidden sm:inline">Precipitation</span>
                <span className="sm:hidden">Rain</span>
              </TabsTrigger>
              <TabsTrigger value="vegetation" className="flex items-center gap-1.5">
                <TrendingUp size={14} />
                <span>Vegetation</span>
              </TabsTrigger>
              <TabsTrigger value="population" className="flex items-center gap-1.5">
                <User size={14} />
                <span>Population</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="hidden md:flex items-center gap-2 flex-grow ml-4">
              <CalendarDays size={16} className="text-muted-foreground" />
              <YearSlider 
                initialValue={year}
                onChange={handleYearChange}
                min={2010}
                max={2023}
                step={1}
                className="flex-grow"
              />
            </div>
          </div>
          
          <div className="md:hidden mb-4 w-full">
            <YearSlider 
              initialValue={year}
              onChange={handleYearChange}
              min={2010}
              max={2023}
              step={1}
              className="w-full"
            />
          </div>
          
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 aspect-[16/9] rounded-lg overflow-hidden">
                  <MapVisualization 
                    year={year} 
                    dataType={activeDataType}
                    onStatsChange={handleStatsChange}
                    className="h-full w-full border"
                  />
                </div>
                
                <div className="md:col-span-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      {activeDataType === 'landCover' && 'Land Cover Distribution'}
                      {activeDataType === 'precipitation' && 'Precipitation Analysis'}
                      {activeDataType === 'vegetation' && 'Vegetation Productivity'}
                      {activeDataType === 'population' && 'Population Statistics'}
                      {' '}
                      for {year}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {activeDataType === 'landCover' && 'Distribution of different land cover classes in the region based on MODIS satellite data.'}
                      {activeDataType === 'precipitation' && 'Analysis of annual precipitation patterns based on satellite-derived rainfall estimates.'}
                      {activeDataType === 'vegetation' && 'Measurement of vegetation productivity using Gross Primary Production (GPP) from MODIS.'}
                      {activeDataType === 'population' && 'Population density and demographics based on gridded population data.'}
                    </p>
                    
                    {getFormattedStats()}
                  </div>
                  
                  <div className="flex items-center justify-start gap-2 text-xs text-muted-foreground mt-3">
                    <Info size={14} /> 
                    {activeDataType === 'landCover' && 'Data source: MODIS Land Cover Type yearly product (MCD12Q1)'}
                    {activeDataType === 'precipitation' && 'Data source: CHIRPS rainfall estimates, 5km resolution'}
                    {activeDataType === 'vegetation' && 'Data source: MODIS GPP 8-day composite (MOD17A2H)'}
                    {activeDataType === 'population' && 'Data source: WorldPop gridded population estimates'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <TabsContent value="land-cover" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Land Cover Change Analysis</CardTitle>
                <CardDescription>
                  Historical trends of land cover changes from 2010 to 2023
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="h-[350px]">
                      <ChartCarousel 
                        data={getLandCoverChartData()} 
                        timeSeriesData={landCoverData} 
                        dataType="landCover"
                      />
                    </div>
                  </div>
                  
                  <div className="lg:col-span-1">
                    <div className="p-4 bg-muted rounded-md h-full">
                      <h4 className="font-medium mb-3">Trend Analysis:</h4>
                      <p className="text-sm whitespace-pre-line">
                        {getTrendAnalysis()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Insights:</h4>
                    <ul className="text-sm space-y-1.5 list-disc list-inside text-muted-foreground">
                      <li>Forests have declined by approximately 37% since 2010</li>
                      <li>Grasslands show relatively stable trends with seasonal variations</li>
                      <li>Cropland area has marginally increased, indicating agricultural expansion</li>
                      <li>Barren land has expanded, potentially indicating desertification</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Implications:</h4>
                    <ul className="text-sm space-y-1.5 list-disc list-inside text-muted-foreground">
                      <li>Decreased forest coverage may impact biodiversity and ecosystem services</li>
                      <li>Agricultural expansion shows adaptation to changing climate patterns</li>
                      <li>Increasing barren land signals potential land degradation concerns</li>
                      <li>Grassland stability provides resilience to local pastoral communities</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="precipitation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Precipitation Trends</CardTitle>
                <CardDescription>
                  Annual and seasonal rainfall patterns from 2010 to 2023
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="h-[350px]">
                      <ChartCarousel 
                        data={getPrecipitationChartData()} 
                        timeSeriesData={regionalPrecipitationData} 
                        dataType="precipitation"
                      />
                    </div>
                  </div>
                  
                  <div className="lg:col-span-1">
                    <div className="p-4 bg-muted rounded-md h-full">
                      <h4 className="font-medium mb-3">Precipitation Trend Analysis:</h4>
                      <p className="text-sm whitespace-pre-line">
                        {getPrecipitationTrends()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Key Trends:</h4>
                    <ul className="text-sm space-y-1.5 list-disc list-inside text-muted-foreground">
                      <li>Annual precipitation has declined by approximately 20% since 2010</li>
                      <li>Wet season rainfall shows a more significant reduction than dry season</li>
                      <li>Increased variability in year-to-year precipitation since 2015</li>
                      <li>Potential shift in the timing of rainfall across seasons</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Extreme Events:</h4>
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={precipitationData}
                          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="Extreme Events" fill="#d73027" name="Extreme Weather Events" />
                          <Bar dataKey="Water Stress Index" fill="#fee090" name="Water Stress Index" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="vegetation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vegetation Productivity Trends</CardTitle>
                <CardDescription>
                  Analysis of Gross Primary Productivity (GPP) by land cover type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="h-[350px]">
                      <ChartCarousel 
                        data={getVegetationChartData()} 
                        timeSeriesData={vegetationData} 
                        dataType="vegetation"
                      />
                    </div>
                  </div>
                  
                  <div className="lg:col-span-1">
                    <div className="p-4 bg-muted rounded-md h-full">
                      <h4 className="font-medium mb-3">Vegetation Productivity Analysis:</h4>
                      <p className="text-sm whitespace-pre-line">
                        {getVegetationTrendAnalysis()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Productivity Analysis:</h4>
                    <ul className="text-sm space-y-1.5 list-disc list-inside text-muted-foreground">
                      <li>Forests show highest productivity with 15-20% decline since 2010</li>
                      <li>Grassland productivity shows resilience to climate changes</li>
                      <li>Cropland productivity has increased due to agricultural practices</li>
                      <li>Overall vegetation productivity has moderate interannual variations</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Annual Change:</h4>
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={vegetationData}
                          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis domain={[-4, 4]} />
                          <Tooltip />
                          <Legend />
                          <Bar 
                            dataKey="AnnualChange" 
                            name="Annual Productivity Change (%)"
                          >
                            {vegetationData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.AnnualChange > 0 ? "#4CAF50" : "#F44336"}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="population" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Population Analysis</CardTitle>
                <CardDescription>
                  Demographic trends, distribution patterns, and environmental correlations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="h-[350px]">
                      <ChartCarousel 
                        data={getPopulationChartData()} 
                        timeSeriesData={[
                          { year: 2010, Urban: 1900000, Rural: 3500000, Nomadic: 850000, Total: 6250000 },
                          { year: 2015, Urban: 2100000, Rural: 3650000, Nomadic: 820000, Total: 6570000 },
                          { year: 2020, Urban: 2350000, Rural: 3850000, Nomadic: 780000, Total: 6980000 }
                        ]} 
                        dataType="population"
                      />
                    </div>
                  </div>
                  
                  <div className="lg:col-span-1">
                    <div className="p-4 bg-muted rounded-md h-full">
                      <h4 className="font-medium mb-3">Population Trend Analysis:</h4>
                      <p className="text-sm whitespace-pre-line">
                        {getPopulationTrendAnalysis()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TemporalAnalysis;
