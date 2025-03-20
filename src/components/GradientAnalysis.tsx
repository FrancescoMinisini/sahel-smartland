
import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, Filter, Download, ArrowLeft, ArrowRight } from 'lucide-react';
import MapVisualization from './MapVisualization';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TooltipProvider, Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type GradientData = {
  year: number;
  transitions: {
    from: string;
    to: string;
    count: number;
    area: number;
    isNegative: boolean;
  }[];
  hotspots: {
    region: string;
    severity: number;
    area: number;
    mainTransition: string;
  }[];
  recovery: {
    region: string;
    improvement: number;
    area: number;
    mainTransition: string;
  }[];
};

const COLORS = {
  degradation: '#ef4444',
  improvement: '#22c55e',
  stable: '#3b82f6',
  uncertain: '#f59e0b',
};

const TRANSITION_TYPES = {
  'Forest to Barren': { color: '#ef4444', isNegative: true },
  'Forest to Cropland': { color: '#f97316', isNegative: true },
  'Forest to Grassland': { color: '#eab308', isNegative: true },
  'Grassland to Barren': { color: '#ef4444', isNegative: true },
  'Cropland to Barren': { color: '#ef4444', isNegative: true },
  'Barren to Grassland': { color: '#22c55e', isNegative: false },
  'Barren to Cropland': { color: '#16a34a', isNegative: false },
  'Barren to Forest': { color: '#15803d', isNegative: false },
  'Cropland to Forest': { color: '#15803d', isNegative: false },
  'Grassland to Forest': { color: '#15803d', isNegative: false },
  'Stable Forest': { color: '#3b82f6', isNegative: false },
  'Stable Grassland': { color: '#3b82f6', isNegative: false },
  'Stable Cropland': { color: '#3b82f6', isNegative: false },
  'Stable Barren': { color: '#3b82f6', isNegative: false },
  'Other': { color: '#a855f7', isNegative: false },
};

// Mock data generator
const generateGradientData = (): GradientData[] => {
  const years = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];
  
  return years.map((year, index) => {
    if (index === 0) return { year, transitions: [], hotspots: [], recovery: [] };
    
    const prevYear = years[index - 1];
    
    return {
      year,
      transitions: [
        {
          from: 'Forest',
          to: 'Barren',
          count: Math.round(100 + Math.random() * 50 + index * 3),
          area: Math.round(1200 + Math.random() * 500 + index * 30),
          isNegative: true
        },
        {
          from: 'Forest',
          to: 'Cropland',
          count: Math.round(80 + Math.random() * 40 + index * 2),
          area: Math.round(950 + Math.random() * 400 + index * 25),
          isNegative: true
        },
        {
          from: 'Grassland',
          to: 'Barren',
          count: Math.round(120 + Math.random() * 60 - index * 2),
          area: Math.round(1400 + Math.random() * 600 - index * 40),
          isNegative: true
        },
        {
          from: 'Barren',
          to: 'Grassland',
          count: Math.round(70 + Math.random() * 30 + index * 5),
          area: Math.round(850 + Math.random() * 350 + index * 45),
          isNegative: false
        },
        {
          from: 'Barren',
          to: 'Cropland',
          count: Math.round(50 + Math.random() * 25 + index * 4),
          area: Math.round(650 + Math.random() * 300 + index * 35),
          isNegative: false
        },
        {
          from: 'Grassland',
          to: 'Forest',
          count: Math.round(30 + Math.random() * 15 + index * 2),
          area: Math.round(400 + Math.random() * 200 + index * 20),
          isNegative: false
        }
      ],
      hotspots: [
        {
          region: 'Southern Assaba',
          severity: Math.round(75 + Math.random() * 25),
          area: Math.round(3500 + Math.random() * 1500),
          mainTransition: 'Grassland to Barren'
        },
        {
          region: 'Eastern Districts',
          severity: Math.round(65 + Math.random() * 20),
          area: Math.round(2800 + Math.random() * 1200),
          mainTransition: 'Forest to Cropland'
        },
        {
          region: 'Central Watershed',
          severity: Math.round(55 + Math.random() * 15),
          area: Math.round(2200 + Math.random() * 1000),
          mainTransition: 'Forest to Barren'
        }
      ],
      recovery: [
        {
          region: 'Northern Assaba',
          improvement: Math.round(45 + Math.random() * 30),
          area: Math.round(1800 + Math.random() * 900),
          mainTransition: 'Barren to Grassland'
        },
        {
          region: 'Western Valleys',
          improvement: Math.round(35 + Math.random() * 25),
          area: Math.round(1500 + Math.random() * 800),
          mainTransition: 'Barren to Cropland'
        },
        {
          region: 'Riverside Areas',
          improvement: Math.round(55 + Math.random() * 20),
          area: Math.round(1200 + Math.random() * 600),
          mainTransition: 'Grassland to Forest'
        }
      ]
    };
  });
};

const getProcessedChartData = (gradientData: GradientData[], selectedYear: number) => {
  // Find data for the selected year
  const yearData = getClosestYearData(gradientData, selectedYear);
  
  if (!yearData || !yearData.transitions.length) {
    return { transitionData: [], degradationData: [], recoveryData: [] };
  }
  
  // Process transition data for charts
  const transitionData = yearData.transitions.map(t => ({
    name: `${t.from} to ${t.to}`,
    value: t.area,
    count: t.count,
    color: TRANSITION_TYPES[`${t.from} to ${t.to}` as keyof typeof TRANSITION_TYPES]?.color || '#a855f7',
    isNegative: t.isNegative
  }));
  
  // Process hotspot data
  const degradationData = yearData.hotspots.map(h => ({
    name: h.region,
    value: h.area,
    severity: h.severity,
    transition: h.mainTransition,
    color: '#ef4444'
  }));
  
  // Process recovery data
  const recoveryData = yearData.recovery.map(r => ({
    name: r.region,
    value: r.area,
    improvement: r.improvement,
    transition: r.mainTransition,
    color: '#22c55e'
  }));
  
  return { transitionData, degradationData, recoveryData };
};

const getClosestYearData = (data: GradientData[], targetYear: number): GradientData | undefined => {
  if (!data || data.length === 0) return undefined;
  
  // Find exact match
  const exactMatch = data.find(d => d.year === targetYear);
  if (exactMatch) return exactMatch;
  
  // Find closest year (should convert strings to numbers if needed)
  return data.reduce((prev, curr) => {
    const prevDiff = Math.abs(prev.year - Number(targetYear));
    const currDiff = Math.abs(curr.year - Number(targetYear));
    return currDiff < prevDiff ? curr : prev;
  });
};

const GradientAnalysis: React.FC<{ year: number }> = ({ year }) => {
  const [activeTab, setActiveTab] = useState('transitions');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [gradientData, setGradientData] = useState<GradientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load gradient data
  useEffect(() => {
    // In a real implementation, we would load actual data from the land_cover_transition directory
    // For now, we'll use our mock data generator
    setIsLoading(true);
    setTimeout(() => {
      const data = generateGradientData();
      setGradientData(data);
      setIsLoading(false);
    }, 800);
  }, []);
  
  const { transitionData, degradationData, recoveryData } = getProcessedChartData(gradientData, year);
  
  // Calculate totals for each category
  const totalDegradationArea = transitionData
    .filter(t => t.isNegative)
    .reduce((sum, t) => sum + t.value, 0);
    
  const totalRecoveryArea = transitionData
    .filter(t => !t.isNegative)
    .reduce((sum, t) => sum + t.value, 0);
    
  const netChange = totalRecoveryArea - totalDegradationArea;
  
  const renderBarChart = (data: any[]) => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value, name, props) => [
            `${value.toLocaleString()} ha`, 
            props.payload.name
          ]}
          labelFormatter={(value) => `${value}`}
        />
        <Legend />
        <Bar dataKey="value" name="Area (ha)">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
  
  const renderPieChart = (data: any[]) => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value.toLocaleString()} ha`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
  
  const getGradientInsights = () => {
    if (transitionData.length === 0) return "No gradient data available for analysis.";
    
    const degradationTypes = transitionData.filter(t => t.isNegative);
    const recoveryTypes = transitionData.filter(t => !t.isNegative);
    
    const mostCommonDegradation = degradationTypes.sort((a, b) => b.value - a.value)[0];
    const mostCommonRecovery = recoveryTypes.sort((a, b) => b.value - a.value)[0];
    
    const netChangeText = netChange > 0 
      ? `improving with a net gain of ${netChange.toLocaleString()} ha` 
      : `degrading with a net loss of ${Math.abs(netChange).toLocaleString()} ha`;
    
    return `Based on land cover transition gradient analysis for ${year}:
    
• The ecosystem is currently ${netChangeText}.
• The most significant degradation process is "${mostCommonDegradation?.name}", affecting ${mostCommonDegradation?.value.toLocaleString()} hectares.
• The most significant recovery process is "${mostCommonRecovery?.name}", affecting ${mostCommonRecovery?.value.toLocaleString()} hectares.
• Degradation hotspots are concentrated in the Southern Assaba region, primarily due to conversion from grassland to barren land.
• Recovery is strongest in riverside areas, where restoration efforts have successfully converted barren land to vegetation.

These gradient patterns indicate areas that require immediate intervention to prevent further land degradation, as well as successful restoration models that could be replicated in other regions.`;
  };
  
  return (
    <section className="py-12 bg-gradient-to-b from-white to-sahel-sandLight/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-sahel-earth/10 text-sahel-earth rounded-full mb-4">
            Advanced Analysis
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Land Cover Transition & Gradient Analysis
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Analyze patterns of land cover change, identify degradation hotspots, and discover areas of ecosystem recovery.
          </p>
        </div>
        
        <div className="bg-white dark:bg-muted rounded-xl shadow-sm border border-border/40 p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1">Year: {year}</Badge>
              <Badge variant="outline" className="px-3 py-1 bg-sahel-earth/10">
                Net Change: {netChange > 0 ? '+' : ''}{netChange.toLocaleString()} ha
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-3"
                      onClick={() => setChartType(chartType === 'bar' ? 'pie' : 'bar')}
                    >
                      {chartType === 'bar' ? 'Pie' : 'Bar'} Chart
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle chart type</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
              
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Filter className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 h-full order-2 lg:order-1">
              <div className="h-[400px]">
                <MapVisualization 
                  className="w-full h-full" 
                  year={year}
                  expandedView={true}
                  dataType="landCover"
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Card className="col-span-2">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Transition Legend</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(TRANSITION_TYPES).slice(0, 8).map(([name, { color }]) => (
                        <div key={name} className="flex items-center text-xs">
                          <div className="w-3 h-3 rounded-sm mr-1" style={{ backgroundColor: color }}></div>
                          <span className="truncate">{name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
              <Tabs defaultValue="transitions" onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="transitions">Land Transitions</TabsTrigger>
                  <TabsTrigger value="hotspots">Degradation Hotspots</TabsTrigger>
                  <TabsTrigger value="recovery">Recovery Areas</TabsTrigger>
                </TabsList>
                
                <TabsContent value="transitions" className="space-y-4">
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-t-sahel-green border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-sm text-muted-foreground">Loading data...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {chartType === 'bar' ? renderBarChart(transitionData) : renderPieChart(transitionData)}
                      
                      <div className="flex items-start gap-2 mt-4 text-sm text-muted-foreground">
                        <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <p>
                          Transitions show how land cover has changed between consecutive years.
                          Negative transitions (red/orange) indicate degradation, while positive transitions (green) indicate recovery.
                        </p>
                      </div>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="hotspots" className="space-y-4">
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-t-sahel-green border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-sm text-muted-foreground">Loading data...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {chartType === 'bar' ? renderBarChart(degradationData) : renderPieChart(degradationData)}
                      
                      <div className="flex items-start gap-2 mt-4 text-sm text-muted-foreground">
                        <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <p>
                          Degradation hotspots are areas with significant negative land cover changes.
                          These regions require priority intervention to prevent further ecosystem damage.
                        </p>
                      </div>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="recovery" className="space-y-4">
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-t-sahel-green border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-sm text-muted-foreground">Loading data...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {chartType === 'bar' ? renderBarChart(recoveryData) : renderPieChart(recoveryData)}
                      
                      <div className="flex items-start gap-2 mt-4 text-sm text-muted-foreground">
                        <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <p>
                          Recovery areas show where positive land cover transitions are occurring.
                          These success stories provide models for restoration efforts elsewhere in the region.
                        </p>
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
              
              <div className="p-4 bg-muted rounded-md">
                <h4 className="font-medium mb-2">Gradient Analysis Insights:</h4>
                <p className="whitespace-pre-line text-sm">
                  {getGradientInsights()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GradientAnalysis;
