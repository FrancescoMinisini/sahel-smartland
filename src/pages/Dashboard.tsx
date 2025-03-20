import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DataCard from '@/components/DataCard';
import MapVisualization from '@/components/MapVisualization';
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
  const [yearRange, setYearRange] = useState([2010, 2023]);
  
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

  const handleYearChange = (range: number[]) => {
    setYearRange(range);
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
      value: '27.3M ha', 
      description: 'Area affected by land cover change in the past 20 years',
      icon: <Leaf size={20} />,
      trend: { value: 15, isPositive: false }
    },
    { 
      title: 'Vegetation Production', 
      value: '+8.2%', 
      description: 'Average increase in gross primary production since 2010',
      icon: <BarChart2 size={20} />,
      trend: { value: 8.2, isPositive: true }
    },
    { 
      title: 'Annual Precipitation', 
      value: '685 mm', 
      description: 'Average annual rainfall across the Sahel region',
      icon: <CloudRain size={20} />,
      trend: { value: 3.5, isPositive: false }
    },
    { 
      title: 'Population Growth', 
      value: '4.3%', 
      description: 'Annual population growth rate in urban centers',
      icon: <Users size={20} />,
      trend: { value: 4.3, isPositive: true }
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-muted/30 dark:bg-gray-900">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-6">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 dark:text-white">Data Dashboard</h1>
            <p className="text-muted-foreground dark:text-gray-300">
              Explore comprehensive data on land cover, vegetation, precipitation, and population in the Sahel region.
            </p>
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
              />
            ))}
          </div>
          
          {/* Main Dashboard Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border/40 dark:border-gray-700 overflow-hidden mb-8">
            {/* Dashboard Tabs */}
            <div className="flex flex-wrap border-b border-border/40 dark:border-gray-700">
              {dataTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-sahel-green dark:text-sahel-green/90 border-b-2 border-sahel-green dark:border-sahel-green/90"
                      : "text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-gray-300 hover:bg-muted/40 dark:hover:bg-gray-700/40"
                  }`}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.name}</span>
                </button>
              ))}
              
              <div className="ml-auto flex items-center px-4">
                <div className="flex items-center mr-4">
                  <Clock size={16} className="text-muted-foreground dark:text-gray-400 mr-2" />
                  <span className="text-sm text-muted-foreground dark:text-gray-400">2010 - 2023</span>
                </div>
                
                <button className="p-2 rounded-md hover:bg-muted dark:hover:bg-gray-700 transition-colors">
                  <Filter size={16} className="text-muted-foreground dark:text-gray-400" />
                </button>
                
                <button className="p-2 rounded-md hover:bg-muted dark:hover:bg-gray-700 transition-colors">
                  <Download size={16} className="text-muted-foreground dark:text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Dashboard Content */}
            <div className="p-6">
              {isLoading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-t-sahel-green border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Loading data...</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                      <div className="bg-muted/30 dark:bg-gray-700/30 rounded-lg h-[400px] p-4 flex items-center justify-center">
                        {activeTab === 'landCover' && (
                          <div className="text-center p-8">
                            <h3 className="text-xl font-semibold mb-4 dark:text-white">Land Cover Change (2010-2023)</h3>
                            <p className="text-muted-foreground dark:text-gray-300 mb-6">
                              Visualization of land cover changes in the Sahel region over the past decade.
                            </p>
                            <div className="h-48 bg-sahel-sandLight dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <BarChart2 size={48} className="text-sahel-earth/30 dark:text-sahel-earth/40" />
                            </div>
                          </div>
                        )}
                        
                        {activeTab === 'vegetation' && (
                          <div className="text-center p-8">
                            <h3 className="text-xl font-semibold mb-4 dark:text-white">Vegetation Productivity (2010-2023)</h3>
                            <p className="text-muted-foreground dark:text-gray-300 mb-6">
                              Analysis of gross primary production trends across the Sahel region.
                            </p>
                            <div className="h-48 bg-sahel-greenLight/10 dark:bg-sahel-green/20 rounded-lg flex items-center justify-center">
                              <Leaf size={48} className="text-sahel-green/30 dark:text-sahel-green/40" />
                            </div>
                          </div>
                        )}
                        
                        {activeTab === 'precipitation' && (
                          <div className="text-center p-8">
                            <h3 className="text-xl font-semibold mb-4 dark:text-white">Precipitation Patterns (2010-2023)</h3>
                            <p className="text-muted-foreground dark:text-gray-300 mb-6">
                              Visualization of annual rainfall data across the Sahel region.
                            </p>
                            <div className="h-48 bg-sahel-blue/10 dark:bg-sahel-blue/20 rounded-lg flex items-center justify-center">
                              <CloudRain size={48} className="text-sahel-blue/30 dark:text-sahel-blue/40" />
                            </div>
                          </div>
                        )}
                        
                        {activeTab === 'population' && (
                          <div className="text-center p-8">
                            <h3 className="text-xl font-semibold mb-4 dark:text-white">Population Density (2010-2023)</h3>
                            <p className="text-muted-foreground dark:text-gray-300 mb-6">
                              Analysis of population growth and distribution in the Sahel region.
                            </p>
                            <div className="h-48 bg-sahel-earth/10 dark:bg-sahel-earth/20 rounded-lg flex items-center justify-center">
                              <Users size={48} className="text-sahel-earth/30 dark:text-sahel-earth/40" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="lg:w-1/3">
                      <MapVisualization className="h-[400px]" />
                      <div className="mt-2 text-center">
                        <Link 
                          to="/map" 
                          className="text-sm text-sahel-blue dark:text-sahel-blue/90 flex items-center justify-center hover:underline"
                        >
                          <ZoomIn size={14} className="mr-1" /> 
                          Open full map view
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 dark:text-white">Key Findings</h3>
                    <div className="bg-muted/30 dark:bg-gray-700/30 rounded-lg p-6">
                      {activeTab === 'landCover' && (
                        <div>
                          <p className="mb-4 dark:text-gray-300">Analysis of 20 years of land cover data reveals several key trends:</p>
                          <ul className="space-y-2 mb-4">
                            <li className="flex items-start">
                              <div className="w-5 h-5 rounded-full bg-sahel-green/10 dark:bg-sahel-green/20 flex items-center justify-center shrink-0 mt-0.5">
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
                              <span className="ml-3 text-sm dark:text-gray-300">Significant conversion of natural vegetation to croplands in southern Sahel regions</span>
                            </li>
                            <li className="flex items-start">
                              <div className="w-5 h-5 rounded-full bg-sahel-green/10 dark:bg-sahel-green/20 flex items-center justify-center shrink-0 mt-0.5">
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
                              <span className="ml-3 text-sm dark:text-gray-300">Urban expansion around major cities, with a 35% increase in urban area since 2010</span>
                            </li>
                            <li className="flex items-start">
                              <div className="w-5 h-5 rounded-full bg-sahel-green/10 dark:bg-sahel-green/20 flex items-center justify-center shrink-0 mt-0.5">
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
                              <span className="ml-3 text-sm dark:text-gray-300">Restoration efforts showing positive results in targeted areas, with 1.2M ha restored</span>
                            </li>
                          </ul>
                          <Link 
                            to="/reports" 
                            className="text-sm text-sahel-blue dark:text-sahel-blue/90 flex items-center hover:underline"
                          >
                            View detailed land cover report
                            <ArrowRight size={14} className="ml-1" />
                          </Link>
                        </div>
                      )}
                      
                      {activeTab === 'vegetation' && (
                        <div>
                          <p className="mb-4 dark:text-gray-300">Analysis of vegetation productivity data reveals:</p>
                          <ul className="space-y-2 mb-4">
                            <li className="flex items-start">
                              <div className="w-5 h-5 rounded-full bg-sahel-green/10 dark:bg-sahel-green/20 flex items-center justify-center shrink-0 mt-0.5">
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
                              <span className="ml-3 text-sm dark:text-gray-300">Overall increase in gross primary production by 8.2% since 2010</span>
                            </li>
                            <li className="flex items-start">
                              <div className="w-5 h-5 rounded-full bg-sahel-green/10 dark:bg-sahel-green/20 flex items-center justify-center shrink-0 mt-0.5">
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
                              <span className="ml-3 text-sm dark:text-gray-300">Hotspots of declining productivity in regions with excessive agricultural expansion</span>
                            </li>
                            <li className="flex items-start">
                              <div className="w-5 h-5 rounded-full bg-sahel-green/10 dark:bg-sahel-green/20 flex items-center justify-center shrink-0 mt-0.5">
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
                              <span className="ml-3 text-sm dark:text-gray-300">Positive correlation between restoration efforts and increased vegetation productivity</span>
                            </li>
                          </ul>
                          <Link 
                            to="/reports" 
                            className="text-sm text-sahel-blue dark:text-sahel-blue/90 flex items-center hover:underline"
                          >
                            View detailed vegetation report
                            <ArrowRight size={14} className="ml-1" />
                          </Link>
                        </div>
                      )}
                      
                      {activeTab === 'precipitation' && (
                        <div>
                          <p className="mb-4 dark:text-gray-300">Analysis of precipitation data shows:</p>
                          <ul className="space-y-2 mb-4">
                            <li className="flex items-start">
                              <div className="w-5 h-5 rounded-full bg-sahel-green/10 dark:bg-sahel-green/20 flex items-center justify-center shrink-0 mt-0.5">
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
                              <span className="ml-3 text-sm dark:text-gray-300">Increasing variability in annual rainfall patterns across the Sahel</span>
                            </li>
                            <li className="flex items-start">
                              <div className="w-5 h-5 rounded-full bg-sahel-green/10 dark:bg-sahel-green/20 flex items-center justify-center shrink-0 mt-0.5">
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
                              <span className="ml-3 text-sm dark:text-gray-300">Overall decrease in rainfall by 3.5% in northern regions since 2010</span>
                            </li>
                            <li className="flex items-start">
                              <div className="w-5 h-5 rounded-full bg-sahel-green/10 dark:bg-sahel-green/20 flex items-center justify-center shrink-0 mt-0.5">
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
                              <span className="ml-3 text-sm dark:text-gray-300">Increased frequency of extreme rainfall events in southern Sahel regions</span>
                            </li>
                          </ul>
                          <Link 
                            to="/reports" 
                            className="text-sm text-sahel-blue dark:text-sahel-blue/90 flex items-center hover:underline"
                          >
                            View detailed climate report
                            <ArrowRight size={14} className="ml-1" />
                          </Link>
                        </div>
                      )}
                      
                      {activeTab === 'population' && (
                        <div>
                          <p className="mb-4 dark:text-gray-300">Analysis of population data indicates:</p>
                          <ul className="space-y-2 mb-4">
                            <li className="flex items-start">
                              <div className="w-5 h-5 rounded-full bg-sahel-green/10 dark:bg-sahel-green/20 flex items-center justify-center shrink-0 mt-0.5">
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
                              <span className="ml-3 text-sm dark:text-gray-300">Rapid urban population growth at 4.3% annually, exceeding national averages</span>
                            </li>
                            <li className="flex items-start">
                              <div className="w-5 h-5 rounded-full bg-sahel-green/10 dark:bg-sahel-green/20 flex items-center justify-center shrink-0 mt-0.5">
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
                              <span className="ml-3 text-sm dark:text-gray-300">Migration from rural to urban areas correlating with land degradation hotspots</span>
                            </li>
                            <li className="flex items-start">
                              <div className="w-5 h-5 rounded-full bg-sahel-green/10 dark:bg-sahel-green/20 flex items-center justify-center shrink-0 mt-0.5">
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
                              <span className="ml-3 text-sm dark:text-gray-300">Population pressure on natural resources highest in peri-urban regions</span>
                            </li>
                          </ul>
                          <Link 
                            to="/reports" 
                            className="text-sm text-sahel-blue dark:text-sahel-blue/90 flex items-center hover:underline"
                          >
                            View detailed population report
                            <ArrowRight size={14} className="ml-1" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border/40 dark:border-gray-700 p-6">
              <div className="w-10 h-10 rounded-lg bg-sahel-green/10 dark:bg-sahel-green/20 flex items-center justify-center mb-4">
                <Calendar className="h-5 w-5 text-sahel-green" />
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Temporal Analysis</h3>
              <p className="text-muted-foreground dark:text-gray-300 mb-4">Explore data trends over time with our interactive time series tools.</p>
              <Link 
                to="/dashboard/temporal" 
                className="text-sm text-sahel-blue dark:text-sahel-blue/90 flex items-center hover:underline"
              >
                View time series
                <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border/40 dark:border-gray-700 p-6">
              <div className="w-10 h-10 rounded-lg bg-sahel-blue/10 dark:bg-sahel-blue/20 flex items-center justify-center mb-4">
                <Map className="h-5 w-5 text-sahel-blue" />
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Spatial Analysis</h3>
              <p className="text-muted-foreground dark:text-gray-300 mb-4">Analyze geographic patterns and spatial relationships in the data.</p>
              <Link 
                to="/map" 
                className="text-sm text-sahel-blue dark:text-sahel-blue/90 flex items-center hover:underline"
              >
                Open interactive map
                <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border/40 dark:border-gray-700 p-6">
              <div className="w-10 h-10 rounded-lg bg-sahel-earth/10 dark:bg-sahel-earth/20 flex items-center justify-center mb-4">
                <FileText className="h-5 w-5 text-sahel-earth" />
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Reports & Insights</h3>
              <p className="text-muted-foreground dark:text-gray-300 mb-4">Access detailed reports and recommendations for land restoration.</p>
              <Link 
                to="/reports" 
                className="text-sm text-sahel-blue dark:text-sahel-blue/90 flex items-center hover:underline"
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
