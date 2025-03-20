import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import YearSlider from '@/components/YearSlider';
import MapVisualization from '@/components/MapVisualization';
import LayerSelector from '@/components/LayerSelector';
import Navbar from '@/components/Navbar';
import { Info, Calendar, Map, BarChartHorizontal, TrendingUp, TrendingDown, HelpCircle, Layers } from 'lucide-react';
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
  Cell,
  Line,
  LineChart,
  Area,
  AreaChart
} from 'recharts';

const TemporalAnalysis = () => {
  const [selectedYear, setSelectedYear] = useState(2010);
  const [activeTab, setActiveTab] = useState("map");
  const [landCoverStats, setLandCoverStats] = useState<Record<string, number>>({});
  const [previousYearStats, setPreviousYearStats] = useState<Record<string, number>>({});
  const [timeSeriesData, setTimeSeriesData] = useState<Array<{year: number, [key: string]: number}>>([]);
  const [selectedLayer, setSelectedLayer] = useState<string>('landCover');
  const [showRegionBoundaries, setShowRegionBoundaries] = useState(false);
  const [showDistrictBoundaries, setShowDistrictBoundaries] = useState(false);
  const [showRoadNetwork, setShowRoadNetwork] = useState(false);
  const [showRiverNetwork, setShowRiverNetwork] = useState(false);
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const handleYearChange = (year: number) => {
    setPreviousYearStats({...landCoverStats});
    setSelectedYear(year);
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

  const handleLayerChange = (layer: string) => {
    setSelectedLayer(layer);
  };

  const toggleAdminLayer = (layerType: string) => {
    if (layerType === 'region') {
      setShowRegionBoundaries(!showRegionBoundaries);
    } else if (layerType === 'districts') {
      setShowDistrictBoundaries(!showDistrictBoundaries);
    }
  };

  const toggleNetworkLayer = (layerType: string) => {
    if (layerType === 'roads') {
      setShowRoadNetwork(!showRoadNetwork);
    } else if (layerType === 'rivers') {
      setShowRiverNetwork(!showRiverNetwork);
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
        value: Math.round(value / 1000),
        color: landCoverColors[landCoverKey as keyof typeof landCoverColors] || '#cccccc',
        change: Math.round((changeValue / (previousValue || 1)) * 100),
        rawChange: changeValue
      };
    })
    .sort((a, b) => b.value - a.value);

  const getAnalysisInsights = () => {
    if (Object.keys(landCoverStats).length === 0) {
      return {
        majorChanges: [],
        environmentalImpact: "No data available for analysis. Please select a year and explore the map to generate insights.",
        recommendedActions: []
      };
    }

    const majorChanges = Object.entries(landCoverStats)
      .filter(([key]) => key !== '0' && previousYearStats[key] !== undefined)
      .map(([key, value]) => {
        const previousValue = previousYearStats[key] || value;
        const change = previousValue > 0 ? Math.round((value - previousValue) / previousValue * 100) : 0;
        const landCoverKey = Number(key);
        
        return {
          name: landCoverClasses[landCoverKey as keyof typeof landCoverClasses] || `Class ${key}`,
          color: landCoverColors[landCoverKey as keyof typeof landCoverColors] || '#cccccc',
          change,
          value: Math.round(value / 1000)
        };
      })
      .filter(item => Math.abs(item.change) >= 5)
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 3);

    let environmentalImpact = "";
    
    const forestChange = majorChanges.find(change => change.name === 'Forests');
    const urbanChange = majorChanges.find(change => change.name === 'Urban');
    const barrenChange = majorChanges.find(change => change.name === 'Barren');
    
    if (forestChange && forestChange.change < 0) {
      environmentalImpact += `Deforestation detected: Forest cover decreased by ${Math.abs(forestChange.change)}%. `;
    } else if (forestChange && forestChange.change > 0) {
      environmentalImpact += `Forest recovery observed: Forest cover increased by ${forestChange.change}%. `;
    }
    
    if (urbanChange && urbanChange.change > 0) {
      environmentalImpact += `Urbanization detected: Urban areas expanded by ${urbanChange.change}%. `;
    }
    
    if (barrenChange && barrenChange.change > 0) {
      environmentalImpact += `Potential desertification: Barren land increased by ${barrenChange.change}%. `;
    } else if (barrenChange && barrenChange.change < 0) {
      environmentalImpact += `Land rehabilitation: Barren land decreased by ${Math.abs(barrenChange.change)}%. `;
    }
    
    if (!environmentalImpact) {
      environmentalImpact = "No significant environmental impact detected in the current period.";
    }
    
    const recommendedActions = [];
    
    if (forestChange && forestChange.change < -5) {
      recommendedActions.push("Implement stricter deforestation controls and reforestation programs");
      recommendedActions.push("Monitor logging activities more closely in affected areas");
    }
    
    if (urbanChange && urbanChange.change > 10) {
      recommendedActions.push("Develop sustainable urban planning policies for rapidly expanding areas");
      recommendedActions.push("Ensure green spaces are incorporated into new urban developments");
    }
    
    if (barrenChange && barrenChange.change > 8) {
      recommendedActions.push("Implement soil conservation and anti-desertification measures");
      recommendedActions.push("Consider drought-resistant vegetation planting programs");
    }
    
    return {
      majorChanges,
      environmentalImpact,
      recommendedActions
    };
  };

  const insights = getAnalysisInsights();

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
          
          <div className="grid grid-cols-1 gap-6">
            <Tabs defaultValue="map" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="map" className="flex gap-1.5">
                  <Map className="h-4 w-4" />
                  Map View
                </TabsTrigger>
                <TabsTrigger value="layers" className="flex gap-1.5">
                  <Layers className="h-4 w-4" />
                  Layer Control
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
              
              <TabsContent value="map" className="mt-0">
                <Card className="overflow-hidden">
                  <div className="h-[500px] w-full">
                    <MapVisualization 
                      className="w-full h-full" 
                      year={selectedYear} 
                      onStatsChange={handleStatsChange}
                      dataType={selectedLayer as 'landCover' | 'precipitation' | 'vegetation' | 'population'}
                      showRegionBoundaries={showRegionBoundaries}
                      showDistrictBoundaries={showDistrictBoundaries}
                      showRoadNetwork={showRoadNetwork}
                      showRiverNetwork={showRiverNetwork}
                    />
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="layers" className="mt-0">
                <Card className="p-6">
                  <h3 className="text-lg font-medium mb-4">Layer Control</h3>
                  <div className="mb-6">
                    <p className="text-muted-foreground mb-4">
                      Select the map layers you want to visualize. You can combine a base layer with vector overlays such as administrative boundaries or network data.
                    </p>
                  </div>
                  <LayerSelector 
                    onLayerChange={handleLayerChange} 
                    currentLayer={selectedLayer}
                    onToggleAdminLayer={toggleAdminLayer}
                    onToggleNetworkLayer={toggleNetworkLayer}
                    showRegionBoundaries={showRegionBoundaries}
                    showDistrictBoundaries={showDistrictBoundaries}
                    showRoadNetwork={showRoadNetwork}
                    showRiverNetwork={showRiverNetwork}
                  />
                </Card>
              </TabsContent>
              
              <TabsContent value="charts" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <div className="mt-4 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2 mb-2">
                        <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <p>
                          The chart displays the distribution of land cover types measured in thousands of pixels. Each pixel represents approximately 500m², with colors matching the map visualization.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-medium mb-4">Land Cover Change Over Time</h3>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={timeSeriesData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 20,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="year" 
                            label={{ 
                              value: 'Year', 
                              position: 'insideBottom',
                              offset: -10
                            }}
                          />
                          <YAxis 
                            label={{ 
                              value: 'Area (thousand pixels)', 
                              angle: -90, 
                              position: 'insideLeft',
                              style: { textAnchor: 'middle' }
                            }} 
                          />
                          <Tooltip />
                          <Legend />
                          
                          <Area type="monotone" dataKey="Forests" stackId="1" stroke="#1a9850" fill="#1a9850" fillOpacity={0.7} />
                          <Area type="monotone" dataKey="Shrublands" stackId="1" stroke="#91cf60" fill="#91cf60" fillOpacity={0.7} />
                          <Area type="monotone" dataKey="Grasslands" stackId="1" stroke="#fee08b" fill="#fee08b" fillOpacity={0.7} />
                          <Area type="monotone" dataKey="Croplands" stackId="1" stroke="#fc8d59" fill="#fc8d59" fillOpacity={0.7} />
                          <Area type="monotone" dataKey="Urban" stackId="1" stroke="#d73027" fill="#d73027" fillOpacity={0.7} />
                          <Area type="monotone" dataKey="Barren" stackId="1" stroke="#bababa" fill="#bababa" fillOpacity={0.7} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2 mb-2">
                        <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <p>
                          This chart accumulates data as you explore different years. The stacked area chart shows how the proportion of each land cover type changes over time, which can reveal patterns of land conversion, urbanization, or environmental recovery.
                        </p>
                      </div>
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <h4 className="font-medium mb-2">Trend Analysis:</h4>
                        <p className="whitespace-pre-line">
                          {getTrendAnalysis()}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="info" className="mt-0">
                <Card className="p-6">
                  <h3 className="text-lg font-medium mb-4">Environmental Analysis ({selectedYear})</h3>
                  
                  <div className="space-y-6">
                    <div className="rounded-lg bg-muted/50 p-4 mb-6">
                      <h4 className="font-medium mb-3">How Metrics Are Calculated</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium">Land Cover Classification:</span> Based on MODIS land use data with 500m resolution. Each land cover class is counted in pixels and converted to approximate area.
                        </p>
                        <p>
                          <span className="font-medium">Change Detection:</span> Calculated as percentage change from previous year's values. Significant changes are those exceeding 5% or 1000 pixels.
                        </p>
                        <p>
                          <span className="font-medium">Environmental Impact:</span> Assessed by analyzing trends in key indicators:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Deforestation: Measured by decrease in forest cover (class 7)</li>
                          <li>Urbanization: Measured by increase in urban areas (class 13)</li>
                          <li>Desertification: Measured by increase in barren land (class 16)</li>
                        </ul>
                      </div>
                    </div>
                    
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
                    
                    <div className="rounded-lg bg-primary/10 p-4">
                      <h4 className="font-medium mb-2">Environmental Impact Assessment</h4>
                      <p className="text-sm text-muted-foreground">
                        {insights.environmentalImpact}
                      </p>
                    </div>
                    
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
