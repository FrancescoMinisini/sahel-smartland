
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { getPopulationTimeSeriesData, getPopulationEnvironmentCorrelation } from '@/lib/geospatialUtils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PopulationInsightsChartsProps {
  className?: string;
  year?: number;
}

const PopulationInsightsCharts: React.FC<PopulationInsightsChartsProps> = ({
  className,
  year = 2023
}) => {
  const [activeTab, setActiveTab] = useState('demographics');
  
  // Get population data for the selected year or the closest available
  const populationData = useMemo(() => {
    const allYears = getPopulationTimeSeriesData();
    
    // Find the closest year if the selected year is not available
    return allYears.find(d => d.year === year) || allYears[allYears.length - 1];
  }, [year]);
  
  // Get all years of population data for the trends tab
  const populationTrendData = useMemo(() => {
    return getPopulationTimeSeriesData();
  }, []);
  
  // Get correlation data for the relationships tab
  const correlationData = useMemo(() => {
    return getPopulationEnvironmentCorrelation();
  }, []);
  
  // Format for the tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-neutral-200 shadow-sm rounded-md text-xs">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  const renderDemographicsContent = () => {
    const demographicData = [
      { name: 'Under 15', value: populationData['Under 15'] },
      { name: 'Working Age', value: populationData['Working Age'] },
      { name: 'Over 65', value: populationData['Over 65'] }
    ];
    
    const genderData = [
      { name: 'Male', value: populationData['Male'] },
      { name: 'Female', value: populationData['Female'] }
    ];
    
    const locationData = [
      { name: 'Urban', value: populationData['Urban'] },
      { name: 'Rural', value: populationData['Rural'] }
    ];
    
    const COLORS = ['#6f6af8', '#22c55e', '#f97316', '#3b82f6', '#ef4444'];
    
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Age Distribution</CardTitle>
            <CardDescription>Demographic breakdown by age group</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demographicData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {demographicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => value.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="text-sahel-blue font-medium">{populationData['Under 15'].toLocaleString()}</div>
                <div className="text-neutral-500">Under 15</div>
              </div>
              <div>
                <div className="text-sahel-green font-medium">{populationData['Working Age'].toLocaleString()}</div>
                <div className="text-neutral-500">Working Age</div>
              </div>
              <div>
                <div className="text-sahel-earthLight font-medium">{populationData['Over 65'].toLocaleString()}</div>
                <div className="text-neutral-500">Over 65</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distribution</CardTitle>
            <CardDescription>Urban vs. rural population</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="aspect-square rounded-full border-8 border-sahel-blue flex items-center justify-center">
                  <div>
                    <div className="text-center font-semibold text-lg">{Math.round((populationData['Urban'] / populationData['Total']) * 100)}%</div>
                    <div className="text-center text-xs">Urban</div>
                  </div>
                </div>
                <div className="mt-2 text-center text-sm font-medium">{populationData['Urban'].toLocaleString()}</div>
              </div>
              <div>
                <div className="aspect-square rounded-full border-8 border-sahel-earth flex items-center justify-center">
                  <div>
                    <div className="text-center font-semibold text-lg">{Math.round((populationData['Rural'] / populationData['Total']) * 100)}%</div>
                    <div className="text-center text-xs">Rural</div>
                  </div>
                </div>
                <div className="mt-2 text-center text-sm font-medium">{populationData['Rural'].toLocaleString()}</div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-xs text-neutral-500 mb-1">
                <span>Population Density</span>
                <span>{populationData['Population Density']} people/km²</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2">
                <div 
                  className="bg-sahel-blue h-2 rounded-full" 
                  style={{ width: `${Math.min(populationData['Population Density'] / 20 * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Key Statistics</CardTitle>
            <CardDescription>Population metrics for {year}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-neutral-50 p-3 rounded-lg">
                <div className="text-sahel-blue font-semibold text-lg">{populationData['Total'].toLocaleString()}</div>
                <div className="text-neutral-500 text-xs">Total Population</div>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg">
                <div className="text-sahel-earth font-semibold text-lg">{populationData['Growth Rate']}%</div>
                <div className="text-neutral-500 text-xs">Annual Growth</div>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg">
                <div className="text-sahel-green font-semibold text-lg">{(populationData['Male'] / populationData['Total'] * 100).toFixed(1)}%</div>
                <div className="text-neutral-500 text-xs">Male Population</div>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg">
                <div className="text-sahel-greenLight font-semibold text-lg">{(populationData['Female'] / populationData['Total'] * 100).toFixed(1)}%</div>
                <div className="text-neutral-500 text-xs">Female Population</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderTrendsContent = () => {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Population Growth Trend</CardTitle>
            <CardDescription>Total population by year (2010-2023)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={populationTrendData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Total" 
                    stroke="#6f6af8" 
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Urban/Rural Trend</CardTitle>
            <CardDescription>Population distribution over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={populationTrendData.filter(d => d.year % 2 === 0)} // Show every other year to avoid crowding
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Urban" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="Rural" stackId="a" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate Trend</CardTitle>
            <CardDescription>Annual population growth rate (%)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={populationTrendData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Growth Rate" 
                    stroke="#f97316" 
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderEnvironmentContent = () => {
    // Render correlation between population and environmental factors
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Population-Environment Correlations</CardTitle>
            <CardDescription>Relationship between population and environmental factors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={correlationData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[-1, 1]} /> {/* Set domain to -1 to 1 */}
                  <YAxis type="category" dataKey="factor" />
                  <Tooltip
                    formatter={(value: number) => [value.toFixed(2), 'Correlation']}
                    labelFormatter={(label: string) => `Factor: ${label}`}
                  />
                  <Bar 
                    dataKey="correlation" 
                    fill="#8884d8" // Default fill color
                  >
                    {correlationData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.correlation > 0 ? '#22c55e' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Environmental Impacts</CardTitle>
            <CardDescription>How environmental factors affect population distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {correlationData.map((item, index) => (
                <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-neutral-50">
                  <Badge variant={item.impact === "positive" ? "default" : (item.impact === "negative" ? "destructive" : "outline")} className="mt-0.5">
                    {item.correlation.toFixed(2)}
                  </Badge>
                  <div>
                    <div className="font-medium text-sm">{item.factor}</div>
                    <div className="text-xs text-neutral-600">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <div className={cn("", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="trends">Historical Trends</TabsTrigger>
          <TabsTrigger value="environment">Environmental Factors</TabsTrigger>
        </TabsList>
        <TabsContent value="demographics" className="mt-4">
          {renderDemographicsContent()}
        </TabsContent>
        <TabsContent value="trends" className="mt-4">
          {renderTrendsContent()}
        </TabsContent>
        <TabsContent value="environment" className="mt-4">
          {renderEnvironmentContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PopulationInsightsCharts;
