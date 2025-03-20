import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DataCard from '@/components/DataCard';
import MapVisualization from '@/components/MapVisualization';
import YearSlider from '@/components/YearSlider';
import PopulationInsightsCharts from '@/components/PopulationInsightsCharts';
import { 
  Calendar, 
  FileText, 
  Download, 
  BarChart2, 
  ArrowRight, 
  Leaf, 
  Map, 
  CloudRain, 
  Users, 
  Clock,
  Filter,
  Layers,
  ZoomIn,
  HelpCircle,
  Info,
  Sprout,
  Trees,
  Expand
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  landCoverClasses, 
  landCoverColors,
  regionalPrecipitationColors,
  getAccuratePrecipitationData,
  getPrecipitationTimeSeriesData,
  getLandCoverTimeSeriesData,
  loadPrecipitationByRegion,
  getVegetationTimeSeriesData
} from '@/lib/geospatialUtils';
import ChartCarousel from '@/components/ChartCarousel';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('landCover');
  const [selectedYear, setSelectedYear] = useState(2023);
  const [landCoverStats, setLandCoverStats] = useState<Record<string, number>>({});
  const [previousYearStats, setPreviousYearStats] = useState<Record<string, number>>({});
  const [vegetationStats, setVegetationStats] = useState<Record<string, number>>({});
  const [previousVegetationStats, setPreviousVegetationStats] = useState<Record<string, number>>({});
  const [timeSeriesData, setTimeSeriesData] = useState<Array<{year: number, [key: string]: number}>>([]);
  const [vegetationTimeSeriesData, setVegetationTimeSeriesData] = useState<Array<{year: number, [key: string]: number}>>([]);
  const [regionalPrecipitationData, setRegionalPrecipitationData] = useState<Array<{year: number, Overall: number, South: number, Center: number, North: number}>>([]);
  const [populationStats, setPopulationStats] = useState<Record<string, number>>({});
  const [previousPopulationStats, setPreviousPopulationStats] = useState<Record<string, number>>({});
  
  const dataTabs = [
    { id: 'landCover', name: 'Land Cover', icon: <Layers size={16} /> },
    { id: 'vegetation', name: 'Vegetation', icon: <Leaf size={16} /> },
    { id: 'precipitation', name: 'Precipitation', icon: <CloudRain size={16} /> },
    { id: 'population', name: 'Population', icon: <Users size={16} /> },
  ];
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load land cover data
        const landCoverData = await getLandCoverTimeSeriesData();
        setTimeSeriesData(landCoverData);
        
        // Load precipitation data
        const precipData = await loadPrecipitationByRegion();
        console.log("Loaded precipitation by region:", precipData);
        setRegionalPrecipitationData(precipData);
        
        // Load vegetation productivity data
        const vegetationData = getVegetationTimeSeriesData();
        console.log("Loaded vegetation productivity data:", vegetationData);
        setVegetationTimeSeriesData(vegetationData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleTabChange = (tab: string) => {
    setIsLoading(true);
    setActiveTab(tab);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const handleYearChange = (year: number) => {
    setPreviousYearStats({...landCoverStats});
    setPreviousVegetationStats({...vegetationStats});
    setPreviousPopulationStats({...populationStats});
    setIsLoading(true);
    setSelectedYear(year);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleStatsChange = (stats: Record<string, number>) => {
    if (activeTab === 'landCover') {
      setLandCoverStats(stats);
    } else if (activeTab === 'vegetation') {
      setVegetationStats(stats);
    } else if (activeTab === 'population') {
      setPopulationStats(stats);
    }
  };

  const chartData = Object.entries(landCoverStats)
    .filter(([key]) => key !== '0')
    .map(([key, value]) => {
      const landCoverKey = Number(key);
      const previousValue = previousYearStats[key] || value;
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

  const currentYearPrecipData = regionalPrecipitationData.find(d => d.year === selectedYear) || 
                               { year: selectedYear, Overall: 500, South: 500, Center: 500, North: 500 };
  
  const regionalPrecipChartData = [
    {
      name: 'Overall',
      value: currentYearPrecipData.Overall,
      color: regionalPrecipitationColors.Overall,
      change: -1.5,
      rawChange: -8
    },
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

  const vegetationChartData = (() => {
    const currentYear = vegetationTimeSeriesData.find(d => d.year === selectedYear) ||
                        vegetationTimeSeriesData[vegetationTimeSeriesData.length - 1] ||
                        { year: selectedYear, Forest: 1200, Grassland: 800, Cropland: 900, Shrubland: 600 };
    
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
  })();

  const populationChartData = [
    {
      name: 'Urban',
      value: selectedYear > 2020 ? 2350000 : selectedYear > 2015 ? 2100000 : 1900000,
      color: '#1e88e5',
      change: selectedYear > 2020 ? 4.3 : selectedYear > 2015 ? 3.8 : 3.1,
      rawChange: selectedYear > 2020 ? 95000 : selectedYear > 2015 ? 85000 : 75000
    },
    {
      name: 'Rural',
      value: selectedYear > 2020 ? 3850000 : selectedYear > 2015 ? 3650000 : 3500000,
      color: '#43a047',
      change: selectedYear > 2020 ? 1.6 : selectedYear > 2015 ? 1.4 : 1.2,
      rawChange: selectedYear > 2020 ? 60000 : selectedYear > 2015 ? 55000 : 50000
    },
    {
      name: 'Nomadic',
      value: selectedYear > 2020 ? 780000 : selectedYear > 2015 ? 820000 : 850000,
      color: '#ff7043',
      change: selectedYear > 2020 ? -1.5 : selectedYear > 2015 ? -1.2 : -0.8,
      rawChange: selectedYear > 2020 ? -12000 : selectedYear > 2015 ? -10000 : -7000
    },
    {
      name: 'Total',
      value: selectedYear > 2020 ? 6980000 : selectedYear > 2015 ? 6570000 : 6250000,
      color: '#5e35b1',
      change: selectedYear > 2020 ? 3.2 : selectedYear > 2015 ? 2.9 : 2.6,
      rawChange: selectedYear > 2020 ? 143000 : selectedYear > 2015 ? 130000 : 118000
    }
  ];

  const getPopulationTrendAnalysis = () => {
    return `Based on population data from 2010 to ${selectedYear}:
    
• Urban population has grown by approximately ${selectedYear > 2020 ? '23.6' : selectedYear > 2015 ? '20.4' : '15.2'}% over the past decade.
• Rural population has increased more slowly at ${selectedYear > 2020 ? '10.1' : selectedYear > 2015 ? '8.7' : '6.5'}%.
• Nomadic population has decreased by ${selectedYear > 2020 ? '8.2' : selectedYear > 2015 ? '6.5' : '4.1'}%, indicating continued urbanization trends.
• Total population growth rate is ${selectedYear > 2020 ? '3.2' : selectedYear > 2015 ? '2.9' : '2.6'}% annually.

The data shows rapid urbanization in the Sahel region, with people moving from nomadic lifestyles to settled communities. Urban centers are experiencing ${selectedYear > 2020 ? 'significant' : 'moderate'} strain on resources and infrastructure due to this migration pattern.

These demographic shifts have important implications for land use planning, resource allocation, and climate adaptation strategies in the region.`;
  };

  const getTrendAnalysis = () => {
    if (timeSeriesData.length < 2) {
      return "Insufficient data to analyze trends. Please select multiple years to build trend data.";
    }
    
    const forestData = timeSeriesData
      .filter(d => d.Forests !== undefined)
      .map(d => ({ year: d.year, value: d.Forests }));
      
    const barrenData = timeSeriesData
      .filter(d => d.Barren !== undefined)
      .map(d => ({ year: d.year, value: d.Barren }));
    
    const grasslandsData = timeSeriesData
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
    
    let analysisText = `Based on the observed data from ${timeSeriesData[0].year} to ${timeSeriesData[timeSeriesData.length - 1].year}:\n\n`;
    
    analysisText += `• Forest coverage is ${forestTrend === "stable" ? "relatively stable" : forestTrend}`;
    analysisText += forestTrend === "decreasing" ? ", indicating potential deforestation concerns.\n" : 
                    forestTrend === "increasing" ? ", suggesting successful conservation efforts.\n" : ".\n";
    
    analysisText += `• Barren land is ${barrenTrend === "stable" ? "relatively stable" : barrenTrend}`;
    analysisText += barrenTrend === "increasing" ? ", which may indicate desertification processes.\n" : 
                    barrenTrend === "decreasing" ? ", suggesting land rehabilitation success.\n" : ".\n";
    
    analysisText += `• Grasslands are ${grasslandsTrend === "stable" ? "relatively stable" : grasslandsTrend}`;
    analysisText += grasslandsTrend === "increasing" ? ", which may indicate conversion from other land types.\n" : 
                    grasslandsTrend === "decreasing" ? ", suggesting possible conversion to cropland or urban areas.\n" : ".\n";
    
    return analysisText;
  };

  const getVegetationTrendAnalysis = () => {
    if (vegetationTimeSeriesData.length < 2) {
      return "Insufficient data to analyze vegetation productivity trends.";
    }
    
    const firstYearData = vegetationTimeSeriesData[0];
    const lastYearData = vegetationTimeSeriesData[vegetationTimeSeriesData.length - 1];
    
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

These productivity trends can help identify areas for conservation focus and agricultural improvement.`;
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
    
This regional analysis is essential for targeted water resource management and climate adaptation strategies.`;
  };

  const keyStats = [
    { 
      title: 'Land Cover Change', 
      value: selectedYear > 2020 ? '27.3M ha' : selectedYear > 2015 ? '23.6M ha' : '18.9M ha', 
      description: 'Area affected by land cover change in the past 20 years',
      icon: <Leaf size={20} />,
      trend: { value: selectedYear > 2020 ? 15 : selectedYear > 2015 ? 12 : 8, isPositive: false },
      analyticsData: [
        { year: 2010, value: 8.2 },
        { year: 2012, value: 10.4 },
        { year: 2014, value: 12.7 },
        { year: 2016, value: 16.1 },
        { year: 2018, value: 19.5 },
        { year: 2020, value: 23.6 },
        { year: 2022, value: 25.8 },
        { year: 2023, value: 27.3 }
      ],
      correlations: [
        { name: "Deforestation", value: 82, correlation: 0.89 },
        { name: "Urban Expansion", value: 65, correlation: 0.78 },
        { name: "Agricultural Activity", value: 71, correlation: 0.67 },
        { name: "Precipitation Decline", value: 55, correlation: -0.45 }
      ]
    },
    { 
      title: 'Vegetation Production', 
      value: selectedYear > 2020 ? '+8.2%' : selectedYear > 2015 ? '+6.7%' : '+4.2%', 
      description: 'Average increase in gross primary production since 2010',
      icon: <Sprout size={20} />,
      trend: { value: selectedYear > 2020 ? 8.2 : selectedYear > 2015 ? 6.7 : 4.2, isPositive: true },
      analyticsData: [
        { year: 2010, value: 1.5 },
        { year: 2012, value: 2.1 },
        { year: 2014, value: 2.9 },
        { year: 2016, value: 3.8 },
        { year: 2018, value: 5.2 },
        { year: 2020, value: 6.7 },
        { year: 2022, value: 7.5 },
        { year: 2023, value: 8.2 }
      ],
      correlations: [
        { name: "Rainfall", value: 78, correlation: 0.82 },
        { name: "Temperature", value: 68, correlation: -0.58 },
        { name: "Soil Quality", value: 72, correlation: 0.76 },
        { name: "Conservation Efforts", value: 63, correlation: 0.92 }
      ]
    },
    { 
      title: 'Annual Precipitation', 
      value: selectedYear > 2020 ? '685 mm' : selectedYear > 2015 ? '710 mm' : '745 mm', 
      description: 'Average annual rainfall across the Sahel region',
      icon: <CloudRain size={20} />,
      trend: { value: selectedYear > 2020 ? 3.5 : selectedYear > 2015 ? 2.1 : 1.2, isPositive: false },
      analyticsData: [
        { year: 2010, value: 780 },
        { year: 2012, value: 765 },
        { year: 2014, value: 752 },
        { year: 2016, value: 740 },
        { year: 2018, value: 725 },
        { year: 2020, value: 710 },
        { year: 2022, value: 695 },
        { year: 2023, value: 685 }
      ],
      correlations: [
        { name: "Temperature", value: 75, correlation: -0.65 },
        { name: "Vegetation Cover", value: 82, correlation: 0.78 },
        { name: "Drought Frequency", value: 68, correlation: -0.88 },
        { name: "Water Table Level", value: 59, correlation: 0.72 }
      ]
    },
    { 
      title: 'Population Growth', 
      value: selectedYear > 2020 ? '4.3%' : selectedYear > 2015 ? '3.8%' : '3.1%', 
      description: 'Annual population growth rate in urban centers',
      icon: <Users size={20} />,
      trend: { value: selectedYear > 2020 ? 4.3 : selectedYear > 2015 ? 3.8 : 3.1, isPositive: true },
      analyticsData: [
        { year: 2010, value: 2.3 },
        { year: 2012, value: 2.5 },
        { year: 2014, value: 2.8 },
        { year: 2016, value: 3.2 },
        { year: 2018, value: 3.5 },
        { year: 2020, value: 3.8 },
        { year: 2022, value: 4.1 },
        { year: 2023, value: 4.3 }
      ],
      correlations: [
        { name: "Urban Expansion", value: 85, correlation: 0.92 },
        { name: "Rural Migration", value: 78, correlation: 0.84 },
        { name: "Agricultural Land Loss", value: 65, correlation: 0.58 },
        { name: "Water Stress", value: 72, correlation: 0.62 }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Data Dashboard</h1>
              <p className="text-muted-foreground">
                Explore comprehensive data on land cover, vegetation, precipitation, and population in the Sahel region.
              </p>
            </div>
            <Link to="/temporal-analysis">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Expand size={16} />
                      <span className="hidden sm:inline">Temporal Analysis</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Expand to detailed temporal analysis view</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Link>
          </div>
          
          <div className="bg-white dark:bg-muted rounded-xl shadow-sm border border-border/40 p-6 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={18} className="text-primary" />
              <h3 className="text-lg font-medium">Time Period Selection</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Drag the slider to view data for different years between 2010 and 2023, or use auto-play to watch changes over time.
            </p>
            <YearSlider 
              minYear={2010} 
              maxYear={2023} 
              initialValue={selectedYear}
              onChange={handleYearChange}
              className="max-w-3xl mx-auto"
              autoPlay={false}
              autoPlayInterval={1500}
            />
          </div>
          
          <div className="bg-white dark:bg-muted rounded-xl shadow-sm border border-border/40 overflow-hidden mb-8">
            <div className="flex flex-wrap border-b border-border/40">
              {dataTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-sahel-green border-b-2 border-sahel-green"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.name}</span>
                </button>
              ))}
              
              <div className="ml-auto flex items-center px-4">
                <div className="flex items-center mr-4">
                  <Clock size={16} className="text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">Year: {selectedYear}</span>
                </div>
                
                <button className="p-2 rounded-md hover:bg-muted transition-colors">
                  <Filter size={16} className="text-muted-foreground" />
                </button>
                
                <button className="p-2 rounded-md hover:bg-muted transition-colors">
                  <Download size={16} className="text-muted-foreground" />
                </button>
                
                <Link 
                  to={`/temporal-analysis?tab=${activeTab}&year=${selectedYear}`} 
                  className="p-2 rounded-md hover:bg-muted transition-colors ml-1"
                >
                  <Expand size={16} className="text-muted-foreground" />
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {isLoading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-t-sahel-green border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-sm text-muted-foreground">Loading data...</p>
                  </div>
                </div>
              ) : (
                <div>
                  {activeTab === 'landCover' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-muted rounded-lg border border-border/40 p-6">
                          <h3 className="text-lg font-medium mb-4">Land Cover Distribution ({selectedYear})</h3>
                          <ChartCarousel 
                            data={chartData} 
                            timeSeriesData={timeSeriesData} 
                            dataType="landCover"
                          />
                          <div className="mt-4 text-sm text-muted-foreground">
                            <div className="flex items-start gap-2 mb-2">
                              <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                              <p>
                                Use the arrows to switch between chart views: bar chart, pie chart, and time series chart.
                                The time series chart shows how land cover has changed over the years.
                              </p>
                            </div>
                            <div className="mt-3 p-3 bg-muted rounded-md">
                              <h4 className="font-medium mb-2">Trend Analysis:</h4>
                              <p className="whitespace-pre-line">
                                {getTrendAnalysis()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-1 h-full">
                        <div className="h-[400px]">
                          <MapVisualization 
                            className="w-full h-full" 
                            year={selectedYear}
                            expandedView={true}
                            onStatsChange={handleStatsChange}
                            dataType="landCover"
                          />
                        </div>
                        <div className="text-center mt-3">
                          <a 
                            href="/sahel_map.html" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-sahel-blue flex items-center justify-center hover:underline"
                          >
                            <ZoomIn size={14} className="mr-1" /> 
                            Open full map view
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'vegetation' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-muted rounded-lg border border-border/40 p-6">
                          <h3 className="text-lg font-medium mb-4">Vegetation Productivity ({selectedYear})</h3>
                          <ChartCarousel 
                            data={vegetationChartData} 
                            timeSeriesData={vegetationTimeSeriesData}
                            dataType="vegetation"
                          />
                          <div className="mt-4 text-sm text-muted-foreground">
                            <div className="flex items-start gap-2 mb-2">
                              <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                              <p>
                                The charts show Gross Primary Production (GPP) data, which is a measure of vegetation productivity. 
                                Higher GPP values indicate greater photosynthetic activity and carbon sequestration.
                              </p>
                            </div>
                            <div className="mt-3 p-3 bg-muted rounded-md">
                              <h4 className="font-medium mb-2">Vegetation Productivity Analysis:</h4>
                              <p className="whitespace-pre-line">
                                {getVegetationTrendAnalysis()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-1 h-full">
                        <div className="h-[400px]">
                          <MapVisualization 
                            className="w-full h-full"
                            year={selectedYear}
                            expandedView={true}
                            onStatsChange={handleStatsChange}
                            dataType="vegetation"
                          />
                        </div>
                        <div className="text-center mt-3">
                          <a 
                            href="/sahel_map.html" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-sahel-blue flex items-center justify-center hover:underline"
                          >
                            <ZoomIn size={14} className="mr-1" /> 
                            Open full map view
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'precipitation' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-muted rounded-lg border border-border/40 p-6">
                          <h3 className="text-lg font-medium mb-4">Precipitation by Region ({selectedYear})</h3>
                          <ChartCarousel 
                            data={regionalPrecipChartData} 
                            timeSeriesData={regionalPrecipitationData}
                            dataType="precipitation"
                          />
                          <div className="mt-4 text-sm text-muted-foreground">
                            <div className="flex items-start gap-2 mb-2">
                              <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                              <p>
                                The charts show precipitation index values across different regions of the Sahel.
                                Higher values indicate greater rainfall in that region during the selected year.
                              </p>
                            </div>
                            <div className="mt-3 p-3 bg-muted rounded-md">
                              <h4 className="font-medium mb-2">Precipitation Trend Analysis:</h4>
                              <p className="whitespace-pre-line">
                                {getPrecipitationTrends()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-1 h-full">
                        <div className="h-[400px]">
                          <MapVisualization 
                            className="w-full h-full"
                            year={selectedYear}
                            expandedView={true}
                            onStatsChange={handleStatsChange}
                            dataType="precipitation"
                          />
                        </div>
                        <div className="text-center mt-3">
                          <a 
                            href="/sahel_map.html" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-sahel-blue flex items-center justify-center hover:underline"
                          >
                            <ZoomIn size={14} className="mr-1" /> 
                            Open full map view
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'population' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-muted rounded-lg border border-border/40 p-6">
                          <h3 className="text-lg font-medium mb-4">Population Distribution ({selectedYear})</h3>
                          <ChartCarousel 
                            data={populationChartData} 
                            timeSeriesData={[
                              { year: 2010, Urban: 1900000, Rural: 3500000, Nomadic: 850000, Total: 6250000 },
                              { year: 2015, Urban: 2100000, Rural: 3650000, Nomadic: 820000, Total: 6570000 },
                              { year: 2020, Urban: 2250000, Rural: 3750000, Nomadic: 800000, Total: 6800000 },
                              { year: 2023, Urban: 2350000, Rural: 3850000, Nomadic: 780000, Total: 6980000 }
                            ]}
                            dataType="population"
                          />
                          <div className="mt-4 text-sm text-muted-foreground">
                            <div className="flex items-start gap-2 mb-2">
                              <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                              <p>
                                The charts show population distribution across urban, rural, and nomadic communities.
                                Population trends reflect migration patterns and demographic changes in the region.
                              </p>
                            </div>
                            <div className="mt-3 p-3 bg-muted rounded-md">
                              <h4 className="font-medium mb-2">Population Trend Analysis:</h4>
                              <p className="whitespace-pre-line">
                                {getPopulationTrendAnalysis()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-1 h-full">
                        <div className="h-[400px]">
                          <MapVisualization 
                            className="w-full h-full"
                            year={selectedYear}
                            expandedView={true}
                            onStatsChange={handleStatsChange}
                            dataType="population"
                          />
                        </div>
                        <div className="text-center mt-3">
                          <a 
                            href="/sahel_map.html" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-sahel-blue flex items-center justify-center hover:underline"
                          >
                            <ZoomIn size={14} className="mr-1" /> 
                            Open full map view
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {keyStats.map((stat, index) => (
              <DataCard
                key={index}
                title={stat.title}
                value={stat.value}
                description={stat.description}
                icon={stat.icon}
                trend={stat.trend}
                analyticsData={stat.analyticsData}
                correlations={stat.correlations}
                year={selectedYear}
              />
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
