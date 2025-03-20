
import { useEffect, useRef } from 'react';
import { BarChart2, Layers, Globe, Users, Leaf, Droplets, CloudRain, Map } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';

const FeatureSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const features = [
    {
      icon: <Layers className="h-6 w-6 text-sahel-earth" />,
      title: 'Land Cover Analysis',
      description: 'Track changes in land cover over the past two decades to identify trends and patterns.',
      link: '/dashboard',
    },
    {
      icon: <Leaf className="h-6 w-6 text-sahel-green" />,
      title: 'Vegetation Productivity',
      description: 'Monitor changes in vegetation health and productivity using advanced satellite data.',
      link: '/dashboard',
    },
    {
      icon: <CloudRain className="h-6 w-6 text-sahel-blue" />,
      title: 'Climate Data',
      description: 'Analyze precipitation patterns to understand climate impact on land degradation.',
      link: '/dashboard',
    },
    {
      icon: <Users className="h-6 w-6 text-sahel-earth" />,
      title: 'Population Dynamics',
      description: 'Explore population growth and density to assess human impact on environmental changes.',
      link: '/dashboard',
    },
    {
      icon: <Map className="h-6 w-6 text-sahel-green" />,
      title: 'Interactive Mapping',
      description: 'Visualize geographic data through intuitive maps and spatial analysis tools.',
      link: '/map',
    },
    {
      icon: <BarChart2 className="h-6 w-6 text-sahel-blue" />,
      title: 'Data Dashboard',
      description: 'Access comprehensive data visualizations and analytics in an interactive dashboard.',
      link: '/dashboard',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-sahel-sandLight/30">
      <div className="container mx-auto px-6" ref={ref}>
        <div className="text-center mb-16">
          <motion.span 
            className="inline-block px-3 py-1 text-xs font-medium bg-sahel-blue/10 text-sahel-blue rounded-full mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            Data-Driven Insights
          </motion.span>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Harnessing Earth Observation for Sustainable Solutions
          </motion.h2>
          
          <motion.p 
            className="text-lg text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Our platform analyzes 20 years of satellite data to provide actionable insights 
            on land degradation, restoration opportunities, and sustainable land management.
          </motion.p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className="bg-white rounded-xl p-6 shadow-sm border border-border/40 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                {feature.icon}
              </div>
              
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground mb-4">{feature.description}</p>
              
              <Link 
                to={feature.link} 
                className="text-sm font-medium text-sahel-blue flex items-center hover:underline"
              >
                Explore data
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-1 transition-transform group-hover:translate-x-1"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureSection;
