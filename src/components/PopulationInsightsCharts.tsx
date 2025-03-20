
import React from 'react';
import { getPopulationTimeSeriesData, getPopulationEnvironmentCorrelation } from '@/lib/geospatialUtils';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, Users, UserRound, Home, Sprout, Droplets } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

interface PopulationInsightsChartsProps {
  year: number;
  className?: string;
}

const PopulationInsightsCharts: React.FC<PopulationInsightsChartsProps> = ({ year, className }) => {
  // Get population time series data
  const populationData = getPopulationTimeSeriesData();
  
  // Get the data for the current year or closest available year
  const currentYearData = populationData.find(d => d.year === year) || 
                          populationData.reduce((prev, curr) => 
                            Math.abs(curr.year - year) < Math.abs(prev.year - year) ? curr : prev
                          );
  
  // Get environment correlation data
  const correlationData = getPopulationEnvironmentCorrelation();
  
  // Demographics data for pie chart
  const demographicsData = [
    { name: 'Under 15', value: currentYearData['Population Under 15'], color: '#38bdf8' },
    { name: 'Adults', value: currentYearData['Total Population'] - currentYearData['Population Under 15'] - currentYearData['Population Over 65'], color: '#4ade80' },
    { name: 'Over 65', value: currentYearData['Population Over 65'], color: '#fb923c' },
  ];
  
  // Calculate urban vs rural percentage
  const urbanPercentage = (currentYearData['Urban Population'] / currentYearData['Total Population'] * 100).toFixed(1);
  const ruralPercentage = (currentYearData['Rural Population'] / currentYearData['Total Population'] * 100).toFixed(1);
  
  // Settlement distribution data
  const settlementData = [
    { name: 'Urban', value: currentYearData['Urban Population'], color: '#64748b' },
    { name: 'Rural', value: currentYearData['Rural Population'], color: '#84cc16' },
  ];
  
  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Users className="h-5 w-5" />
              Population Growth Trend
            </CardTitle>
            <CardDescription>
              Total population change over time (2010-2023)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ChartContainer
                config={{
                  total: { label: 'Total Population' },
                  urban: { label: 'Urban' },
                  rural: { label: 'Rural' },
                }}
              >
                <AreaChart
                  data={populationData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="year"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value.toString()}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent 
                        indicator="dashed"
                        formatter={(value, name) => [`${value.toLocaleString()}`, name === 'total' ? 'Total Population' : name === 'urban' ? 'Urban Population' : 'Rural Population']}
                      />
                    }
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Total Population" 
                    name="total"
                    stroke="#6366f1" 
                    fill="#6366f1" 
                    fillOpacity={0.2} 
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Urban Population" 
                    name="urban"
                    stroke="#64748b" 
                    fill="#64748b" 
                    fillOpacity={0.2} 
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Rural Population" 
                    name="rural"
                    stroke="#84cc16" 
                    fill="#84cc16" 
                    fillOpacity={0.2} 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <UserRound className="h-5 w-5" />
              Demographic Breakdown ({year})
            </CardTitle>
            <CardDescription>
              Population distribution by age group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={demographicsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {demographicsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value.toLocaleString()} people`, '']}
                      labelFormatter={(name) => `${name}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 pl-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: '#38bdf8' }}></div>
                    <div className="flex justify-between w-full">
                      <span className="text-sm">Under 15</span>
                      <span className="text-sm font-medium">
                        {((currentYearData['Population Under 15'] / currentYearData['Total Population']) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: '#4ade80' }}></div>
                    <div className="flex justify-between w-full">
                      <span className="text-sm">Adults</span>
                      <span className="text-sm font-medium">
                        {(((currentYearData['Total Population'] - currentYearData['Population Under 15'] - currentYearData['Population Over 65']) / currentYearData['Total Population']) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: '#fb923c' }}></div>
                    <div className="flex justify-between w-full">
                      <span className="text-sm">Over 65</span>
                      <span className="text-sm font-medium">
                        {((currentYearData['Population Over 65'] / currentYearData['Total Population']) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Home className="h-5 w-5" />
              Urban vs Rural
            </CardTitle>
            <CardDescription>
              Settlement distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[160px]">
              <div className="w-2/5">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={settlementData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {settlementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value.toLocaleString()} people`, '']}
                      labelFormatter={(name) => `${name}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-3/5 pl-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: '#64748b' }}></div>
                    <div className="flex justify-between w-full">
                      <span className="text-sm">Urban</span>
                      <span className="text-sm font-medium">
                        {urbanPercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: '#84cc16' }}></div>
                    <div className="flex justify-between w-full">
                      <span className="text-sm">Rural</span>
                      <span className="text-sm font-medium">
                        {ruralPercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    The rural population is {ruralPercentage}% of the total, indicating a {Number(ruralPercentage) > 50 ? 'predominantly rural' : 'increasingly urbanized'} region.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Growth Rate Trend
            </CardTitle>
            <CardDescription>
              Annual population growth rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[160px]">
              <ChartContainer
                config={{
                  growth: { label: 'Growth Rate' },
                }}
              >
                <LineChart
                  data={populationData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="year"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value.toString()}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 4]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent 
                        formatter={(value, name) => [`${value}%`, 'Annual Growth Rate']}
                      />
                    }
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Growth Rate" 
                    name="growth"
                    stroke="#f97316" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Users className="h-5 w-5" />
              Population Density
            </CardTitle>
            <CardDescription>
              People per square kilometer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[160px]">
              <ChartContainer
                config={{
                  density: { label: 'Population Density' },
                }}
              >
                <BarChart
                  data={populationData.filter(d => d.year % 5 === 0)}
                  margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="year"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value.toString()}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent 
                        formatter={(value, name) => [`${value} people/km²`, 'Population Density']}
                      />
                    }
                  />
                  <Bar 
                    dataKey="Population Density" 
                    name="density"
                    fill="#a855f7" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            <Sprout className="h-5 w-5 text-green-500" />
            Population & Environment Correlation
          </CardTitle>
          <CardDescription>
            Relationship between population density and environmental factors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                population: { label: 'Population Density' },
                vegetation: { label: 'Vegetation Health' },
                precipitation: { label: 'Precipitation' },
              }}
            >
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  type="number" 
                  dataKey="populationDensity" 
                  name="Population Density" 
                  unit=" people/km²"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  type="number" 
                  dataKey="vegetationHealth" 
                  name="Vegetation Health" 
                  unit="%"
                  tickLine={false}
                  axisLine={false}
                  yAxisId="vegetation"
                />
                <YAxis 
                  type="number" 
                  dataKey="precipitation" 
                  name="Precipitation" 
                  unit="%"
                  tickLine={false}
                  axisLine={false}
                  yAxisId="precipitation"
                  orientation="right"
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter 
                  name="Vegetation Health" 
                  data={correlationData} 
                  fill="#4ade80" 
                  yAxisId="vegetation"
                />
                <Scatter 
                  name="Precipitation" 
                  data={correlationData} 
                  fill="#38bdf8" 
                  yAxisId="precipitation"
                />
              </ScatterChart>
            </ChartContainer>
          </div>
          <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm">
            <p className="font-medium mb-2">Key Insights:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                As population density increases, vegetation health tends to decrease, suggesting increased human 
                activity impacts natural vegetation.
              </li>
              <li>
                Precipitation patterns appear relatively independent of population density, indicating climate 
                factors operate independently of human settlement patterns.
              </li>
              <li>
                Areas with higher population density typically show 15-25% lower vegetation health indices 
                compared to sparsely populated areas.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base font-medium">Total Population</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{currentYearData['Total Population'].toLocaleString()}</span>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Estimated total population for {year}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base font-medium">Population Density</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{currentYearData['Population Density'].toFixed(1)}</span>
              <div className="text-muted-foreground">people/km²</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Average population density across the region
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base font-medium">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{currentYearData['Growth Rate'].toFixed(1)}%</span>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Annual population growth rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base font-medium">Urban Population</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{urbanPercentage}%</span>
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Percentage of population living in urban areas
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PopulationInsightsCharts;
