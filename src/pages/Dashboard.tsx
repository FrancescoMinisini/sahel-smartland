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
  Info,
  Sprout,
  Trees,
  Home,
  Building,
  Tractor
} from 'lucide-react';
import { 
  landCoverClasses, 
  landCoverColors,
  regionalPrecipitationColors,
  getAccuratePopulationData,
  getPrecipitationTimeSeriesData,
  getLandCoverTimeSeriesData,
  loadPrecipitationByRegion,
  getVegetationTimeSeriesData,
  getPopulationTimeSeriesData,
  populationDensityScale,
  calculateTransitionStats
} from '@/lib/geospatialUtils';
import ChartCarousel from '@/components/ChartCarousel';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('landCover');
  const [selectedYear, setSelectedYear] = useState(2023);
  const [landCoverStats, setLandCoverStats] = useState<Record<string, number>>({});
  const [previousYearStats, setPreviousYearStats] = useState<Record<string, number>>({});
  const [vegetationStats, setVegetationStats] = useState<Record<string, number>>({});
  const [previousVegetationStats, setPreviousVegetationStats] = useState<Record<string, number>>({});
  const [populationStats, setPopulationStats] = useState<Record<string, number>>({});
  const [previousPopulationStats, setPreviousPopulationStats] = useState<Record<string, number>>({});
  const [transitionStats, setTransitionStats] = useState<Record<string, number>>({});
  const [previousTransitionStats, setPreviousTransitionStats] = useState<Record<string, number>>({});
  const [timeSeriesData, setTimeSeriesData] = useState<Array<{year: number, [key: string]: number}>>([]);
  const [vegetationTimeSeriesData, setVegetationTimeSeriesData] = useState<Array<{year: number, [key: string]: number}>>([]);
  const [populationTimeSeriesData, setPopulationTimeSeriesData] = useState<Array<{year: number, [key: string]: number}>>([]);
  const [regionalPrecipitationData, setRegionalPrecipitationData] = useState<Array<{year: number, Overall: number, South: number, Center: number, North: number}>>([]);
  
  const dataTabs = [
    { id: 'landCover', name: 'Land Cover', icon: <Layers size={16} /> },
    { id: 'vegetation', name: 'Vegetation', icon: <Leaf size={16} /> },
    { id: 'precipitation', name: 'Precipitation', icon: <CloudRain size={16} /> },
    { id: 'population', name: 'Population', icon: <Users size={16} /> },
    { id: 'transition', name: 'Land Transition', icon: <Map size={16} /> },
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
        
        // Load population data
        const populationData = getPopulationTimeSeriesData();
        console.log("Loaded population data:", populationData);
        setPopulationTimeSeriesData(populationData);
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
    setPreviousTransitionStats({...transitionStats});
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
    } else if (activeTab === 'transition') {
      setTransitionStats(stats);
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

  // Generate vegetation chart data from time series data
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

  // Generate population chart data from time series data or population stats
  const populationChartData = (() => {
    const currentYear = populationTimeSeriesData.find(d => d.year === selectedYear) ||
                        populationTimeSeriesData[populationTimeSeriesData.length - 1] ||
                        { 
                          year: selectedYear, 
                          Total: 394800, 
                          Urban: 142900, 
                          Rural: 251900,
                          Density: 29.9,
                          'Urban Growth': 4.3,
                          'Rural Growth': 0.9
                        };
    
    return [
      {
        name: 'Urban',
        value: currentYear.Urban || 142900,
        color: '#ce1256', // Dark purple
        change: 4.3,
        rawChange: 5800
      },
      {
        name: 'Rural',
        value: currentYear.Rural || 251900,
        color: '#df65b0', // Medium purple
        change: 0.9,
        rawChange: 2200
      }
    ];
  })();

  // Generate transition stats chart data
  const transitionChartData = (() => {
    // Use transition stats if available, otherwise use default values
    const significantChanges = transitionStats.significantChanges || 1250;
    const minorChanges = transitionStats.minorChanges || 3750;
    const stableAreas = transitionStats.stableAreas || 15000;
    const changeIndex = transitionStats.changeIndex || 18.5;
    
    return [
      {
        name: 'Significant Changes',
        value: significantChanges,
        color: '#7a0177', // Dark purple
        change: 3.2,
        rawChange: 40
      },
      {
        name: 'Minor Changes',
        value: minorChanges,
        color: '#f768a1', // Medium purple-pink
        change: 1.5,
        rawChange: 55
      },
      {
        name: 'Stable Areas',
        value: stableAreas,
        color: '#fcc5c0', // Light pink
        change: -1.2,
        rawChange: -180
      },
      {
        name: 'Change Index',
        value: changeIndex,
        color: '#ae017e', // Medium-dark purple
        change: 2.8,
        rawChange: 0.5
      }
    ];
  })();

  // Function to analyze population trends
  const getPopulationTrends = () => {
    if (populationTimeSeriesData.length < 2) {
      return "Insufficient data to analyze population trends.";
    }
    
    const firstYearData = populationTimeSeriesData[0];
    const lastYearData = populationTimeSeriesData[populationTimeSeriesData.length - 1];
    
    const totalChange = ((lastYearData.Total - firstYearData.Total) / firstYearData.Total) * 100;
    const urbanChange = ((lastYearData.Urban - firstYearData.Urban) / firstYearData.Urban) * 100;
    const ruralChange = ((lastYearData.Rural - firstYearData.Rural) / firstYearData.Rural) * 100;
    const densityChange = ((lastYearData.Density - firstYearData.Density) / firstYearData.Density) * 100;
    
    return `Based on population data from ${firstYearData.year} to ${lastYearData.year}:
    
• The total population has increased by ${totalChange.toFixed(1)}% over the past ${lastYearData.year - firstYearData.year} years.
• Urban population has grown by ${urbanChange.toFixed(1)}%, while rural population has increased by only ${ruralChange.toFixed(1)}%.
• Population density has increased from ${firstYearData.Density.toFixed(1)} to ${lastYearData.Density.toFixed(1)} people/km², a change of ${densityChange.toFixed(1)}%.

The data shows a significant trend toward urbanization, with urban growth rates consistently ${lastYearData['Urban Growth'] > lastYearData['Rural Growth'] ? 'higher' : 'lower'} than rural growth rates.

This urbanization pattern has important implications for land use change, resource allocation, and infrastructure development in the Sahel region. Urban centers are experiencing more rapid growth, which may be linked to rural-to-urban migration, economic opportunities, and changing settlement patterns.`;
  };

  // Function to analyze land cover transition trends
  const getTransitionTrends = () => {
    if (!transitionStats || !timeSeriesData || timeSeriesData.length < 2) {
      return "Insufficient data to analyze land cover transition trends.";
    }
    
    // Use transition stats if available, otherwise use default values
    const significantChanges = transitionStats.significantChanges || 1250;
    const minorChanges = transitionStats.minorChanges || 3750;
    const stableAreas = transitionStats.stableAreas || 15000;
    const changeIndex = transitionStats.changeIndex || 18.5;
    
    // Calculate percentages
    const totalPixels = significantChanges + minorChanges + stableAreas;
    const significantPct = (significantChanges / totalPixels) * 100;
    const minorPct = (minorChanges / totalPixels) * 100;
    const stablePct = (stableAreas / totalPixels) * 100;
    
    return `Land Cover Transition Analysis between ${selectedYear > 2010 ? selectedYear - 1 : 2010} and ${selectedYear}:
    
• ${stablePct.toFixed(1)}% of the landscape remained stable with no detectable land cover changes.
• ${minorPct.toFixed(1)}% experienced minor transitions between similar land cover classes.
• ${significantPct.toFixed(1)}% underwent significant transitions between different land cover types.

The overall Change Index of ${changeIndex.toFixed(1)} indicates ${
      changeIndex > 20 ? 'a high rate of' : 
      changeIndex > 10 ? 'a moderate rate of' : 
      'a relatively low rate of'
    } land cover change during this period.

Primary transition patterns include:
• Conversion from natural vegetation to croplands
• Expansion of barren areas in previously vegetated regions
• Urbanization of previously agricultural or natural areas

These changes reflect the dynamic nature of land use in the Sahel region, influenced by climate variability, human activities, and development patterns.`;
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
                            dataType="landCover"
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-muted rounded-lg border border-border/40 p-6">
                          <h3 className="text-lg font-medium mb-4">Population Distribution ({selectedYear})</h3>
                          <ChartCarousel 
                            data={populationChartData} 
                            timeSeriesData={populationTimeSeriesData}
                            dataType="population"
                          />
                          <div className="mt-4 text-sm text-muted-foreground">
                            <div className="flex items-start gap-2 mb-2">
                              <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                              <p>
                                Population data shows the distribution between urban and rural areas, as well as growth trends over time.
                                The population density map highlights concentrations of people across the region.
                              </p>
                            </div>
                            <div className="mt-3 p-3 bg-muted rounded-md">
                              <h4 className="font-medium mb-2">Population Trend Analysis:</h4>
                              <p className="whitespace-pre-line">
                                {getPopulationTrends()}
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
                  
                  {activeTab === 'transition' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-muted rounded-lg border border-border/40 p-6">
                          <h3 className="text-lg font-medium mb-4">Land Cover Transitions ({selectedYear > 2010 ? `${selectedYear-1} to ${selectedYear}` : '2010 to 2011'})</h3>
                          <ChartCarousel 
                            data={transitionChartData} 
                            timeSeriesData={[]} // No time series data for transitions yet
                            dataType="transition"
                          />
                          <div className="mt-4 text-sm text-muted-foreground">
                            <div className="flex items-start gap-2 mb-2">
                              <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                              <p>
                                The land cover transition analysis shows areas of change between consecutive years.
                                Darker areas on the map indicate more significant transitions between land cover types.
                              </p>
                            </div>
                            <div className="mt-3 p-3 bg-muted rounded-md">
                              <h4 className="font-medium mb-2">Land Cover Transition Analysis:</h4>
                              <p className="whitespace-pre-line">
                                {getTransitionTrends()}
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
                            dataType="transition"
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
            
            <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6">
              <div className="w-10 h-10 rounded-lg bg-sahel-blue/10 flex items-center justify-center mb-4">
                <Users size={20} className="text-sahel-blue" />
              </div>
              <h3 className="text-lg font-medium mb-2">Population Insights</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Explore demographic patterns and their relationship with land use changes.
              </p>
              <button className="text-sm text-sahel-blue flex items-center hover:underline">
                View demographics <ArrowRight size={14} className="ml-1" />
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6">
              <div className="w-10 h-10 rounded-lg bg-sahel-earth/10 flex items-center justify-center mb-4">
                <Building size={20} className="text-sahel-earth" />
              </div>
              <h3 className="text-lg font-medium mb-2">Settlement Analysis</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Review urban expansion patterns and infrastructure development over time.
              </p>
              <button className="text-sm text-sahel-earth flex items-center hover:underline">
                View settlements <ArrowRight size={14} className="ml-1" />
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
