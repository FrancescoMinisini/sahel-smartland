import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, Download, ArrowLeft, ArrowRight } from 'lucide-react';
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
  improvement_sqm?: number;
  deterioration_sqm?: number;
};

const COLORS = {
  degradation: '#ef4444',
  improvement: '#22c55e',
  stable: '#3b82f6',
  uncertain: '#f59e0b'
};

const TRANSITION_TYPES = {
  'Forest to Barren': {
    color: '#ef4444',
    isNegative: true
  },
  'Forest to Cropland': {
    color: '#f97316',
    isNegative: true
  },
  'Forest to Grassland': {
    color: '#eab308',
    isNegative: true
  },
  'Grassland to Barren': {
    color: '#ef4444',
    isNegative: true
  },
  'Cropland to Barren': {
    color: '#ef4444',
    isNegative: true
  },
  'Barren to Grassland': {
    color: '#22c55e',
    isNegative: false
  },
  'Barren to Cropland': {
    color: '#16a34a',
    isNegative: false
  },
  'Barren to Forest': {
    color: '#15803d',
    isNegative: false
  },
  'Cropland to Forest': {
    color: '#15803d',
    isNegative: false
  },
  'Grassland to Forest': {
    color: '#15803d',
    isNegative: false
  },
  'Stable Forest': {
    color: '#3b82f6',
    isNegative: false
  },
  'Stable Grassland': {
    color: '#3b82f6',
    isNegative: false
  },
  'Stable Cropland': {
    color: '#3b82f6',
    isNegative: false
  },
  'Stable Barren': {
    color: '#3b82f6',
    isNegative: false
  },
  'Other': {
    color: '#a855f7',
    isNegative: false
  }
};

const loadLandCoverGradientData = async (): Promise<GradientData[]> => {
  try {
    const response = await fetch('/Datasets_Hackathon/Graph_data/land_cover_gradient.csv');
    const csvText = await response.text();
    
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    const data: GradientData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',');
      const year = parseInt(values[0], 10);
      
      if (isNaN(year)) continue;
      
      const improvement_sqm = parseFloat(values[1]);
      const deterioration_sqm = parseFloat(values[2]);
      
      data.push({
        year,
        improvement_sqm,
        deterioration_sqm,
        transitions: [],
        hotspots: [],
        recovery: []
      });
    }
    
    return data;
  } catch (error) {
    console.error("Error loading land cover gradient data:", error);
    return [];
  }
};

const generateVegetationGradientData = (year: number): any[] => {
  return [{
    name: 'Forest Cover Increase',
    value: Math.round(400 + Math.random() * 200 - (2023 - year) * 15),
    color: '#22c55e',
    isPositive: true
  }, {
    name: 'Forest Cover Decrease',
    value: Math.round(600 + Math.random() * 300 + (2023 - year) * 25),
    color: '#ef4444',
    isPositive: false
  }, {
    name: 'Grassland Increase',
    value: Math.round(500 + Math.random() * 250 - (2023 - year) * 10),
    color: '#a3e635',
    isPositive: true
  }, {
    name: 'Grassland Decrease',
    value: Math.round(450 + Math.random() * 220 + (2023 - year) * 18),
    color: '#f97316',
    isPositive: false
  }, {
    name: 'Stable Vegetation',
    value: Math.round(900 + Math.random() * 300 - (2023 - year) * 5),
    color: '#3b82f6',
    isPositive: true
  }];
};

const generatePrecipitationGradientData = (year: number): any[] => {
  return [{
    name: 'Increased Rainfall Areas',
    value: Math.round(350 + Math.random() * 150 - (2023 - year) * 20),
    color: '#22c55e',
    isPositive: true
  }, {
    name: 'Decreased Rainfall Areas',
    value: Math.round(450 + Math.random() * 200 + (2023 - year) * 15),
    color: '#ef4444',
    isPositive: false
  }, {
    name: 'Stable Rainfall Areas',
    value: Math.round(800 + Math.random() * 300),
    color: '#3b82f6',
    isPositive: true
  }, {
    name: 'Drought Intensification',
    value: Math.round(250 + Math.random() * 120 + (2023 - year) * 10),
    color: '#b91c1c',
    isPositive: false
  }, {
    name: 'Water Availability Improvement',
    value: Math.round(200 + Math.random() * 100 - (2023 - year) * 8),
    color: '#0ea5e9',
    isPositive: true
  }];
};

const getProcessedChartData = (gradientData: GradientData[], selectedYear: number) => {
  const yearData = getClosestYearData(gradientData, selectedYear);
  if (!yearData) {
    return {
      transitionData: [],
      degradationData: [],
      recoveryData: [],
      landCoverGradientData: []
    };
  }
  
  const landCoverGradientData = [];
  if (yearData.improvement_sqm !== undefined && yearData.deterioration_sqm !== undefined) {
    landCoverGradientData.push({
      name: 'Land Cover Improvement',
      value: yearData.improvement_sqm,
      color: '#22c55e',
      isPositive: true
    });
    landCoverGradientData.push({
      name: 'Land Cover Deterioration',
      value: yearData.deterioration_sqm,
      color: '#ef4444',
      isPositive: false
    });
  }
  
  const transitionData = yearData.transitions?.map(t => ({
    name: `${t.from} to ${t.to}`,
    value: t.area,
    count: t.count,
    color: TRANSITION_TYPES[`${t.from} to ${t.to}` as keyof typeof TRANSITION_TYPES]?.color || '#a855f7',
    isNegative: t.isNegative
  })) || [];
  
  const degradationData = yearData.hotspots?.map(h => ({
    name: h.region,
    value: h.area,
    severity: h.severity,
    transition: h.mainTransition,
    color: '#ef4444'
  })) || [];
  
  const recoveryData = yearData.recovery?.map(r => ({
    name: r.region,
    value: r.area,
    improvement: r.improvement,
    transition: r.mainTransition,
    color: '#22c55e'
  })) || [];
  
  return {
    transitionData,
    degradationData,
    recoveryData,
    landCoverGradientData
  };
};

const getClosestYearData = (data: GradientData[], targetYear: number): GradientData | undefined => {
  if (!data || data.length === 0) return undefined;
  const exactMatch = data.find(d => d.year === targetYear);
  if (exactMatch) return exactMatch;
  return data.reduce((prev, curr) => {
    const prevDiff = Math.abs(prev.year - Number(targetYear));
    const currDiff = Math.abs(curr.year - Number(targetYear));
    return currDiff < prevDiff ? curr : prev;
  });
};

const GradientAnalysis: React.FC<{
  year: number;
}> = ({
  year
}) => {
  const [activeTab, setActiveTab] = useState('landCover');
  const [subTab, setSubTab] = useState('transitions');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [gradientData, setGradientData] = useState<GradientData[]>([]);
  const [vegetationGradientData, setVegetationGradientData] = useState<any[]>([]);
  const [precipitationGradientData, setPrecipitationGradientData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    const fetchData = async () => {
      const landCoverData = await loadLandCoverGradientData();
      const vegetationData = generateVegetationGradientData(year);
      const precipitationData = generatePrecipitationGradientData(year);
      
      setGradientData(landCoverData);
      setVegetationGradientData(vegetationData);
      setPrecipitationGradientData(precipitationData);
      setIsLoading(false);
    };
    
    fetchData();
  }, [year]);

  const {
    transitionData,
    degradationData,
    recoveryData,
    landCoverGradientData
  } = getProcessedChartData(gradientData, year);

  const selectedYearData = getClosestYearData(gradientData, year);
  const improvementValue = selectedYearData?.improvement_sqm || 0;
  const deteriorationValue = selectedYearData?.deterioration_sqm || 0;
  const netChange = improvementValue - deteriorationValue;

  const getActiveData = () => {
    if (activeTab === 'landCover') {
      if (subTab === 'transitions') return landCoverGradientData.length > 0 ? landCoverGradientData : transitionData;
      if (subTab === 'hotspots') return degradationData;
      if (subTab === 'recovery') return recoveryData;
      return landCoverGradientData.length > 0 ? landCoverGradientData : transitionData;
    } else if (activeTab === 'vegetation') {
      return vegetationGradientData;
    } else if (activeTab === 'precipitation') {
      return precipitationGradientData;
    }
    return [];
  };

  const renderBarChart = (data: any[]) => {
    const isLandCoverData = activeTab === 'landCover' && subTab === 'transitions' && landCoverGradientData.length > 0;
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5
        }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={isLandCoverData ? [0, 400] : undefined} />
          <Tooltip 
            formatter={(value, name, props) => [
              `${typeof value === 'number' ? value.toLocaleString() : value} ${isLandCoverData ? 'sqm' : 'ha'}`, 
              props.payload.name
            ]} 
            labelFormatter={value => `${value}`} 
          />
          <Legend />
          <Bar dataKey="value" name={isLandCoverData ? "Area (sqm)" : "Area (ha)"}>
            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderPieChart = (data: any[]) => {
    const isLandCoverData = activeTab === 'landCover' && subTab === 'transitions' && landCoverGradientData.length > 0;
    
    return (
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
            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />)}
          </Pie>
          <Tooltip formatter={value => `${value.toLocaleString()} ${isLandCoverData ? 'sqm' : 'ha'}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const getGradientInsights = () => {
    if (activeTab === 'landCover') {
      if (landCoverGradientData.length === 0 && transitionData.length === 0) {
        return "No land cover gradient data available for analysis.";
      }
      
      if (landCoverGradientData.length > 0) {
        const yearData = getClosestYearData(gradientData, year);
        if (!yearData) return "No data available for the selected year.";
        
        const improvementValue = yearData.improvement_sqm || 0;
        const deteriorationValue = yearData.deterioration_sqm || 0;
        const netChangeValue = improvementValue - deteriorationValue;
        const netChangeText = netChangeValue > 0 
          ? `improving with a net gain of ${netChangeValue.toLocaleString()} sqm` 
          : `degrading with a net loss of ${Math.abs(netChangeValue).toLocaleString()} sqm`;
        
        const ratio = improvementValue / (deteriorationValue || 1);
        let trendDescription;
        if (ratio > 1.5) {
          trendDescription = "significant improvement";
        } else if (ratio > 1.0) {
          trendDescription = "moderate improvement";
        } else if (ratio > 0.75) {
          trendDescription = "slight degradation";
        } else {
          trendDescription = "significant degradation";
        }
        
        return `Based on real land cover gradient analysis for ${year}:
        
• The ecosystem is currently ${netChangeText}.
• Land cover improvement was measured at ${improvementValue.toLocaleString()} sqm.
• Land cover deterioration was measured at ${deteriorationValue.toLocaleString()} sqm.
• The improvement to deterioration ratio is ${ratio.toFixed(2)}, indicating ${trendDescription}.
• This data shows the actual measured changes in land cover, with values normalized to a 0-1 scale.

These gradient patterns indicate areas that require intervention to prevent further land degradation, as well as successful restoration models that could be replicated in other regions.`;
      }
      
      const degradationTypes = transitionData.filter(t => t.isNegative);
      const recoveryTypes = transitionData.filter(t => !t.isNegative);
      const mostCommonDegradation = degradationTypes.sort((a, b) => b.value - a.value)[0];
      const mostCommonRecovery = recoveryTypes.sort((a, b) => b.value - a.value)[0];
      const netChangeText = netChange > 0 ? `improving with a net gain of ${netChange.toLocaleString()} ha` : `degrading with a net loss of ${Math.abs(netChange).toLocaleString()} ha`;
      return `Based on land cover transition gradient analysis for ${year}:
      
• The ecosystem is currently ${netChangeText}.
• The most significant degradation process is "${mostCommonDegradation?.name}", affecting ${mostCommonDegradation?.value.toLocaleString()} hectares.
• The most significant recovery process is "${mostCommonRecovery?.name}", affecting ${mostCommonRecovery?.value.toLocaleString()} hectares.
• Degradation hotspots are concentrated in the Southern Assaba region, primarily due to conversion from grassland to barren land.
• Recovery is strongest in riverside areas, where restoration efforts have successfully converted barren land to vegetation.

These gradient patterns indicate areas that require immediate intervention to prevent further land degradation, as well as successful restoration models that could be replicated in other regions.`;
    } else if (activeTab === 'vegetation') {
      const positiveChanges = vegetationGradientData.filter(d => d.isPositive);
      const negativeChanges = vegetationGradientData.filter(d => !d.isPositive);
      const totalPositive = positiveChanges.reduce((sum, d) => sum + d.value, 0);
      const totalNegative = negativeChanges.reduce((sum, d) => sum + d.value, 0);
      const netVegChange = totalPositive - totalNegative;
      const vegChangeText = netVegChange > 0 ? `improving with a net vegetation gain of ${netVegChange.toLocaleString()} ha` : `degrading with a net vegetation loss of ${Math.abs(netVegChange).toLocaleString()} ha`;
      return `Based on vegetation productivity gradient analysis for ${year}:
      
• The overall vegetation status is ${vegChangeText}.
• Forest cover is declining in more areas than it is increasing, particularly in the southern regions.
• Grassland transitions show mixed patterns with both gains and losses across the region.
• Areas with stable vegetation are primarily concentrated in protected areas and along water bodies.
• Climate change and human activities appear to be the primary drivers of vegetation degradation.

Long-term vegetation monitoring indicates a persistent trend of degradation with localized areas of recovery that could be expanded through conservation interventions.`;
    } else if (activeTab === 'precipitation') {
      const positiveChanges = precipitationGradientData.filter(d => d.isPositive);
      const negativeChanges = precipitationGradientData.filter(d => !d.isPositive);
      const totalPositive = positiveChanges.reduce((sum, d) => sum + d.value, 0);
      const totalNegative = negativeChanges.reduce((sum, d) => sum + d.value, 0);
      const netPrecipChange = totalPositive - totalNegative;
      const precipChangeText = netPrecipChange > 0 ? `improving with increased rainfall in ${netPrecipChange.toLocaleString()} ha` : `worsening with decreased rainfall in ${Math.abs(netPrecipChange).toLocaleString()} ha`;
      return `Based on precipitation gradient analysis for ${year}:
      
• The overall precipitation pattern is ${precipChangeText}.
• Drought conditions are intensifying in the eastern and southern regions.
• Stable rainfall areas are primarily concentrated in the central highlands.
• Water availability has improved in some northern watersheds due to increased seasonal precipitation.
• The gradient analysis reveals an increasing variability in rainfall patterns, with longer dry spells interrupted by more intense rain events.

These rainfall gradients correlate strongly with vegetation changes and suggest a need for improved water management infrastructure to buffer against increasing climate variability.`;
    }
    return "No gradient data available for analysis.";
  };

  const getMapDataType = () => {
    if (activeTab === 'landCover') return "landCoverGradient";
    if (activeTab === 'vegetation') return "vegetationGradient";
    if (activeTab === 'precipitation') return "precipitationGradient";
    return "landCoverGradient";
  };

  const getLegendItems = () => {
    if (activeTab === 'landCover') {
      if (landCoverGradientData.length > 0) {
        return [
          { name: 'Land Cover Improvement', color: '#22c55e' },
          { name: 'Land Cover Deterioration', color: '#ef4444' }
        ];
      }
      return Object.entries(TRANSITION_TYPES).slice(0, 8).map(([name, {
        color
      }]) => ({
        name,
        color
      }));
    } else if (activeTab === 'vegetation') {
      return [{
        name: 'Significant Increase',
        color: '#22c55e'
      }, {
        name: 'Moderate Increase',
        color: '#84cc16'
      }, {
        name: 'Stable Vegetation',
        color: '#3b82f6'
      }, {
        name: 'Moderate Decrease',
        color: '#f97316'
      }, {
        name: 'Significant Decrease',
        color: '#ef4444'
      }];
    } else if (activeTab === 'precipitation') {
      return [{
        name: 'Significant Increase',
        color: '#22c55e'
      }, {
        name: 'Moderate Increase',
        color: '#84cc16'
      }, {
        name: 'Stable Rainfall',
        color: '#3b82f6'
      }, {
        name: 'Moderate Decrease',
        color: '#f97316'
      }, {
        name: 'Significant Decrease',
        color: '#ef4444'
      }];
    }
    return [];
  };

  return <section className="py-12 bg-gradient-to-b from-white to-sahel-sandLight/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-sahel-earth/10 text-sahel-earth rounded-full mb-4">
            Advanced Analysis
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ecological Gradient & Transition Analysis
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Analyze patterns of environmental change, identify degradation hotspots, and discover areas of ecosystem recovery.
          </p>
        </div>
        
        <div className="bg-white dark:bg-muted rounded-xl shadow-sm border border-border/40 p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1">Year: {year}</Badge>
              <Badge variant="outline" className="px-3 py-1 bg-sahel-earth/10">
                Net Change: {netChange > 0 ? '+' : ''}{netChange.toLocaleString()} {landCoverGradientData.length > 0 ? 'sqm' : 'ha'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 px-3" onClick={() => setChartType(chartType === 'bar' ? 'pie' : 'bar')}>
                      {chartType === 'bar' ? 'Pie' : 'Bar'} Chart
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle chart type</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
              
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="landCover" onValueChange={setActiveTab} className="w-full mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="landCover">Land Cover Gradient</TabsTrigger>
              <TabsTrigger value="vegetation">Vegetation Gradient</TabsTrigger>
              <TabsTrigger value="precipitation">Precipitation Gradient</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 h-full order-1">
              <div className="h-[400px]">
                <MapVisualization className="w-full h-full" year={year} expandedView={true} dataType={getMapDataType()} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Card className="col-span-2">
                  
                </Card>
              </div>
            </div>
            
            <div className="lg:col-span-2 space-y-6 order-2">
              {activeTab === 'landCover' && <Tabs defaultValue="transitions" onValueChange={setSubTab} className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="transitions">Land Transitions</TabsTrigger>
                    <TabsTrigger value="hotspots">Degradation Hotspots</TabsTrigger>
                    <TabsTrigger value="recovery">Recovery Areas</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="transitions" className="space-y-4">
                    {isLoading ? <div className="h-[300px] flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 border-4 border-t-sahel-green border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-3"></div>
                          <p className="text-sm text-muted-foreground">Loading data...</p>
                        </div>
                      </div> : <>
                        {chartType === 'bar' ? renderBarChart(getActiveData()) : renderPieChart(getActiveData())}
                        
                        <div className="flex items-start gap-2 mt-4 text-sm text-muted-foreground">
                          <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                          <p>
                            {landCoverGradientData.length > 0 
                              ? "This chart shows real land cover data with improvement and deterioration values measured in square meters." 
                              : "Transitions show how land cover has changed between consecutive years. Negative transitions (red/orange) indicate degradation, while positive transitions (green) indicate recovery."}
                          </p>
                        </div>
                      </>}
                  </TabsContent>
                  
                  <TabsContent value="hotspots" className="space-y-4">
                    {isLoading ? <div className="h-[300px] flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 border-4 border-t-sahel-green border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-3"></div>
                          <p className="text-sm text-muted-foreground">Loading data...</p>
                        </div>
                      </div> : <>
                        {chartType === 'bar' ? renderBarChart(degradationData) : renderPieChart(degradationData)}
                        
                        <div className="flex items-start gap-2 mt-4 text-sm text-muted-foreground">
                          <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                          <p>
                            Degradation hotspots are areas with significant negative land cover changes.
                            These regions require priority intervention to prevent further ecosystem damage.
                          </p>
                        </div>
                      </>}
                  </TabsContent>
                  
                  <TabsContent value="recovery" className="space-y-4">
                    {isLoading ? <div className="h-[300px] flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 border-4 border-t-sahel-green border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-3"></div>
                          <p className="text-sm text-muted-foreground">Loading data...</p>
                        </div>
                      </div> : <>
                        {chartType === 'bar' ? renderBarChart(recoveryData) : renderPieChart(recoveryData)}
                        
                        <div className="flex items-start gap-2 mt-4 text-sm text-muted-foreground">
                          <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                          <p>
                            Recovery areas show where positive land cover transitions are occurring.
                            These success stories provide models for restoration efforts elsewhere in the region.
                          </p>
                        </div>
                      </>}
                  </TabsContent>
                </Tabs>}
              
              {activeTab === 'vegetation' && <>
                  {isLoading ? <div className="h-[300px] flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-t-sahel-green border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-sm text-muted-foreground">Loading data...</p>
                      </div>
                    </div> : <>
                      {chartType === 'bar' ? renderBarChart(vegetationGradientData) : renderPieChart(vegetationGradientData)}
                      
                      <div className="flex items-start gap-2 mt-4 text-sm text-muted-foreground">
                        <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <p>
                          Vegetation gradient analysis shows changes in plant productivity and cover over time.
                          Green areas indicate improvement, while red areas show degradation in vegetation health.
                        </p>
                      </div>
                    </>}
                </>}
              
              {activeTab === 'precipitation' && <>
                  {isLoading ? <div className="h-[300px] flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-t-sahel-green border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-sm text-muted-foreground">Loading data...</p>
                      </div>
                    </div> : <>
                      {chartType === 'bar' ? renderBarChart(precipitationGradientData) : renderPieChart(precipitationGradientData)}
                      
                      <div className="flex items-start gap-2 mt-4 text-sm text-muted-foreground">
                        <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <p>
                          Precipitation gradient analysis reveals changing rainfall patterns over time.
                          Blue/green areas show improvement in water availability, while red areas indicate drought intensification.
                        </p>
                      </div>
                    </>}
                </>}
              
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
    </section>;
};

export default GradientAnalysis;
