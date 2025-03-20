
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import YearSlider from '@/components/YearSlider';
import MapVisualization from '@/components/MapVisualization';
import Navbar from '@/components/Navbar';
import { Info, Calendar, Map, BarChartHorizontal, TrendingUp, TrendingDown } from 'lucide-react';
import { landCoverClasses, landCoverColors } from '@/lib/geospatialUtils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const TemporalAnalysis = () => {
  const [selectedYear, setSelectedYear] = useState(2010);
  const [activeTab, setActiveTab] = useState("map");
  const [landCoverStats, setLandCoverStats] = useState<Record<string, number>>({});
  const [previousYearStats, setPreviousYearStats] = useState<Record<string, number>>({});
  
  // Page transition animation
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const handleYearChange = (year: number) => {
    // Store the previous year's stats before updating to the new year
    setPreviousYearStats({...landCoverStats});
    setSelectedYear(year);
  };

  const handleStatsChange = (stats: Record<string, number>) => {
    setLandCoverStats(stats);
  };

  // Transform the statistics into chart-compatible data
  const chartData = Object.entries(landCoverStats)
    .filter(([key]) => key !== '0') // Filter out "No Data" class
    .map(([key, value]) => {
      const landCoverKey = Number(key);
      const previousValue = previousYearStats[key] || value;
      const changeValue = value - previousValue;
      
      return {
        name: landCoverClasses[landCoverKey as keyof typeof landCoverClasses] || `Class ${key}`,
        value: Math.round(value / 1000), // Convert to 1000s of pixels (approximate km²)
        color: landCoverColors[landCoverKey as keyof typeof landCoverColors] || '#cccccc',
        change: Math.round((changeValue / (previousValue || 1)) * 100), // Percent change
        rawChange: changeValue
      };
    })
    .sort((a, b) => b.value - a.value); // Sort by descending value
    
  // Calculate analysis insights based on land cover stats
  const getAnalysisInsights = () => {
    if (Object.keys(landCoverStats).length === 0) {
      return {
        majorChanges: [],
        environmentalImpact: "",
        recommendedActions: []
      };
    }
    
    // Find significant changes (over 5% or 1000 pixels)
    const significantChanges = chartData
      .filter(item => Math.abs(item.rawChange) > 1000 || Math.abs(item.change) > 5)
      .sort((a, b) => Math.abs(b.rawChange) - Math.abs(a.rawChange))
      .slice(0, 3); // Get top 3 changes
      
    // Determine overall environmental impact
    let deforestationLevel = 0;
    let urbanizationLevel = 0;
    let desertificationLevel = 0;
    
    // Check for deforestation (decrease in forests, class 7)
    const forestsChange = chartData.find(item => item.name === "Forests")?.change || 0;
    if (forestsChange < -5) deforestationLevel = 2; // High deforestation
    else if (forestsChange < 0) deforestationLevel = 1; // Moderate deforestation
    
    // Check for urbanization (increase in urban areas, class 13)
    const urbanChange = chartData.find(item => item.name === "Urban")?.change || 0;
    if (urbanChange > 10) urbanizationLevel = 2; // High urbanization
    else if (urbanChange > 0) urbanizationLevel = 1; // Moderate urbanization
    
    // Check for desertification (increase in barren land, class 16)
    const barrenChange = chartData.find(item => item.name === "Barren")?.change || 0;
    if (barrenChange > 10) desertificationLevel = 2; // High desertification
    else if (barrenChange > 0) desertificationLevel = 1; // Moderate desertification
    
    // Generate impact text
    let environmentalImpact = "";
    if (deforestationLevel > 0 && urbanizationLevel > 0 && desertificationLevel > 0) {
      environmentalImpact = "Critical environmental degradation detected with significant deforestation, urbanization, and desertification.";
    } else if (deforestationLevel > 0 && (urbanizationLevel > 0 || desertificationLevel > 0)) {
      environmentalImpact = "Moderate to high environmental stress with observable deforestation and land use changes.";
    } else if (deforestationLevel > 0 || urbanizationLevel > 0 || desertificationLevel > 0) {
      environmentalImpact = "Early indications of environmental changes that require monitoring.";
    } else if (forestsChange > 5) {
      environmentalImpact = "Positive environmental trends with increasing forest coverage.";
    } else {
      environmentalImpact = "Stable environmental conditions with minimal land cover changes.";
    }
    
    // Generate recommended actions
    const recommendedActions = [];
    
    if (deforestationLevel > 0) {
      recommendedActions.push(deforestationLevel > 1 
        ? "Implement immediate reforestation initiatives in affected areas"
        : "Monitor forest degradation and plan targeted conservation efforts");
    }
    
    if (desertificationLevel > 0) {
      recommendedActions.push(desertificationLevel > 1
        ? "Deploy advanced soil conservation techniques to combat severe desertification"
        : "Introduce sustainable land management practices to prevent further soil degradation");
    }
    
    if (urbanizationLevel > 0) {
      recommendedActions.push(urbanizationLevel > 1
        ? "Develop comprehensive urban planning strategies to minimize environmental impact"
        : "Encourage green infrastructure in developing urban areas");
    }
    
    // Always add a general recommendation
    recommendedActions.push("Continue monitoring land cover changes for early detection of environmental issues");
    
    return {
      majorChanges: significantChanges,
      environmentalImpact,
      recommendedActions: recommendedActions.slice(0, 3) // Limit to top 3 recommendations
    };
  };
  
  const insights = getAnalysisInsights();

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
              minYear={2010} 
              maxYear={2023} 
              initialValue={selectedYear}
              onChange={handleYearChange}
              autoPlay={true}
              autoPlayInterval={1200}
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
                  <MapVisualization 
                    className="w-full" 
                    year={selectedYear} 
                    onStatsChange={handleStatsChange}
                  />
                </Card>
              </TabsContent>
              
              {/* Charts View */}
              <TabsContent value="charts" className="mt-0">
                <Card className="p-6">
                  <h3 className="text-lg font-medium mb-4">Land Cover Distribution ({selectedYear})</h3>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 60,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={60} 
                        />
                        <YAxis 
                          label={{ 
                            value: 'Area (thousand pixels)', 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { textAnchor: 'middle' }
                          }} 
                        />
                        <Tooltip 
                          formatter={(value, name, props) => {
                            if (name === "Area (thousand pixels)") {
                              const change = props.payload.change;
                              return [
                                `${value} thousand pixels ${change !== 0 ? `(${change > 0 ? '+' : ''}${change}%)` : ''}`, 
                                name
                              ];
                            }
                            return [value, name];
                          }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        <Bar 
                          dataKey="value" 
                          name="Area (thousand pixels)" 
                          fill="#8884d8"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </TabsContent>
              
              {/* Analysis View */}
              <TabsContent value="info" className="mt-0">
                <Card className="p-6">
                  <h3 className="text-lg font-medium mb-4">Environmental Analysis ({selectedYear})</h3>
                  
                  <div className="space-y-6">
                    {/* Major Changes Section */}
                    <div className="rounded-lg bg-muted p-4">
                      <h4 className="font-medium mb-3">Key Land Cover Changes</h4>
                      
                      {insights.majorChanges.length > 0 ? (
                        <div className="space-y-3">
                          {insights.majorChanges.map((change, index) => (
                            <div key={index} className="flex items-center gap-2">
                              {change.change > 0 ? (
                                <TrendingUp className="h-5 w-5 text-green-500" />
                              ) : (
                                <TrendingDown className="h-5 w-5 text-red-500" />
                              )}
                              <div>
                                <span className="font-medium" style={{ color: change.color }}>{change.name}: </span>
                                <span className="text-sm text-muted-foreground">
                                  {change.change > 0 ? 'Increased by ' : 'Decreased by '}
                                  <span className={change.change > 0 ? 'text-green-500' : 'text-red-500'}>
                                    {Math.abs(change.change)}%
                                  </span>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No significant land cover changes detected in the current period.
                        </p>
                      )}
                    </div>
                    
                    {/* Environmental Impact Assessment */}
                    <div className="rounded-lg bg-primary/10 p-4">
                      <h4 className="font-medium mb-2">Environmental Impact Assessment</h4>
                      <p className="text-sm text-muted-foreground">
                        {insights.environmentalImpact}
                      </p>
                    </div>
                    
                    {/* Recommended Actions */}
                    <div className="rounded-lg bg-accent/20 p-4">
                      <h4 className="font-medium mb-2">Recommended Actions</h4>
                      {insights.recommendedActions.length > 0 ? (
                        <ul className="space-y-1">
                          {insights.recommendedActions.map((action, index) => (
                            <li key={index} className="flex items-start">
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
                              <span className="ml-3 text-sm">{action}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Continue monitoring current land cover patterns.
                        </p>
                      )}
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
