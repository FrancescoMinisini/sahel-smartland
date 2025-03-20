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
  ZoomIn
} from 'lucide-react';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('landCover');
  const [selectedYear, setSelectedYear] = useState(2023);
  
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
    setIsLoading(true);
    setSelectedYear(year);
    
    // Simulate data loading for the new year
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
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
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Data Dashboard</h1>
            <p className="text-muted-foreground">
              Explore comprehensive data on land cover, vegetation, precipitation, and population in the Sahel region.
            </p>
          </div>
          
          {/* Year Slider */}
          <div className="bg-white dark:bg-muted rounded-xl shadow-sm border border-border/40 p-6 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={18} className="text-primary" />
              <h3 className="text-lg font-medium">Time Period Selection</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Drag the slider to view data for different years between 2010 and 2023.
            </p>
            <YearSlider 
              minYear={2010} 
              maxYear={2023} 
              initialValue={selectedYear}
              onChange={handleYearChange}
              className="max-w-3xl mx-auto"
            />
          </div>
          
          {/* Key Statistics */}
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
          
          {/* Main Dashboard Content */}
          <div className="bg-white dark:bg-muted rounded-xl shadow-sm border border-border/40 overflow-hidden mb-8">
            {/* Dashboard Tabs */}
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
            
            {/* Dashboard Content */}
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
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                      <div className="bg-muted/30 rounded-lg h-[400px] p-4 flex items-center justify-center">
                        {activeTab === 'landCover' && (
                          <div className="text-center p-8">
                            <h3 className="text-xl font-semibold mb-4">Land Cover Change (2010-2023)</h3>
                            <p className="text-muted-foreground mb-6">
                              Visualization of land cover changes in the Sahel region over the past decade.
                            </p>
                            <div className="h-48 bg-sahel-sandLight rounded-lg flex items-center justify-center">
                              <BarChart2 size={48} className="text-sahel-earth/30" />
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
                          <div className="text-center p-8">
                            <h3 className="text-xl font-semibold mb-4">Precipitation Patterns (2010-2023)</h3>
                            <p className="text-muted-foreground mb-6">
                              Visualization of annual rainfall data across the Sahel region.
                            </p>
                            <div className="h-48 bg-sahel-blue/10 rounded-lg flex items-center justify-center">
                              <CloudRain size={48} className="text-sahel-blue/30" />
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
                    </div>
                    
                    <div className="lg:w-1/3">
                      <MapVisualization className="h-[400px]" year={selectedYear} />
                      <div className="mt-2 text-center">
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
                </div>
              )}
            </div>
          </div>
          
          {/* Moved Key Findings section here */}
          <div className="bg-white dark:bg-muted rounded-xl shadow-sm border border-border/40 overflow-hidden mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Key Findings</h3>
              <div className="bg-muted/30 rounded-lg p-6">
                {activeTab === 'landCover' && (
                  <div>
                    <p className="mb-4">Analysis of 20 years of land cover data reveals several key trends:</p>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start">
                        <div className="w-5 h-5 rounded-full bg-sahel-green/10 flex items-center justify-center shrink-0 mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-sahel-green"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </div>
                        <span className="ml-3 text-sm">Significant conversion of natural vegetation to croplands in southern Sahel regions</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-5 h-5 rounded-full bg-sahel-green/10 flex items-center justify-center shrink-0 mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-sahel-green"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </div>
                        <span className="ml-3 text-sm">Urban expansion around major cities, with a 35% increase in urban area since 2010</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-5 h-5 rounded-full bg-sahel-green/10 flex items-center justify-center shrink-0 mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-sahel-green"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </div>
                        <span className="ml-3 text-sm">Restoration efforts showing positive results in targeted areas, with 1.2M ha restored</span>
                      </li>
                    </ul>
                    <Link 
                      to="/reports" 
                      className="text-sm text-sahel-blue flex items-center hover:underline"
                    >
                      View detailed land cover report
                      <ArrowRight size={14} className="ml-1" />
                    </Link>
                  </div>
                )}
                
                {activeTab === 'vegetation' && (
                  <div>
                    <p className="mb-4">Analysis of vegetation productivity data reveals:</p>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start">
                        <div className="w-5 h-5 rounded-full bg-sahel-green/10 flex items-center justify-center shrink-0 mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-sahel-green"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </div>
                        <span className="ml-3 text-sm">Overall increase in gross primary production by 8.2% since 2010</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-5 h-5 rounded-full bg-sahel-green/10 flex items-center justify-center shrink-0 mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-sahel-green"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </div>
                        <span className="ml-3 text-sm">Hotspots of declining productivity in regions with excessive agricultural expansion</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-5 h-5 rounded-full bg-sahel-green/10 flex items-center justify-center shrink-0 mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-sahel-green"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </div>
                        <span className="ml-3 text-sm">Positive correlation between restoration efforts and increased vegetation productivity</span>
                      </li>
                    </ul>
                    <Link 
                      to="/reports" 
                      className="text-sm text-sahel-blue flex items-center hover:underline"
                    >
                      View detailed vegetation report
                      <ArrowRight size={14} className="ml-1" />
                    </Link>
                  </div>
                )}
                
                {activeTab === 'precipitation' && (
                  <div>
                    <p className="mb-4">Analysis of precipitation data shows:</p>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start">
                        <div className="w-5 h-5 rounded-full bg-sahel-green/10 flex items-center justify-center shrink-0 mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-sahel-green"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </div>
                        <span className="ml-3 text-sm">Increasing variability in annual rainfall patterns across the Sahel</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-5 h-5 rounded-full bg-sahel-green/10 flex items-center justify-center shrink-0 mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-sahel-green"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </div>
                        <span className="ml-3 text-sm">Overall decrease in rainfall by 3.5% in northern regions since 2010</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-5 h-5 rounded-full bg-sahel-green/10 flex items-center justify-center shrink-0 mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-sahel-green"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </div>
                        <span className="ml-3 text-sm">Increased frequency of extreme rainfall events in southern Sahel regions</span>
                      </li>
                    </ul>
                    <Link 
                      to="/reports" 
                      className="text-sm text-sahel-blue flex items-center hover:underline"
                    >
                      View detailed climate report
                      <ArrowRight size={14} className="ml-1" />
                    </Link>
                  </div>
                )}
                
                {activeTab === 'population' && (
                  <div>
                    <p className="mb-4">Analysis of population data indicates:</p>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start">
                        <div className="w-5 h-5 rounded-full bg-sahel-green/10 flex items-center justify-center shrink-0 mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-sahel-green"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </div>
                        <span className="ml-3 text-sm">Rapid urban population growth at 4.3% annually, exceeding national averages</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-5 h-5 rounded-full bg-sahel-green/10 flex items-center justify-center shrink-0 mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-sahel-green"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </div>
                        <span className="ml-3 text-sm">Migration from rural to urban areas correlating with land degradation hotspots</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-5 h-5 rounded-full bg-sahel-green/10 flex items-center justify-center shrink-0 mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-sahel-green"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </div>
                        <span className="ml-3 text-sm">Population pressure on natural resources highest in peri-urban regions</span>
                      </li>
                    </ul>
                    <Link 
                      to="/reports" 
                      className="text-sm text-sahel-blue flex items-center hover:underline"
                    >
                      View detailed population report
                      <ArrowRight size={14} className="ml-1" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6">
              <div className="w-10 h-10 rounded-lg bg-sahel-green/10 flex items-center justify-center mb-4">
                <Calendar className="h-5 w-5 text-sahel-green" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Temporal Analysis</h3>
              <p className="text-muted-foreground mb-4">Explore data trends over time with our interactive time series tools.</p>
              <Link 
                to="/dashboard/temporal" 
                className="text-sm text-sahel-blue flex items-center hover:underline"
              >
                View time series
                <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6">
              <div className="w-10 h-10 rounded-lg bg-sahel-blue/10 flex items-center justify-center mb-4">
                <Map className="h-5 w-5 text-sahel-blue" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Spatial Analysis</h3>
              <p className="text-muted-foreground mb-4">Analyze geographic patterns and spatial relationships in the data.</p>
              <Link 
                to="/map" 
                className="text-sm text-sahel-blue flex items-center hover:underline"
              >
                Open interactive map
                <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6">
              <div className="w-10 h-10 rounded-lg bg-sahel-earth/10 flex items-center justify-center mb-4">
                <FileText className="h-5 w-5 text-sahel-earth" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Reports & Insights</h3>
              <p className="text-muted-foreground mb-4">Access detailed reports and recommendations for land restoration.</p>
              <Link 
                to="/reports" 
                className="text-sm text-sahel-blue flex items-center hover:underline"
              >
                View reports
                <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
