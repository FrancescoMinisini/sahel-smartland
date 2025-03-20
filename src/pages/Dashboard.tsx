import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DataCard from '@/components/DataCard';
import MapVisualization from '@/components/MapVisualization';
import YearSlider from '@/components/YearSlider';
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
  Info
} from 'lucide-react';
import { 
  landCoverClasses, 
  landCoverColors,
  regionalPrecipitationColors,
  getAccuratePrecipitationData,
  getPrecipitationTimeSeriesData,
  getLandCoverTimeSeriesData,
  loadPrecipitationByRegion,
  getGPPTimeSeriesData
} from '@/lib/geospatialUtils';
import ChartCarousel from '@/components/ChartCarousel';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('landCover');
  const [selectedYear, setSelectedYear] = useState(2023);
  const [landCoverStats, setLandCoverStats] = useState<Record<string, number>>({});
  const [previousYearStats, setPreviousYearStats] = useState<Record<string, number>>({});
  const [timeSeriesData, setTimeSeriesData] = useState<Array<{year: number, [key: string]: number}>>([]);
  const [regionalPrecipitationData, setRegionalPrecipitationData] = useState<Array<{year: number, Overall: number, South: number, Center: number, North: number}>>([]);
  const [vegetationTimeSeriesData, setVegetationTimeSeriesData] = useState<Array<{year: number, [key: string]: number}>>([]);
  
  const dataTabs = [
    { id: 'landCover', name: 'Land Cover', icon: <Layers size={16} /> },
    { id: 'vegetation', name: 'Vegetation', icon: <Leaf size={16} /> },
    { id: 'precipitation', name: 'Precipitation', icon: <CloudRain size={16} /> },
    { id: 'population', name: 'Population', icon: <Users size={16} /> },
  ];
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const landCoverData = await getLandCoverTimeSeriesData();
        setTimeSeriesData(landCoverData);
        
        const precipData = await loadPrecipitationByRegion();
        console.log("Loaded precipitation by region:", precipData);
        setRegionalPrecipitationData(precipData);

        const vegData = getGPPTimeSeriesData();
        console.log("Loaded vegetation time series data:", vegData);
        setVegetationTimeSeriesData(vegData);
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
    setIsLoading(true);
    setSelectedYear(year);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleStatsChange = (stats: Record<string, number>) => {
    setLandCoverStats(stats);
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

  const vegetationGPPChartData = [
    {
      name: 'Forest GPP',
      value: 175 + Math.sin(selectedYear - 2010) * 15,
      color: '#1a9850',
      change: 2.5,
      rawChange: 4
    },
    {
      name: 'Grassland GPP',
      value: 110 + Math.cos(selectedYear - 2010) * 10,
      color: '#fee08b',
      change: 1.8,
      rawChange: 2
    },
    {
      name: 'Cropland GPP',
      value: 130 + Math.sin(selectedYear - 2012) * 12,
      color: '#fc8d59',
      change: 3.2,
      rawChange: 4
    },
    {
      name: 'Shrubland GPP',
      value: 95 + Math.cos(selectedYear - 2011) * 8,
      color: '#91cf60',
      change: 1.5,
      rawChange: 1
    }
  ];

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

  const getVegetationTrendAnalysis = () => {
    if (vegetationTimeSeriesData.length < 2) {
      return "Insufficient data to analyze vegetation trends.";
    }
    
    const forestData = vegetationTimeSeriesData
      .filter(d => d.Forests !== undefined)
      .map(d => ({ year: d.year, value: d.Forests }));
      
    const barrenData = vegetationTimeSeriesData
      .filter(d => d.Barren !== undefined)
      .map(d => ({ year: d.year, value: d.Barren }));
    
    const grasslandsData = vegetationTimeSeriesData
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
    
    let analysisText = `Based on the observed data from ${vegetationTimeSeriesData[0].year} to ${vegetationTimeSeriesData[vegetationTimeSeriesData.length - 1].year}:\n\n`;
    
    analysisText += `• Forest GPP is ${forestTrend === "stable" ? "relatively stable" : forestTrend}`;
    analysisText += forestTrend === "decreasing" ? ", indicating potential deforestation concerns.\n" : 
                    forestTrend === "increasing" ? ", suggesting successful conservation efforts.\n" : ".\n";
    
    analysisText += `• Barren land GPP is ${barrenTrend === "stable" ? "relatively stable" : barrenTrend}`;
    analysisText += barrenTrend === "increasing" ? ", which may indicate desertification processes.\n" : 
                    barrenTrend === "decreasing" ? ", suggesting land rehabilitation success.\n" : ".\n";
    
    analysisText += `• Grasslands GPP is ${grasslandsTrend === "stable" ? "relatively stable" : grasslandsTrend}`;
    analysisText += grasslandsTrend === "increasing" ? ", which may indicate conversion from other land types.\n" : 
                    grasslandsTrend === "decreasing" ? ", suggesting possible conversion to cropland or urban areas.\n" : ".\n";
    
    return analysisText;
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
      icon: <BarChart2 size={20} />,
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Data Dashboard</h1>
            <p className="text-muted-foreground">
              Explore comprehensive data on land cover, vegetation, precipitation, and population in the Sahel region.
            </p>
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
                          />
                        </div>
                        <div className="text-center mt-3">
                          <Link 
                            to="/map" 
                            className="text-sm text-sahel-blue flex items-center justify-center hover:underline"
                          >
                            <ZoomIn size={14} className="mr-1" /> 
                            Open full map view
                          </Link>
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
                            data={vegetationGPPChartData} 
                            timeSeriesData={vegetationTimeSeriesData}
                            dataType="vegetation"
                          />
                          <div className="mt-4 text-sm text-muted-foreground">
                            <div className="flex items-start gap-2 mb-2">
                              <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                              <p>
                                Gross Primary Production (GPP) measures the rate at which vegetation captures and stores carbon from the atmosphere.
                                Higher values indicate more productive vegetation, measured in grams of carbon per square meter per year (gC/m²/year).
                              </p>
                            </div>
                            <div className="mt-3 p-3 bg-muted rounded-md">
                              <h4 className="font-medium mb-2">Vegetation Trend Analysis:</h4>
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
                          <Link 
                            to="/map" 
                            className="text-sm text-sahel-blue flex items-center justify-center hover:underline"
                          >
                            <ZoomIn size={14} className="mr-1" /> 
                            Open full map view
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'precipitation' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-muted rounded-lg border border-border/40 p-6">
                          <h3 className="text-lg font-medium mb-4">Regional Precipitation Analysis ({selectedYear})</h3>
                          <ChartCarousel 
                            data={regionalPrecipChartData} 
                            timeSeriesData={regionalPrecipitationData}
                            dataType="precipitation"
                          />
                          <div className="mt-4 text-sm text-muted-foreground">
                            <div className="flex items-start gap-2 mb-2">
                              <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                              <p>
                                Regional precipitation data shows how rainfall patterns vary across different regions of the Sahel.
                                The precipitation index values represent a normalized scale (multiplied by 1000 for visualization) where higher values indicate more precipitation.
                              </p>
                            </div>
                            <div className="mt-3 p-3 bg-muted rounded-md">
                              <h4 className="font-medium mb-2">Regional Trend Analysis:</h4>
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
                          <Link 
                            to="/map" 
                            className="text-sm text-sahel-blue flex items-center justify-center hover:underline"
                          >
                            <ZoomIn size={14} className="mr-1" /> 
                            Open full map view
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'population' && (
                    <div className="text-center p-8">
                      <h3 className="text-xl font-semibold mb-4">Population Density (2010-2023)</h3>
                      <p className="text-muted-foreground mb-6">
                        Analysis of population growth and distribution in the Sahel region.
                      </p>
                      <div className="h-48 bg-sahel-earth/10 rounded-lg flex items-center justify-center">
                        <Users size={48} className="text-sahel-earth/30" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6">
              <div className="w-10 h-10 rounded-lg bg-sahel-green/10 flex items-center justify-center mb-4">
                <FileText size={20} className="text-sahel-green" />
              </div>
              <h3 className="text-lg font-medium mb-2">Reports & Analysis</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Download detailed reports or browse through interactive analysis dashboards.
              </p>
              <button className="text-sm text-sahel-green flex items-center hover:underline">
                View reports <ArrowRight size={14} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
