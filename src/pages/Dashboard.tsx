
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DataCard from '@/components/DataCard';
import MapVisualization from '@/components/MapVisualization';
import YearSlider from '@/components/YearSlider';
import ChartCarousel from '@/components/ChartCarousel';
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
import { landCoverClasses, landCoverColors } from '@/lib/geospatialUtils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('landCover');
  const [selectedYear, setSelectedYear] = useState(2023);
  const [landCoverStats, setLandCoverStats] = useState<Record<string, number>>({});
  const [previousYearStats, setPreviousYearStats] = useState<Record<string, number>>({});
  const [timeSeriesData, setTimeSeriesData] = useState<Array<{year: number, [key: string]: number}>>([]);
  
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
    
    setTimeSeriesData(prevData => {
      const existingIndex = prevData.findIndex(item => item.year === selectedYear);
      
      const newDataPoint = { year: selectedYear };
      
      Object.entries(stats)
        .filter(([key]) => key !== '0')
        .forEach(([key, value]) => {
          const className = landCoverClasses[Number(key) as keyof typeof landCoverClasses] || `Class ${key}`;
          newDataPoint[className] = Math.round(value / 1000);
        });
      
      if (existingIndex >= 0) {
        const newData = [...prevData];
        newData[existingIndex] = newDataPoint;
        return newData;
      } else {
        return [...prevData, newDataPoint].sort((a, b) => a.year - b.year);
      }
    });
  };

  const chartData = Object.entries(landCoverStats)
    .filter(([key]) => key !== '0')
    .map(([key, value]) => {
      const landCoverKey = Number(key);
      const previousValue = previousYearStats[key] || value;
      const changeValue = value - previousValue;
      
      return {
        name: landCoverClasses[landCoverKey as keyof typeof landCoverClasses] || `Class ${key}`,
        value: Math.round(value / 1000),
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
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              
              <div className="flex items-center gap-2">
                <div className="bg-white dark:bg-muted rounded-lg border border-border/40 px-4 py-2 flex items-center gap-2">
                  <Calendar size={16} className="text-muted-foreground" />
                  <span className="text-sm">{selectedYear}</span>
                </div>
                
                <Link 
                  to="/reports" 
                  className="bg-white dark:bg-muted rounded-lg border border-border/40 px-4 py-2 flex items-center gap-2 hover:bg-muted/80 transition-colors"
                >
                  <FileText size={16} className="text-muted-foreground" />
                  <span className="text-sm">Reports</span>
                </Link>
                
                <button className="bg-white dark:bg-muted rounded-lg border border-border/40 px-4 py-2 flex items-center gap-2 hover:bg-muted/80 transition-colors">
                  <Download size={16} className="text-muted-foreground" />
                  <span className="text-sm">Export</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {keyStats.map((stat, index) => (
                <DataCard 
                  key={index} 
                  title={stat.title}
                  value={stat.value}
                  description={stat.description}
                  icon={stat.icon}
                  trend={stat.trend}
                  analyticsData={stat.analyticsData}
                />
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-muted rounded-lg border border-border/40 overflow-hidden">
                  <div className="border-b border-border/40 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-medium">Data Explorer</h2>
                      
                      <div className="flex items-center space-x-1">
                        {dataTabs.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`flex items-center px-3 py-2 text-sm rounded-md ${
                              activeTab === tab.id
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted/80'
                            }`}
                          >
                            <span className="flex items-center">
                              {tab.icon}
                              <span className="ml-2">{tab.name}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-[400px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Filter size={16} className="text-muted-foreground" />
                            <h3 className="text-sm font-medium">Year Filter</h3>
                          </div>
                          
                          <div className="w-full md:w-1/2">
                            <YearSlider 
                              minYear={2010} 
                              maxYear={2023} 
                              initialValue={selectedYear}
                              onChange={handleYearChange}
                              showLabels={true}
                              autoPlay={false}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6">
                          {activeTab === 'landCover' && (
                            <>
                              <div className="aspect-video relative bg-muted/40 rounded-lg overflow-hidden border border-border/40">
                                <MapVisualization 
                                  year={selectedYear} 
                                  dataType="landCover"
                                  onStatsChange={handleStatsChange}
                                />
                                
                                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                                  <button className="bg-background/80 backdrop-blur-sm p-2 rounded-md shadow-sm hover:bg-background/90 transition-colors">
                                    <ZoomIn size={18} />
                                  </button>
                                  <button className="bg-background/80 backdrop-blur-sm p-2 rounded-md shadow-sm hover:bg-background/90 transition-colors">
                                    <Layers size={18} />
                                  </button>
                                  <button className="bg-background/80 backdrop-blur-sm p-2 rounded-md shadow-sm hover:bg-background/90 transition-colors">
                                    <Info size={18} />
                                  </button>
                                </div>
                              </div>
                              
                              <ChartCarousel chartData={chartData} className="mt-4" year={selectedYear} />
                              
                              <div className="bg-white dark:bg-muted rounded-lg border border-border/40 p-6">
                                <h3 className="text-lg font-medium mb-4">Trend Analysis</h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-line">
                                  {getTrendAnalysis()}
                                </p>
                              </div>
                            </>
                          )}
                          
                          {activeTab === 'vegetation' && (
                            <div className="aspect-video bg-muted/40 rounded-lg flex items-center justify-center">
                              <p className="text-muted-foreground">Vegetation data visualization will appear here.</p>
                            </div>
                          )}
                          
                          {activeTab === 'precipitation' && (
                            <div className="aspect-video bg-muted/40 rounded-lg flex items-center justify-center">
                              <p className="text-muted-foreground">Precipitation data visualization will appear here.</p>
                            </div>
                          )}
                          
                          {activeTab === 'population' && (
                            <div className="aspect-video bg-muted/40 rounded-lg flex items-center justify-center">
                              <p className="text-muted-foreground">Population data visualization will appear here.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-muted rounded-lg border border-border/40 p-6">
                  <h3 className="text-lg font-medium mb-4">Historical Trends</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={timeSeriesData}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {Object.keys(landCoverClasses).map((key, index) => {
                          const className = landCoverClasses[Number(key) as keyof typeof landCoverClasses];
                          const color = landCoverColors[Number(key) as keyof typeof landCoverColors] || "#000000";
                          if (className && timeSeriesData.some(d => d[className] !== undefined)) {
                            return (
                              <Area
                                key={key}
                                type="monotone"
                                dataKey={className}
                                stackId="1"
                                stroke={color}
                                fill={color}
                              />
                            );
                          }
                          return null;
                        })}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                      <p>
                        The chart shows how different land cover types have changed over time. 
                        Add more years of data by selecting different years in the slider above.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-muted rounded-lg border border-border/40 p-6">
                  <h3 className="text-lg font-medium mb-4">Key Insights</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="bg-primary/10 text-primary p-2 rounded-md">
                        <Leaf size={18} />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Vegetation Recovery</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Several regions show signs of vegetation recovery, with a 12% increase in forested areas since 2015.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-destructive/10 text-destructive p-2 rounded-md">
                        <CloudRain size={18} />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Declining Rainfall</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Annual precipitation has decreased by 8.5% over the past decade, impacting agricultural productivity.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-warning/10 text-warning p-2 rounded-md">
                        <Users size={18} />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Population Pressure</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Urban expansion has accelerated by 23% in the last 5 years, driving land cover change in surrounding areas.
                        </p>
                      </div>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link to="/reports" className="text-sm text-primary flex items-center hover:underline">
                      View detailed reports
                      <ArrowRight size={14} className="ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
