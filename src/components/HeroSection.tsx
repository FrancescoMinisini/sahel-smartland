
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import MapVisualization from './MapVisualization';

const HeroSection = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-sahel-sandLight via-white to-white z-0"></div>
      
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-sahel-pattern bg-repeat opacity-20"></div>
      </div>
      
      {/* Animated circles in background */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-sahel-green/5 animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-sahel-blue/10 animate-pulse-slow" style={{
      animationDelay: '1s'
    }}></div>
      
      <div className="container mx-auto px-6 py-24 z-10 relative">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text content */}
          <motion.div className="flex-1 text-center lg:text-left" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: isLoaded ? 1 : 0,
          y: isLoaded ? 0 : 20
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }}>
            <span className="inline-block px-3 py-1 text-xs font-medium bg-sahel-green/10 text-sahel-green rounded-full mb-4">
              G20 Global Land Initiative & UNCCD
            </span>
            
            <motion.h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: isLoaded ? 1 : 0,
            y: isLoaded ? 0 : 20
          }} transition={{
            duration: 0.8,
            delay: 0.4
          }}>
              <span className="text-sahel-earth">Restoring</span> the Sahel,{" "}
              <span className="text-sahel-green">Sustaining</span> the Future
            </motion.h1>
            
            <motion.p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: isLoaded ? 1 : 0,
            y: isLoaded ? 0 : 20
          }} transition={{
            duration: 0.8,
            delay: 0.6
          }}>
              Leveraging earth observation data to combat land degradation, restore ecosystems, 
              and build resilience in the Sahel region.
            </motion.p>
            
            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: isLoaded ? 1 : 0,
            y: isLoaded ? 0 : 20
          }} transition={{
            duration: 0.8,
            delay: 0.8
          }}>
              <Link to="/dashboard" className="inline-flex items-center justify-center px-6 py-3 bg-sahel-green text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg hover:bg-sahel-green/90 transform hover:-translate-y-0.5">
                Explore Dashboard
                <ArrowRight size={16} className="ml-2" />
              </Link>
              
              <a href="https://www.youtube.com/watch?v=BYJe7MZKumM" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6 py-3 bg-white text-sahel-earth font-medium rounded-lg border border-sahel-earth/20 shadow-sm hover:bg-sahel-earth/5 transition-all">
                <Play size={16} className="mr-2" />
                Watch Overview
              </a>
            </motion.div>
          </motion.div>
          
          {/* Map visualization */}
          <motion.div className="flex-1 w-full max-w-lg" initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: isLoaded ? 1 : 0,
          scale: isLoaded ? 1 : 0.9
        }} transition={{
          duration: 1,
          delay: 0.6
        }}>
            <div className="relative w-full aspect-square bg-white rounded-2xl p-2 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-sahel-sandLight to-sahel-sand rounded-2xl overflow-hidden">
                {/* Replace the placeholder text with actual MapVisualization component */}
                <div className="w-full h-full">
                  <MapVisualization year={2023} dataType="landCover" expandedView={false} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Partners section */}
        <motion.div className="mt-24 text-center" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: isLoaded ? 1 : 0,
        y: isLoaded ? 0 : 20
      }} transition={{
        duration: 0.8,
        delay: 1.2
      }}>
          <p className="text-sm text-muted-foreground mb-6">In Partnership With</p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="h-12 text-sahel-earth/60 font-semibold flex items-center">UNCCD</div>
            <div className="h-12 text-sahel-earth/60 font-semibold flex items-center">G20 Initiative</div>
            <div className="h-12 text-sahel-earth/60 font-semibold flex items-center">United Nations</div>
            <div className="h-12 text-sahel-earth/60 font-semibold flex items-center">Earth Observatory</div>
          </div>
        </motion.div>
      </div>
    </section>;
};

export default HeroSection;
