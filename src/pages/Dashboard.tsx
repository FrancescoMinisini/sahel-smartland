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
  getAccuratePrecipitationData,
  getPrecipitationTimeSeriesData 
} from '@/lib/geospatialUtils';
import ChartCarousel from '@/components/ChartCarousel';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('landCover');
  const [selectedYear, setSelectedYear] = useState(2023);
  const [landCoverStats, setLandCoverStats] = useState<Record<string, number>>({});
  const [previousYearStats, setPreviousYearStats] = useState<Record<string, number>>({});
  
  // Use the more accurate precipitation data from our utility function
  const accuratePrecipData = getAccuratePrecipitationData(selectedYear);
  
  const [precipitationData] = useState([
    {
      name: 'Annual Rainfall',
      value: accuratePrecipData.annual,
      color: '#4575b4',
      change: selectedYear > 2020 ? -3.5 : selectedYear > 2015 ? -2.1 : -1.2,
      rawChange: selectedYear > 2020 ? -5.7 : selectedYear > 2015 ? -3.8 : -2.2
    },
    {
      name: 'Dry Season',
      value: accuratePrecipData.dryseason,
      color: '#74add1',
      change: selectedYear > 2020 ? -9.8 : selectedYear > 2015 ? -7.2 : -4.8,
      rawChange: selectedYear > 2020 ? -2.2 : selectedYear > 2015 ? -1.6 : -1.1
    },
    {
      name: 'Wet Season',
      value: accuratePrecipData.wetseason,
      color: '#91bfdb',
      change: selectedYear > 2020 ? -4.1 : selectedYear > 2015 ? -2.6 : -1.4,
      rawChange: selectedYear > 2020 ? -7.5 : selectedYear > 2015 ? -4.8 : -2.6
    }
  ]);
  
  // Use our utility function to get the complete time series data with the correct type
  const [precipTimeSeriesData] = useState<Array<{ year: number, [key: string]: number }>>(getPrecipitationTimeSeriesData());
  
  const [timeSeriesData] = useState([
    {
      year: 2010,
      Forests: 850,
      Shrublands: 1200,
      Grasslands: 1500,
      Croplands: 900,
      Urban: 350,
      Barren: 700,
      Water: 200,
      Wetlands: 150
    },
    {
      year: 2012,
      Forests: 820,
      Shrublands: 1180,
      Grasslands: 1450,
      Croplands: 950,
      Urban: 380,
      Barren: 720,
      Water: 200,
      Wetlands: 140
    },
    {
      year: 2014,
      Forests: 800,
      Shrublands: 1150,
      Grasslands: 1400,
      Croplands: 1000,
      Urban: 420,
      Barren: 730,
      Water: 195,
      Wetlands: 135
    },
    {
      year: 2016,
      Forests: 780,
      Shrublands: 1100,
      Grasslands: 1350,
      Croplands: 1050,
      Urban: 460,
      Barren: 750,
      Water: 190,
      Wetlands: 130
    },
    {
      year: 2018,
      Forests: 760,
      Shrublands: 1050,
      Grasslands: 1300,
      Croplands: 1100,
      Urban: 500,
      Barren: 780,
      Water: 185,
      Wetlands: 125
    },
    {
      year: 2020,
      Forests: 740,
      Shrublands: 1000,
      Grasslands: 1250,
      Croplands: 1150,
      Urban: 540,
      Barren: 810,
      Water: 180,
      Wetlands: 120
    },
    {
      year: 2022,
      Forests: 720,
      Shrublands: 950,
      Grasslands: 1200,
      Croplands: 1200,
      Urban: 580,
      Barren: 840,
      Water: 175,
      Wetlands: 115
    },
    {
      year: 2023,
      Forests: 710,
      Shrublands: 925,
      Grasslands: 1175,
      Croplands: 1225,
      Urban: 600,
      Barren: 855,
      Water: 170,
      Wetlands: 110
    }
  ]);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
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
    
    const urbanData = timeSeriesData
      .filter(d => d.Urban !== undefined)
      .map(d => ({ year: d.year, value: d.Urban }));
    
    let forestTrend = "stable";
    let barrenTrend = "stable";
    let urbanTrend = "stable";
    
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
    
    if (urbanData.length >= 2) {
      const firstUrban = urbanData[0].value;
      const lastUrban = urbanData[urbanData.length - 1].value;
      if (lastUrban > firstUrban * 1.05) urbanTrend = "increasing";
      else if (lastUrban < firstUrban * 0.95) urbanTrend = "decreasing";
    }
    
    let analysisText = `Based on the observed data from ${timeSeriesData[0].year} to ${timeSeriesData[timeSeriesData.length - 1].year}:\n\n`;
    
    analysisText += `• Forest coverage is ${forestTrend === "stable" ? "relatively stable" : forestTrend}`;
    analysisText += forestTrend === "decreasing" ? ", indicating potential deforestation concerns.\n" : 
                    forestTrend === "increasing" ? ", suggesting successful conservation efforts.\n" : ".\n";
    
    analysisText += `• Barren land is ${barrenTrend === "stable" ? "relatively stable" : barrenTrend}`;
    analysisText += barrenTrend === "increasing" ? ", which may indicate desertification processes.\n" : 
                    barrenTrend === "decreasing" ? ", suggesting land rehabilitation success.\n" : ".\n";
    
    analysisText += `• Urban areas are ${urbanTrend === "stable" ? "relatively stable" : urbanTrend}`;
    analysisText += urbanTrend === "increasing" ? ", indicating expansion of human settlements and infrastructure.\n" : 
                    urbanTrend === "decreasing" ? ", which is unusual and may warrant verification.\n" : ".\n";
    
    return analysisText;
  };

  const dataTabs = [
    { id: 'landCover', name: 'Land Cover', icon: <Layers size={16} /> },
    { id: 'vegetation', name: 'Vegetation', icon: <Leaf size={16} /> },
    { id: 'precipitation', name: 'Precipitation', icon: <CloudRain size={16} /> },
    { id: 'population', name: 'Population', icon: <Users size={16} /> },
  ];

  // Update enhanced precipitation data to use our more accurate values
  const enhancedPrecipitationData = [
    {
      name: 'Annual Rainfall',
      value: accuratePrecipData.annual,
      color: '#4575b4',
      change: selectedYear > 2020 ? -3.5 : selectedYear > 2015 ? -2.1 : -1.2,
      rawChange: selectedYear > 2020 ? -5.7 : selectedYear > 2015 ? -3.8 : -2.2
    },
    {
      name: 'Dry Season',
      value: accuratePrecipData.dryseason,
      color: '#74add1',
      change: selectedYear > 2020 ? -9.8 : selectedYear > 2015 ? -7.2 : -4.8,
      rawChange: selectedYear > 2020 ? -2.2 : selectedYear > 2015 ? -1.6 : -1.1
    },
    {
      name: 'Wet Season',
      value: accuratePrecipData.wetseason,
      color: '#91bfdb',
      change: selectedYear > 2020 ? -4.1 : selectedYear > 2015 ? -2.6 : -1.4,
      rawChange: selectedYear > 2020 ? -7.5 : selectedYear > 2015 ? -4.8 : -2.6
    },
    {
      name: 'Extreme Events',
      value: accuratePrecipData.extremeEvents,
      color: '#d73027',
      change: selectedYear > 2020 ? 14.3 : selectedYear > 2015 ? 25.0 : 11.1,
      rawChange: selectedYear > 2020 ? 1 : selectedYear > 2015 ? 1 : 0.5
    },
    {
      name: 'Water Stress Index',
      value: accuratePrecipData.waterStressIndex,
      color: '#fc8d59',
      change: selectedYear > 2020 ? 7.9 : selectedYear > 2015 ? 12.5 : 6.5,
      rawChange: selectedYear > 2020 ? 5 : selectedYear > 2015 ? 5 : 3
    }
  ];

  const getPrecipitationTrends = () => {
    const firstYearData = precipTimeSeriesData[0];
    const lastYearData = precipTimeSeriesData[precipTimeSeriesData.length - 1];
    
    const annualChange = ((lastYearData.Annual - firstYearData.Annual) / firstYearData.Annual) * 100;
    const drySeasonChange = ((lastYearData['Dry Season'] - firstYearData['Dry Season']) / firstYearData['Dry Season']) * 100;
    const eventsChange = ((lastYearData['Extreme Events'] - firstYearData['Extreme Events']) / firstYearData['Extreme Events']) * 100;
    const stressChange = ((lastYearData['Water Stress Index'] - firstYearData['Water Stress Index']) / firstYearData['Water Stress Index']) * 100;
    
    return `Based on the precipitation data from 2010 to 2023:
    
• Annual rainfall has decreased by approximately ${Math.abs(annualChange).toFixed(1)}% (${(firstYearData.Annual - lastYearData.Annual).toFixed(1)}mm) over the past 13 years.
• Dry season precipitation shows the most significant decline at ${Math.abs(drySeasonChange).toFixed(1)}% (${(firstYearData['Dry Season'] - lastYearData['Dry Season']).toFixed(1)}mm).
• The frequency of extreme weather events (droughts, flash floods) has increased from ${firstYearData['Extreme Events']} to ${lastYearData['Extreme Events']} annually (${eventsChange.toFixed(0)}% increase).
• The Water Stress Index has increased by ${stressChange.toFixed(1)}%, indicating growing water scarcity concerns.
• Areas with over 200mm annual rainfall have decreased by approximately 18% in spatial coverage.

This trend correlates with observed changes in vegetation patterns and may contribute to desertification processes in vulnerable areas, particularly in the northern regions.`;
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
                    <div className="text-center p-8">
                      <h3 className="text-xl font-semibold mb-4">Vegetation Productivity (2010-2023)</h3>
                      <p className="text-muted-foreground mb-6">
                        Analysis of gross primary production trends across the Sahel region.
                      </p>
                      <div className="h-48 bg-sahel-greenLight/10 rounded-lg flex items-center justify-center">
                        <Leaf size={48} className="text-sahel-green/30" />
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'precipitation' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-muted rounded-lg border border-border/40 p-6">
                          <h3 className="text-lg font-medium mb-4">Precipitation Analysis ({selectedYear})</h3>
                          <ChartCarousel 
                            data={enhancedPrecipitationData} 
                            timeSeriesData={precipTimeSeriesData}
                            dataType="precipitation"
                          />
                          <div className="mt-4 text-sm text-muted-foreground">
                            <div className="flex items-start gap-2 mb-2">
                              <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                              <p>
                                Precipitation data shows rainfall measurements (mm), extreme weather event frequency, 
                                and water stress index, which measures water scarcity relative to demand (higher values indicate 
                                more severe water stress).
                              </p>
                            </div>
                            <div className="mt-3 p-3 bg-muted rounded-md">
                              <h4 className="font-medium mb-2">Trend Analysis:</h4>
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

