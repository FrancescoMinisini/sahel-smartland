
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import YearSlider from '@/components/YearSlider';
import MapVisualization from '@/components/MapVisualization';
import Navbar from '@/components/Navbar';
import { Info, Calendar, Map, BarChartHorizontal } from 'lucide-react';

const TemporalAnalysis = () => {
  const [selectedYear, setSelectedYear] = useState(2010);
  const [activeTab, setActiveTab] = useState("map");
  
  // Page transition animation
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <motion.main
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{ duration: 0.4 }}
        className="container pt-24 pb-16"
      >
        <div className="flex flex-col space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Temporal Analysis</h1>
            <p className="text-muted-foreground">
              Analyze environmental changes over time in the Sahel region.
            </p>
          </div>
          
          {/* Year Slider */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Time Period</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Adjust the slider to see land use changes from 1985 to 2023
            </p>
            <YearSlider 
              minYear={1985} 
              maxYear={2023} 
              initialValue={selectedYear}
              onChange={handleYearChange}
              autoPlay={true}
              autoPlayInterval={3000}
              className="max-w-4xl mx-auto"
            />
          </Card>
          
          {/* Visualization Tabs */}
          <div className="grid grid-cols-1 gap-6">
            <Tabs defaultValue="map" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="map" className="flex gap-1.5">
                  <Map className="h-4 w-4" />
                  Map View
                </TabsTrigger>
                <TabsTrigger value="charts" className="flex gap-1.5">
                  <BarChartHorizontal className="h-4 w-4" />
                  Data Charts
                </TabsTrigger>
                <TabsTrigger value="info" className="flex gap-1.5">
                  <Info className="h-4 w-4" />
                  Analysis
                </TabsTrigger>
              </TabsList>
              
              {/* Map View */}
              <TabsContent value="map" className="mt-0">
                <Card className="overflow-hidden">
                  <MapVisualization className="w-full" year={selectedYear} />
                </Card>
              </TabsContent>
              
              {/* Charts View */}
              <TabsContent value="charts" className="mt-0">
                <Card className="p-6">
                  <h3 className="text-lg font-medium mb-4">Land Cover Changes ({selectedYear})</h3>
                  <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
                    <p className="text-muted-foreground">Interactive charts will appear here based on selected year.</p>
                  </div>
                </Card>
              </TabsContent>
              
              {/* Analysis View */}
              <TabsContent value="info" className="mt-0">
                <Card className="p-6">
                  <h3 className="text-lg font-medium mb-4">Environmental Analysis ({selectedYear})</h3>
                  
                  <div className="space-y-6">
                    <div className="rounded-lg bg-muted p-4">
                      <h4 className="font-medium mb-2">Key Observations</h4>
                      <p className="text-sm text-muted-foreground">
                        The {selectedYear} data shows significant changes in land cover patterns across the Sahel region.
                        {selectedYear > 2000 ? " Reforestation efforts are visible in certain areas." : " Desertification is the primary trend visible."}
                      </p>
                    </div>
                    
                    <div className="rounded-lg bg-primary/10 p-4">
                      <h4 className="font-medium mb-2">Climate Impact</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedYear > 2010 
                          ? "Recent climate initiatives show positive impact on vegetation recovery."
                          : "Limited climate intervention programs were in place during this period."}
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default TemporalAnalysis;
