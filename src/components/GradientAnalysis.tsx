
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LandCoverGradientChart from './LandCoverGradientChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RefreshCw, Layers, Sun, CloudRain } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

// Generated sample data for vegetation gradient
const vegetationGradientData = [
  {year: 2010, increase_sqm: 104, decrease_sqm: 279},
  {year: 2011, increase_sqm: 295, decrease_sqm: 98},
  {year: 2012, increase_sqm: 153, decrease_sqm: 211},
  {year: 2013, increase_sqm: 227, decrease_sqm: 132},
  {year: 2014, increase_sqm: 189, decrease_sqm: 205},
  {year: 2015, increase_sqm: 316, decrease_sqm: 89},
  {year: 2016, increase_sqm: 178, decrease_sqm: 187},
  {year: 2017, increase_sqm: 243, decrease_sqm: 151},
  {year: 2018, increase_sqm: 167, decrease_sqm: 236},
  {year: 2019, increase_sqm: 290, decrease_sqm: 87},
  {year: 2020, increase_sqm: 72, decrease_sqm: 328},
  {year: 2021, increase_sqm: 284, decrease_sqm: 109},
  {year: 2022, increase_sqm: 126, decrease_sqm: 274}
];

// Generated sample data for precipitation gradient
const precipitationGradientData = [
  {year: 2010, increase_sqm: 88, decrease_sqm: 312},
  {year: 2011, increase_sqm: 267, decrease_sqm: 123},
  {year: 2012, increase_sqm: 135, decrease_sqm: 250},
  {year: 2013, increase_sqm: 203, decrease_sqm: 172},
  {year: 2014, increase_sqm: 155, decrease_sqm: 235},
  {year: 2015, increase_sqm: 278, decrease_sqm: 109},
  {year: 2016, increase_sqm: 169, decrease_sqm: 209},
  {year: 2017, increase_sqm: 217, decrease_sqm: 175},
  {year: 2018, increase_sqm: 152, decrease_sqm: 248},
  {year: 2019, increase_sqm: 308, decrease_sqm: 92},
  {year: 2020, increase_sqm: 63, decrease_sqm: 337},
  {year: 2021, increase_sqm: 259, decrease_sqm: 141},
  {year: 2022, increase_sqm: 118, decrease_sqm: 272}
];

interface GradientAnalysisProps {
  year?: number;
  className?: string;
}

interface GradientChartProps {
  className?: string;
  selectedYear?: number;
  showSingleYear?: boolean;
}

const VegetationGradientChart = ({ className, selectedYear = 2022, showSingleYear = false }: GradientChartProps) => {
  const chartData = showSingleYear 
    ? vegetationGradientData.filter(item => item.year === selectedYear)
    : vegetationGradientData;
  
  const chartTitle = showSingleYear 
    ? `Vegetation Gradient (${selectedYear})` 
    : 'Vegetation Gradient (2010-2022)';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{chartTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ChartContainer 
            config={{
              increase: { label: "Increase", color: "#4ade80" },
              decrease: { label: "Decrease", color: "#f87171" }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                barSize={showSingleYear ? 80 : 20}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" angle={0} textAnchor="middle" height={40} />
                <YAxis width={50} />
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltipContent>
                          <div className="px-2 py-1">
                            <div className="text-sm font-bold">{payload[0]?.payload.year}</div>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-green-400 mr-1" />
                                <span className="text-xs">Increase:</span>
                              </div>
                              <span className="text-xs font-medium text-right">{payload[0]?.value} km²</span>
                              
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-red-400 mr-1" />
                                <span className="text-xs">Decrease:</span>
                              </div>
                              <span className="text-xs font-medium text-right">{payload[1]?.value} km²</span>
                            </div>
                          </div>
                        </ChartTooltipContent>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
                <Bar dataKey="increase_sqm" name="Increase" fill="#4ade80" />
                <Bar dataKey="decrease_sqm" name="Decrease" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const PrecipitationGradientChart = ({ className, selectedYear = 2022, showSingleYear = false }: GradientChartProps) => {
  const chartData = showSingleYear 
    ? precipitationGradientData.filter(item => item.year === selectedYear)
    : precipitationGradientData;
  
  const chartTitle = showSingleYear 
    ? `Precipitation Gradient (${selectedYear})` 
    : 'Precipitation Gradient (2010-2022)';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{chartTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ChartContainer 
            config={{
              increase: { label: "Increase", color: "#60a5fa" },
              decrease: { label: "Decrease", color: "#f97316" }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                barSize={showSingleYear ? 80 : 20}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" angle={0} textAnchor="middle" height={40} />
                <YAxis width={50} />
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltipContent>
                          <div className="px-2 py-1">
                            <div className="text-sm font-bold">{payload[0]?.payload.year}</div>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-blue-400 mr-1" />
                                <span className="text-xs">Increase:</span>
                              </div>
                              <span className="text-xs font-medium text-right">{payload[0]?.value} km²</span>
                              
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-orange-400 mr-1" />
                                <span className="text-xs">Decrease:</span>
                              </div>
                              <span className="text-xs font-medium text-right">{payload[1]?.value} km²</span>
                            </div>
                          </div>
                        </ChartTooltipContent>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
                <Bar dataKey="increase_sqm" name="Increase" fill="#60a5fa" />
                <Bar dataKey="decrease_sqm" name="Decrease" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const GradientAnalysis = ({ year = 2023, className }: GradientAnalysisProps) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg font-medium">
          <RefreshCw size={18} className="mr-2 text-primary" />
          Trend Analysis and Change Detection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="landCover" className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="landCover" className="flex items-center">
              <Layers size={14} className="mr-1.5" />
              <span>Land Cover</span>
            </TabsTrigger>
            <TabsTrigger value="vegetation" className="flex items-center">
              <Sun size={14} className="mr-1.5" />
              <span>Vegetation</span>
            </TabsTrigger>
            <TabsTrigger value="precipitation" className="flex items-center">
              <CloudRain size={14} className="mr-1.5" />
              <span>Precipitation</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="landCover" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-full">
                <LandCoverGradientChart className="w-full" />
              </div>
              
              <div className="col-span-full">
                <LandCoverGradientChart className="w-full" selectedYear={year} showSingleYear={true} />
              </div>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Land Cover Improvement</p>
                      <p className="text-2xl font-bold text-green-600">+{year > 2020 ? 84 : year > 2015 ? 117 : 351} km²</p>
                      <p className="text-xs text-muted-foreground">from {year - 1} to {year}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Land Cover Deterioration</p>
                      <p className="text-2xl font-bold text-red-600">-{year > 2020 ? 318 : year > 2015 ? 285 : 51} km²</p>
                      <p className="text-xs text-muted-foreground">from {year - 1} to {year}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">Contributing Factors</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-xs">Agricultural Expansion</p>
                        <p className="text-xs font-medium">{year > 2020 ? '58%' : year > 2015 ? '55%' : '49%'}</p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: year > 2020 ? '58%' : year > 2015 ? '55%' : '49%' }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-xs">Urbanization</p>
                        <p className="text-xs font-medium">{year > 2020 ? '32%' : year > 2015 ? '28%' : '23%'}</p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: year > 2020 ? '32%' : year > 2015 ? '28%' : '23%' }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-xs">Climate Factors</p>
                        <p className="text-xs font-medium">{year > 2020 ? '42%' : year > 2015 ? '39%' : '34%'}</p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: year > 2020 ? '42%' : year > 2015 ? '39%' : '34%' }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-xs">Conservation Efforts</p>
                        <p className="text-xs font-medium">{year > 2020 ? '21%' : year > 2015 ? '17%' : '12%'}</p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: year > 2020 ? '21%' : year > 2015 ? '17%' : '12%' }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="vegetation" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-full">
                <VegetationGradientChart className="w-full" />
              </div>
              
              <div className="col-span-full">
                <VegetationGradientChart className="w-full" selectedYear={year} showSingleYear={true} />
              </div>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Vegetation Increase</p>
                      <p className="text-2xl font-bold text-green-600">+{year > 2020 ? 126 : year > 2015 ? 167 : 295} km²</p>
                      <p className="text-xs text-muted-foreground">from {year - 1} to {year}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Vegetation Decrease</p>
                      <p className="text-2xl font-bold text-red-600">-{year > 2020 ? 274 : year > 2015 ? 236 : 98} km²</p>
                      <p className="text-xs text-muted-foreground">from {year - 1} to {year}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">Contributing Factors</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-xs">Drought Conditions</p>
                        <p className="text-xs font-medium">{year > 2020 ? '63%' : year > 2015 ? '59%' : '45%'}</p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: year > 2020 ? '63%' : year > 2015 ? '59%' : '45%' }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-xs">Land Management</p>
                        <p className="text-xs font-medium">{year > 2020 ? '38%' : year > 2015 ? '32%' : '27%'}</p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: year > 2020 ? '38%' : year > 2015 ? '32%' : '27%' }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-xs">Seasonal Variations</p>
                        <p className="text-xs font-medium">{year > 2020 ? '47%' : year > 2015 ? '44%' : '39%'}</p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: year > 2020 ? '47%' : year > 2015 ? '44%' : '39%' }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="precipitation" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-full">
                <PrecipitationGradientChart className="w-full" />
              </div>
              
              <div className="col-span-full">
                <PrecipitationGradientChart className="w-full" selectedYear={year} showSingleYear={true} />
              </div>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Precipitation Increase</p>
                      <p className="text-2xl font-bold text-blue-600">+{year > 2020 ? 118 : year > 2015 ? 152 : 267} mm</p>
                      <p className="text-xs text-muted-foreground">from {year - 1} to {year}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Precipitation Decrease</p>
                      <p className="text-2xl font-bold text-orange-600">-{year > 2020 ? 272 : year > 2015 ? 248 : 123} mm</p>
                      <p className="text-xs text-muted-foreground">from {year - 1} to {year}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">Contributing Factors</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-xs">Monsoon Patterns</p>
                        <p className="text-xs font-medium">{year > 2020 ? '67%' : year > 2015 ? '62%' : '54%'}</p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: year > 2020 ? '67%' : year > 2015 ? '62%' : '54%' }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-xs">Climate Change</p>
                        <p className="text-xs font-medium">{year > 2020 ? '43%' : year > 2015 ? '36%' : '28%'}</p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: year > 2020 ? '43%' : year > 2015 ? '36%' : '28%' }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-xs">El Niño/La Niña</p>
                        <p className="text-xs font-medium">{year > 2020 ? '35%' : year > 2015 ? '31%' : '25%'}</p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: year > 2020 ? '35%' : year > 2015 ? '31%' : '25%' }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GradientAnalysis;
