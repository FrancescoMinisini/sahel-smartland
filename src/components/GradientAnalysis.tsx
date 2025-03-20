
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ChevronLeft, ChevronRight, HelpCircle, ExternalLink } from 'lucide-react';
import { landCoverClasses, landCoverColors } from '@/lib/geospatialUtils';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// This would normally come from a CSV or API
const transitionMatrix = {
  2010: {
    "Forest to Grassland": 1247,
    "Forest to Barren": 562,
    "Grassland to Forest": 425,
    "Grassland to Barren": 3842,
    "Barren to Grassland": 2985,
    "Barren to Forest": 212,
    "Urban to Grassland": 35,
    "Grassland to Urban": 148,
    "Water to Grassland": 24,
    "Grassland to Water": 16
  },
  2015: {
    "Forest to Grassland": 1523,
    "Forest to Barren": 678,
    "Grassland to Forest": 312,
    "Grassland to Barren": 4156,
    "Barren to Grassland": 2654,
    "Barren to Forest": 186,
    "Urban to Grassland": 28,
    "Grassland to Urban": 213,
    "Water to Grassland": 19,
    "Grassland to Water": 12
  },
  2020: {
    "Forest to Grassland": 1842,
    "Forest to Barren": 745,
    "Grassland to Forest": 284,
    "Grassland to Barren": 4578,
    "Barren to Grassland": 2421,
    "Barren to Forest": 154,
    "Urban to Grassland": 19,
    "Grassland to Urban": 298,
    "Water to Grassland": 15,
    "Grassland to Water": 9
  },
  2023: {
    "Forest to Grassland": 2104,
    "Forest to Barren": 892,
    "Grassland to Forest": 246,
    "Grassland to Barren": 4927,
    "Barren to Grassland": 2165,
    "Barren to Forest": 118,
    "Urban to Grassland": 12,
    "Grassland to Urban": 356,
    "Water to Grassland": 11,
    "Grassland to Water": 7
  }
};

// Land degradation hotspots
const landDegradationData = [
  { id: 1, name: "Southern Region", percentage: 35, description: "High rate of forest to grassland conversion" },
  { id: 2, name: "Central Plains", percentage: 48, description: "Severe grassland to barren land transition" },
  { id: 3, name: "Eastern Corridor", percentage: 29, description: "Moderate degradation with urban encroachment" },
  { id: 4, name: "Northwestern Zone", percentage: 41, description: "Increasing desertification" },
  { id: 5, name: "Coastal Transition", percentage: 18, description: "Low degradation with stable vegetation" }
];

// Land improvement areas
const landImprovementData = [
  { id: 1, name: "Northern Protected Areas", percentage: 24, description: "Successful reforestation efforts" },
  { id: 2, name: "Central Watershed", percentage: 19, description: "Barren to grassland conversion" },
  { id: 3, name: "Eastern Agricultural Belt", percentage: 15, description: "Improved agricultural practices" }
];

const gradientColors = {
  "Forest to Grassland": "#91cf60",
  "Forest to Barren": "#d73027",
  "Grassland to Forest": "#1a9850",
  "Grassland to Barren": "#fdae61",
  "Barren to Grassland": "#a6d96a",
  "Barren to Forest": "#66bd63",
  "Urban to Grassland": "#d9ef8b",
  "Grassland to Urban": "#f46d43",
  "Water to Grassland": "#fee08b",
  "Grassland to Water": "#74add1"
};

interface GradientAnalysisProps {
  year: number;
}

const GradientAnalysis = ({ year }: GradientAnalysisProps) => {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [activeTab, setActiveTab] = useState("transitions");
  
  // Get the closest year data
  const getClosestYearData = () => {
    const availableYears = Object.keys(transitionMatrix).map(Number);
    const closestYear = availableYears.reduce((prev, curr) => 
      Math.abs(curr - year) < Math.abs(prev - year) ? curr : prev
    );
    return { year: closestYear, data: transitionMatrix[closestYear as keyof typeof transitionMatrix] };
  };
  
  const { year: dataYear, data } = getClosestYearData();
  
  // Transform data for charts
  const chartData = Object.entries(data).map(([transition, value]) => ({
    name: transition,
    value,
    color: gradientColors[transition as keyof typeof gradientColors] || '#cccccc'
  })).sort((a, b) => b.value - a.value);
  
  // Calculate net change by land cover type
  const netChangeByType: Record<string, number> = {};
  
  Object.entries(data).forEach(([transition, value]) => {
    const [from, to] = transition.split(' to ');
    
    if (!netChangeByType[from]) netChangeByType[from] = 0;
    if (!netChangeByType[to]) netChangeByType[to] = 0;
    
    netChangeByType[from] -= value;
    netChangeByType[to] += value;
  });
  
  const netChangeData = Object.entries(netChangeByType).map(([type, value]) => ({
    name: type,
    value,
    color: type === 'Forest' ? '#1a9850' : 
           type === 'Grassland' ? '#fee08b' : 
           type === 'Barren' ? '#d73027' :
           type === 'Urban' ? '#f46d43' :
           type === 'Water' ? '#74add1' : '#cccccc',
  })).sort((a, b) => a.value - b.value); // Sort by value ascending
  
  const toggleChartType = () => {
    setChartType(prev => prev === 'bar' ? 'pie' : 'bar');
  };
  
  // Create a heatmap data structure (example data)
  const generateHeatmapData = () => {
    const types = ["Forest", "Grassland", "Barren", "Urban", "Water"];
    const result = [];
    
    for (const from of types) {
      const row: Record<string, number> = { name: from };
      
      for (const to of types) {
        const transitionKey = `${from} to ${to}`;
        row[to] = data[transitionKey as keyof typeof data] || 0;
      }
      
      result.push(row);
    }
    
    return result;
  };
  
  const heatmapData = generateHeatmapData();
  
  // Some insights based on the transition data
  const getInsights = () => {
    // Find the most significant transition
    const maxTransition = Object.entries(data).reduce(
      (max, [transition, value]) => value > max.value ? { transition, value } : max,
      { transition: '', value: 0 }
    );
    
    // Calculate total degradation (forest/grassland loss to barren)
    const degradation = (data["Forest to Barren"] || 0) + (data["Grassland to Barren"] || 0);
    
    // Calculate total improvement (barren to vegetated)
    const improvement = (data["Barren to Forest"] || 0) + (data["Barren to Grassland"] || 0);
    
    // Calculate urbanization
    const urbanization = (data["Grassland to Urban"] || 0) + (data["Forest to Urban"] || 0);
    
    return {
      maxTransition,
      degradation,
      improvement,
      urbanization,
      netBalance: improvement - degradation,
      yearComparison: dataYear === year ? `Current year (${year})` : `Data from ${dataYear} (closest available to ${year})`,
      trend: year > 2015 ? 
        "Increasing land degradation with accelerated transitions from forests and grasslands to barren land" : 
        "Moderate land cover transitions with some recovery in vegetated areas"
    };
  };
  
  const insights = getInsights();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 h-full flex flex-col">
        <div className="bg-gradient-to-br from-foreground/5 to-muted/50 rounded-lg p-6 flex-1">
          <h3 className="text-lg font-medium mb-3">Land Cover Transition Map</h3>
          <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-md border border-border/40 mb-4">
            {/* This would be a map visualization - showing a static image for now */}
            <div className="relative w-full h-full overflow-hidden rounded-md">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a9850]/20 via-[#fdae61]/20 to-[#d73027]/20"></div>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">Land transition gradient visualization</span>
                  <div className="mt-2 flex justify-center gap-2">
                    <span className="inline-block w-4 h-4 bg-[#1a9850] rounded-sm"></span>
                    <span className="inline-block w-4 h-4 bg-[#fdae61] rounded-sm"></span>
                    <span className="inline-block w-4 h-4 bg-[#d73027] rounded-sm"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-4 border border-border/40">
            <h4 className="font-medium mb-2 flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
              Insights from {insights.yearComparison}
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <ChevronRight className="h-3 w-3 text-primary" />
                </span>
                <span>Most significant transition: <strong>{insights.maxTransition.transition}</strong> ({insights.maxTransition.value} hectares)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="rounded-full bg-destructive/10 p-1 mt-0.5">
                  <ChevronRight className="h-3 w-3 text-destructive" />
                </span>
                <span>Land degradation: <strong>{insights.degradation}</strong> hectares</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="rounded-full bg-green-500/10 p-1 mt-0.5">
                  <ChevronRight className="h-3 w-3 text-green-500" />
                </span>
                <span>Land improvement: <strong>{insights.improvement}</strong> hectares</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="rounded-full bg-blue-500/10 p-1 mt-0.5">
                  <ChevronRight className="h-3 w-3 text-blue-500" />
                </span>
                <span>Net balance: <strong className={insights.netBalance >= 0 ? "text-green-500" : "text-destructive"}>{insights.netBalance}</strong> hectares</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="rounded-full bg-orange-500/10 p-1 mt-0.5">
                  <ChevronRight className="h-3 w-3 text-orange-500" />
                </span>
                <span>Urbanization: <strong>{insights.urbanization}</strong> hectares</span>
              </li>
            </ul>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <h5 className="font-medium text-foreground mb-1">Trend Analysis:</h5>
              <p>{insights.trend}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="lg:col-span-2 h-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="transitions">Land Transitions</TabsTrigger>
              <TabsTrigger value="hotspots">Degradation Hotspots</TabsTrigger>
              <TabsTrigger value="recovery">Recovery Areas</TabsTrigger>
            </TabsList>
            
            <Button variant="outline" size="sm" onClick={toggleChartType}>
              {chartType === 'bar' ? 'Show as Pie Chart' : 'Show as Bar Chart'}
            </Button>
          </div>
          
          <TabsContent value="transitions" className="h-full">
            <div className="bg-white dark:bg-muted rounded-lg border border-border/40 p-6 h-full">
              <h3 className="text-lg font-medium mb-6">Land Cover Transitions ({dataYear})</h3>
              
              <div className="h-[400px]">
                {chartType === 'bar' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Hectares', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                      />
                      <Tooltip />
                      <Bar dataKey="value" name="Hectares">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} hectares`, 'Area']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-3">Net Change by Land Cover Type</h4>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={netChangeData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" 
                        label={{ value: 'Net Change (hectares)', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis type="category" dataKey="name" width={80} />
                      <Tooltip />
                      <Bar dataKey="value" name="Net Change">
                        {netChangeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="hotspots">
            <div className="bg-white dark:bg-muted rounded-lg border border-border/40 p-6 h-full">
              <h3 className="text-lg font-medium mb-6">Land Degradation Hotspots</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {landDegradationData.map(item => (
                    <div key={item.id} className="p-4 border border-border/60 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{item.name}</h4>
                        <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-900/20 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
                          {item.percentage}% degraded
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={landDegradationData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        label={{ value: 'Percentage Degraded', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip />
                      <Bar dataKey="percentage" name="Degradation %" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2">Key Drivers of Land Degradation</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="rounded-full bg-orange-500/10 p-1">
                      <ChevronRight className="h-3 w-3 text-orange-500" />
                    </span>
                    <span><strong>Climate Variability:</strong> Increasing temperatures and precipitation changes contribute to 37% of degradation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="rounded-full bg-red-500/10 p-1">
                      <ChevronRight className="h-3 w-3 text-red-500" />
                    </span>
                    <span><strong>Agricultural Expansion:</strong> Unsustainable farming practices account for 28% of conversions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="rounded-full bg-purple-500/10 p-1">
                      <ChevronRight className="h-3 w-3 text-purple-500" />
                    </span>
                    <span><strong>Urbanization:</strong> Urban sprawl contributes to 14% of land cover changes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="rounded-full bg-blue-500/10 p-1">
                      <ChevronRight className="h-3 w-3 text-blue-500" />
                    </span>
                    <span><strong>Resource Extraction:</strong> Mining and timber harvesting responsible for 12% of degradation</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="recovery">
            <div className="bg-white dark:bg-muted rounded-lg border border-border/40 p-6 h-full">
              <h3 className="text-lg font-medium mb-6">Land Recovery Areas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {landImprovementData.map(item => (
                    <div key={item.id} className="p-4 border border-border/60 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{item.name}</h4>
                        <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-900/20 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                          {item.percentage}% improved
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={landImprovementData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        label={{ value: 'Percentage Improved', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip />
                      <Bar dataKey="percentage" name="Improvement %" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2">Successful Restoration Strategies</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="rounded-full bg-green-500/10 p-1 mt-0.5">
                        <ChevronRight className="h-3 w-3 text-green-500" />
                      </span>
                      <div>
                        <strong className="block">Reforestation Projects</strong>
                        <span className="text-muted-foreground">Tree planting initiatives have restored 2,400+ hectares</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="rounded-full bg-blue-500/10 p-1 mt-0.5">
                        <ChevronRight className="h-3 w-3 text-blue-500" />
                      </span>
                      <div>
                        <strong className="block">Water Conservation</strong>
                        <span className="text-muted-foreground">Improved watershed management benefiting 3,200+ hectares</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="rounded-full bg-yellow-500/10 p-1 mt-0.5">
                        <ChevronRight className="h-3 w-3 text-yellow-500" />
                      </span>
                      <div>
                        <strong className="block">Sustainable Agriculture</strong>
                        <span className="text-muted-foreground">Improved farming techniques in 1,850+ hectares</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="rounded-full bg-purple-500/10 p-1 mt-0.5">
                        <ChevronRight className="h-3 w-3 text-purple-500" />
                      </span>
                      <div>
                        <strong className="block">Protected Area Expansion</strong>
                        <span className="text-muted-foreground">Newly protected lands covering 4,200+ hectares</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GradientAnalysis;
