import { useEffect } from 'react';
import HeroSection from '@/components/HeroSection';
import FeatureSection from '@/components/FeatureSection';
import MapVisualization from '@/components/MapVisualization';
import DataCard from '@/components/DataCard';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart2, CloudRain, Leaf, Map, Users, Download } from 'lucide-react';
const Index = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const keyStats = [{
    title: 'Land Cover Change',
    value: '27.3M ha',
    description: 'Area affected by land cover change in the past 20 years',
    icon: <Leaf size={20} />,
    trend: {
      value: 15,
      isPositive: false
    }
  }, {
    title: 'Vegetation Production',
    value: '+8.2%',
    description: 'Average increase in gross primary production since 2010',
    icon: <BarChart2 size={20} />,
    trend: {
      value: 8.2,
      isPositive: true
    }
  }, {
    title: 'Annual Precipitation',
    value: '685 mm',
    description: 'Average annual rainfall across the Sahel region',
    icon: <CloudRain size={20} />,
    trend: {
      value: 3.5,
      isPositive: false
    }
  }, {
    title: 'Population Growth',
    value: '4.3%',
    description: 'Annual population growth rate in urban centers',
    icon: <Users size={20} />,
    trend: {
      value: 4.3,
      isPositive: true
    }
  }];
  return <div className="min-h-screen flex flex-col">
      <HeroSection />
      
      <FeatureSection />
      
      {/* Key Statistics Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-sahel-earth/10 text-sahel-earth rounded-full mb-4">
              Key Insights
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Sahel Region at a Glance
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Understanding the current state of land use, climate patterns, and human impact 
              through comprehensive data analysis.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {keyStats.map((stat, index) => <DataCard key={index} title={stat.title} value={stat.value} description={stat.description} icon={stat.icon} trend={stat.trend} />)}
          </div>
          
          <div className="text-center">
            <Link to="/dashboard" className="inline-flex items-center justify-center px-6 py-3 bg-sahel-earth text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg hover:bg-sahel-earth/90">
              Explore All Data
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Map Visualization Section */}
      <section className="py-20 bg-gradient-to-b from-white to-sahel-sandLight/20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 lg:order-2">
              <div className="max-w-lg mx-auto">
                <MapVisualization className="w-full" />
              </div>
            </div>
            
            <div className="flex-1 lg:order-1">
              <span className="inline-block px-3 py-1 text-xs font-medium bg-sahel-blue/10 text-sahel-blue rounded-full mb-4">
                Interactive Visualization
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Explore Geographic Data Through Interactive Maps
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our interactive map provides a powerful tool to visualize land cover changes, 
                vegetation productivity, precipitation patterns, and population density across the Sahel region.
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-sahel-green/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sahel-green">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <span className="ml-3 text-muted-foreground">Toggle between different data layers to explore various environmental factors</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-sahel-green/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sahel-green">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <span className="ml-3 text-muted-foreground">Zoom in to focus on specific regions and analyze local trends</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-sahel-green/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sahel-green">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <span className="ml-3 text-muted-foreground">View historical data to understand changes over the past two decades</span>
                </li>
              </ul>
              
              <Link to="/map" className="inline-flex items-center justify-center px-6 py-3 bg-sahel-blue text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg hover:bg-sahel-blue/90">
                Open Full Map
                <Map size={16} className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action Section */}
      
      
      <Footer />
    </div>;
};
export default Index;