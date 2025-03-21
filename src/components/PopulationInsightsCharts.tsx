
import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info } from 'lucide-react';
import { getPopulationTimeSeriesData, getPopulationEnvironmentCorrelation } from '@/lib/geospatialUtils';

// Custom colors for charts
const COLORS = {
  urban: '#1E88E5',
  rural: '#43A047',
  under15: '#7E57C2',
  over65: '#E53935',
  working: '#FB8C00',
  male: '#5C6BC0',
  female: '#EC407A',
  population: '#26A69A',
  growth: '#FFA726',
  positive: '#66BB6A',
  negative: '#EF5350',
  neutral: '#78909C'
};

// Custom ToolTip for PopulationPyramid
const PyramidTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow-sm text-xs">
        <p className="font-medium">{payload[0].name === 'Male' ? '♂' : '♀'} {payload[0].name}</p>
        <p className="text-sahel-earth">
          {Math.abs(payload[0].value).toLocaleString()} people
        </p>
        <p className="text-sahel-earthLight">
          {Math.abs(payload[0].payload.percentage).toFixed(1)}% of population
        </p>
      </div>
    );
  }
  return null;
};

const CustomizedDot = (props: any) => {
  const { cx, cy, value } = props;
  
  return (
    <circle 
      cx={cx} 
      cy={cy} 
      r={4} 
      fill="#FFF" 
      stroke={COLORS.growth} 
      strokeWidth={2}
    />
  );
};

const PopulationInsightsCharts: React.FC = () => {
  const populationData = getPopulationTimeSeriesData();
  const environmentCorrelation = getPopulationEnvironmentCorrelation();
  
  // Prepare data for population pyramid (latest year only)
  const latestYearData = populationData[populationData.length - 1];
  const totalPopulation = latestYearData.Total;
  
  const pyramidData = [
    { 
      name: 'Under 15',
      Male: -(latestYearData['Under 15'] * (latestYearData.Male / latestYearData.Total)),
      Female: latestYearData['Under 15'] * (latestYearData.Female / latestYearData.Total),
      percentage: (latestYearData['Under 15'] / totalPopulation) * 100
    },
    { 
      name: 'Working Age',
      Male: -(latestYearData['Working Age'] * (latestYearData.Male / latestYearData.Total)),
      Female: latestYearData['Working Age'] * (latestYearData.Female / latestYearData.Total),
      percentage: (latestYearData['Working Age'] / totalPopulation) * 100
    },
    { 
      name: 'Over 65',
      Male: -(latestYearData['Over 65'] * (latestYearData.Male / latestYearData.Total)),
      Female: latestYearData['Over 65'] * (latestYearData.Female / latestYearData.Total),
      percentage: (latestYearData['Over 65'] / totalPopulation) * 100
    },
  ];
  
  // Prepare data for urban/rural pie chart
  const urbanRuralData = [
    { name: 'Urban', value: latestYearData.Urban, color: COLORS.urban },
    { name: 'Rural', value: latestYearData.Rural, color: COLORS.rural }
  ];
  
  // Format numbers with commas for thousands
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="col-span-1 md:col-span-2">
        <CardContent className="pt-6">
          <CardTitle className="text-xl mb-2 flex items-center gap-2">
            Population Growth Trends
            <span className="text-xs font-normal text-muted-foreground">
              (2010-2023)
            </span>
          </CardTitle>
          <CardDescription className="mb-4">
            Analysis of population growth in the Assaba region of Mauritania with key demographic indicators
          </CardDescription>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={populationData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="year"
                tickFormatter={(year) => `${year}`}
              />
              <YAxis 
                yAxisId="left" 
                tickFormatter={(value) => `${value / 1000}k`}
                domain={['auto', 'auto']}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tickFormatter={(value) => `${value}%`}
                domain={[2, 3]}
              />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'Growth Rate' ? `${value}%` : formatNumber(value as number), 
                  name
                ]}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="Total" 
                stroke={COLORS.population} 
                strokeWidth={3}
                name="Total Population"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="Growth Rate" 
                stroke={COLORS.growth} 
                strokeWidth={2}
                dot={<CustomizedDot />}
                name="Growth Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <CardTitle className="text-lg mb-2">Urban vs Rural Population</CardTitle>
          <CardDescription className="mb-4">
            Distribution between urban and rural areas in {latestYearData.year}
          </CardDescription>
          
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={urbanRuralData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {urbanRuralData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNumber(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex-1 mt-4 md:mt-0 md:ml-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground">Urban Population</div>
                  <div className="text-lg font-semibold">{formatNumber(latestYearData.Urban)}</div>
                  <div className="text-xs text-blue-600">
                    {((latestYearData.Urban / latestYearData.Total) * 100).toFixed(1)}% of total
                  </div>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground">Rural Population</div>
                  <div className="text-lg font-semibold">{formatNumber(latestYearData.Rural)}</div>
                  <div className="text-xs text-green-600">
                    {((latestYearData.Rural / latestYearData.Total) * 100).toFixed(1)}% of total
                  </div>
                </div>
                
                <div className="col-span-2 flex items-center text-xs text-muted-foreground">
                  <Info size={14} className="mr-1" />
                  Urbanization has increased by approximately 8% since 2010
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <CardTitle className="text-lg mb-2">Population Structure</CardTitle>
          <CardDescription className="mb-4">
            Age and gender distribution pyramid for {latestYearData.year}
          </CardDescription>
          
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={pyramidData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
              barGap={0}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis 
                type="number" 
                tickFormatter={(value) => `${Math.abs(value / 1000)}k`}
                domain={[
                  (dataMin: number) => Math.floor(dataMin * 1.05),
                  (dataMax: number) => Math.ceil(dataMax * 1.05)
                ]}
              />
              <YAxis type="category" dataKey="name" />
              <Tooltip content={<PyramidTooltip />} />
              <Legend />
              <Bar dataKey="Male" fill={COLORS.male} name="Male" />
              <Bar dataKey="Female" fill={COLORS.female} name="Female" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="flex justify-between mt-4 text-xs text-muted-foreground">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-400 mr-1"></div>
              Under 15: {((latestYearData['Under 15'] / totalPopulation) * 100).toFixed(1)}%
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-orange-400 mr-1"></div>
              Working Age: {((latestYearData['Working Age'] / totalPopulation) * 100).toFixed(1)}%
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-400 mr-1"></div>
              Over 65: {((latestYearData['Over 65'] / totalPopulation) * 100).toFixed(1)}%
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2">
        <CardContent className="pt-6">
          <CardTitle className="text-lg mb-2">Population Demographics & Density</CardTitle>
          <CardDescription className="mb-4">
            Historical trends of key population metrics over time
          </CardDescription>
          
          <Tabs defaultValue="demographics">
            <TabsList className="mb-4">
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
              <TabsTrigger value="density">Population Density</TabsTrigger>
            </TabsList>
            
            <TabsContent value="demographics">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={populationData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip formatter={(value) => formatNumber(value as number)} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="Under 15" 
                    stackId="1" 
                    stroke={COLORS.under15} 
                    fill={COLORS.under15} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Working Age" 
                    stackId="1" 
                    stroke={COLORS.working} 
                    fill={COLORS.working} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Over 65" 
                    stackId="1" 
                    stroke={COLORS.over65} 
                    fill={COLORS.over65} 
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="text-xs text-muted-foreground mt-2">
                Note: Age distribution shows the working-age population is increasing as a proportion of the total.
              </div>
            </TabsContent>
            
            <TabsContent value="density">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={populationData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    domain={['auto', 'auto']}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="Population Density" 
                    fill={COLORS.population} 
                    name="Population Density (people/km²)" 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="Growth Rate" 
                    stroke={COLORS.growth} 
                    strokeWidth={2}
                    name="Annual Growth Rate (%)" 
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="text-xs text-muted-foreground mt-2">
                Note: Population density is increasing but the growth rate is slowly declining over time.
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2">
        <CardContent className="pt-6">
          <CardTitle className="text-lg mb-2">Population & Environmental Correlation</CardTitle>
          <CardDescription className="mb-4">
            Relationships between population patterns and environmental factors
          </CardDescription>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={environmentCorrelation}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                domain={[-1, 1]} 
                tickCount={11}
                tickFormatter={(value) => value.toFixed(1)}
              />
              <YAxis type="category" dataKey="category" />
              <Tooltip 
                formatter={(value, name, props) => [
                  `${parseFloat(value as string).toFixed(2)} correlation`, 
                  props.payload.category
                ]}
                labelFormatter={() => 'Correlation Strength'}
              />
              <Bar dataKey="correlation">
                {environmentCorrelation.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.correlation > 0 ? COLORS.positive : COLORS.negative} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
            {environmentCorrelation.map((item, index) => (
              <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                <span className="font-medium">{item.category}:</span> {item.impact}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PopulationInsightsCharts;
