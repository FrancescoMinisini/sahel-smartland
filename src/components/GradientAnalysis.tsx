import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, Download, ArrowLeft, ArrowRight } from 'lucide-react';
import MapVisualization from './MapVisualization';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TooltipProvider, Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Import the land cover gradient data
import landCoverGradientData from '../../../Datasets_Hackathon/Graph_data/land_cover_gradient.csv';

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

const prepareLandCoverGradientData = () => {
  const parsedData = landCoverGradientData.map(item => ({
    year: parseInt(item.year),
    improvement_sqm: parseInt(item.improvement_sqm),
    deterioration_sqm: parseInt(item.deterioration_sqm)
  }));

  return parsedData;
};

const createHistogramData = (year: number) => {
  const gradientData = prepareLandCoverGradientData();
  const yearData = gradientData.find(item => item.year === year);
  
  if (!yearData) return [];
  
  return [
    {
      name: 'Improvement',
      value: yearData.improvement_sqm,
      color: '#22c55e',
      isPositive: true
    },
    {
      name: 'Deterioration',
      value: yearData.deterioration_sqm,
      color: '#ef4444',
      isPositive: false
    }
  ];
};

const generateGradientData = (): GradientData[] => {
  const years = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022];
  return years.map((year, index) => {
    if (index === 0) return {
      year,
      transitions: [],
      hotspots: [],
      recovery: []
    };
    const prevYear = years[index - 1];
    return {
      year,
      transitions: [{
        from: 'Forest',
        to: 'Barren',
        count: Math.round(100 + Math.random() * 50 + index * 3),
        area: Math.round(1200 + Math.random() * 500 + index * 30),
        isNegative: true
      }, {
        from: 'Forest',
        to: 'Cropland',
        count: Math.round(80 + Math.random() * 40 + index * 2),
        area: Math.round(950 + Math.random() * 400 + index * 25),
        isNegative: true
      }, {
        from: 'Grassland',
        to: 'Barren',
        count: Math.round(120 + Math.random() * 60 - index * 2),
        area: Math.round(1400 + Math.random() * 600 - index * 40),
        isNegative: true
      }, {
        from: 'Barren',
        to: 'Grassland',
        count: Math.round(70 + Math.random() * 30 + index * 5),
        area: Math.round(850 + Math.random() * 350 + index * 45),
        isNegative: false
      }, {
        from: 'Barren',
        to: 'Cropland',
        count: Math.round(50 + Math.random() * 25 + index * 4),
        area: Math.round(650 + Math.random() * 300 + index * 35),
        isNegative: false
      }, {
        from: 'Grassland',
        to: 'Forest',
        count: Math.round(30 + Math.random() * 15 + index * 2),
        area: Math.round(400 + Math.random() * 200 + index * 20),
        isNegative: false
      }],
      hotspots: [{
        region: 'Southern Assaba',
        severity: Math.round(75 + Math.random() * 25),
        area: Math.round(3500 + Math.random() * 1500),
        mainTransition: 'Grassland to Barren'
      }, {
        region: 'Eastern Districts',
        severity: Math.round(65 + Math.random() * 20),
        area: Math.round(2800 + Math.random() * 1200),
        mainTransition: 'Forest to Cropland'
      }, {
        region: 'Central Watershed',
        severity: Math.round(55 + Math.random() * 15),
        area: Math.round(2200 + Math.random() * 1000),
        mainTransition: 'Forest to Barren'
      }],
      recovery: [{
        region: 'Northern Assaba',
        improvement: Math.round(45 + Math.random() * 30),
        area: Math.round(1800 + Math.random() * 900),
        mainTransition: 'Barren to Grassland'
      }, {
        region: 'Western Valleys',
        improvement: Math.round(35 + Math.random() * 25),
        area: Math.round(1500 + Math.random() * 800),
        mainTransition: 'Barren to Cropland'
      }, {
        region: 'Riverside Areas',
        improvement: Math.round(55 + Math.random() * 20),
        area: Math.round(1200 + Math.random() * 600),
        mainTransition: 'Grassland to Forest'
      }]
    };
  });
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
  if (!yearData || !yearData.transitions.length) {
    return {
      transitionData: [],
      degradationData: [],
      recoveryData: []
    };
  }
  const transitionData = yearData.transitions.map(t => ({
    name: `${t.from} to ${t.to}`,
    value: t.area,
    count: t.count,
    color: TRANSITION_TYPES[`${t.from} to ${t.to}` as keyof typeof TRANSITION_TYPES]?.color || '#a855f7',
    isNegative: t.isNegative
  }));
  const degradationData = yearData.hotspots.map(h => ({
    name: h.region,
    value: h.area,
    severity: h.severity,
    transition: h.mainTransition,
    color: '#ef4444'
  }));
  const recoveryData = yearData.recovery.map(r => ({
    name: r.region,
    value: r.area,
    improvement: r.improvement,
    transition: r.mainTransition,
    color: '#22c55e'
  }));
  return {
    transitionData,
    degradationData,
    recoveryData
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
  const [landCoverData, setLandCoverData] = useState<any[]>([]);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const data = generateGradientData();
      const vegetationData = generateVegetationGradientData(year);
      const precipitationData = generatePrecipitationGradientData(year);
      const coverData = prepareLandCoverGradientData();
      
      setGradientData(data);
      setVegetationGradientData(vegetationData);
      setPrecipitationGradientData(precipitationData);
      setLandCoverData(coverData);
      setIsLoading(false);
    }, 300);
  }, [year]);

  const {
    transitionData,
    degradationData,
    recoveryData
  } = getProcessedChartData(gradientData, year);

  const currentYearHistogramData = createHistogramData(year);
  
  const yearData = landCoverData.find(item => item.year === year);
  const totalDegradationArea = yearData ? yearData.deterioration_sqm : 0;
  const totalRecoveryArea = yearData ? yearData.improvement_sqm : 0;
  const netChange = totalRecoveryArea - totalDegradationArea;

  const getActiveData = () => {
    if (activeTab === 'landCover') {
      if (subTab === 'transitions') return currentYearHistogramData;
      if (subTab === 'hotspots') return degradationData;
      if (subTab === 'recovery') return recoveryData;
      return currentYearHistogramData;
    } else if (activeTab === 'vegetation') {
      return vegetationGradientData;
    } else if (activeTab === 'precipitation') {
      return precipitationGradientData;
    }
    return [];
  };

  const renderBarChart = (data: any[]) => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart 
        data={data} 
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 400]} />
        <Tooltip formatter={(value, name, props) => [`${value.toLocaleString()} sqm`, props.payload.name]} labelFormatter={value => `${value}`} />
        <Legend />
        <Bar dataKey="value" name="Area (sqm)">
          {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
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
          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />)}
        </Pie>
        <Tooltip formatter={value => `${value.toLocaleString()} sqm`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderTimeSeriesChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={landCoverData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis domain={[0, 400]} />
        <Tooltip formatter={(value, name) => [`${value} sqm`, name === 'improvement_sqm' ? 'Improvement' : 'Deterioration']} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="improvement_sqm" 
          stroke="#22c55e" 
          name="Improvement" 
          activeDot={{ r: 8 }} 
          strokeWidth={2}
        />
        <Line 
          type="monotone" 
          dataKey="deterioration_sqm" 
          stroke="#ef4444" 
          name="Deterioration" 
          activeDot={{ r: 8 }} 
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const getGradientInsights = () => {
    if (activeTab === 'landCover') {
      if (landCoverData.length === 0) return "No land cover gradient data available for analysis.";
      
      const yearData = landCoverData.find(item => item.year === year);
      if (!yearData) return "No land cover gradient data available for this year.";
      
      const netChangeText = netChange > 0 ? 
        `improving with a net gain of ${netChange.toLocaleString()} sqm` : 
        `degrading with a net loss of ${Math.abs(netChange).toLocaleString()} sqm`;
      
      return `Based on land cover transition gradient analysis for ${year}:
      
• The ecosystem is currently ${netChangeText}.
• The area shows improvement in ${yearData.improvement_sqm.toLocaleString()} square meters.
• The area shows deterioration in ${yearData.deterioration_sqm.toLocaleString()} square meters.
• The trend analysis indicates ${netChange > 0 ? 'positive ecological recovery' : 'continued degradation'}.
• These gradient patterns indicate areas that require immediate intervention to prevent further land degradation.

The data represents detailed analysis of land cover transitions in the Assaba region, providing valuable insights for targeted conservation and restoration efforts.`;
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
                Net Change: {netChange > 0 ? '+' : ''}{netChange.toLocaleString()} sqm
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
                    <TabsTrigger value="timeseries">Time Series</TabsTrigger>
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
                        {chartType === 'bar' ? renderBarChart(currentYearHistogramData) : renderPieChart(currentYearHistogramData)}
                        
                        <div className="flex items-start gap-2 mt-4 text-sm text-muted-foreground">
                          <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                          <p>
                            The chart shows land cover improvement and deterioration for the selected year.
                            Green bars indicate areas of improvement, while red bars show areas of degradation.
                          </p>
                        </div>
                      </>}
                  </TabsContent>
                  
                  <TabsContent value="timeseries" className="space-y-4">
                    {isLoading ? <div className="h-[300px] flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 border-4 border-t-sahel-green border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-3"></div>
                          <p className="text-sm text-muted-foreground">Loading data...</p>
                        </div>
                      </div> : <>
                        {renderTimeSeriesChart()}
                        
                        <div className="flex items-start gap-2 mt-4 text-sm text-muted-foreground">
                          <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                          <p>
                            This time series shows the trend of land cover improvement and deterioration from 2010 to 2022.
                            The green line represents improvement, while the red line shows deterioration over time.
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

