
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LandCoverGradientChart from '@/components/LandCoverGradientChart';
import GradientComparison from '@/components/GradientComparison';
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
  AreaChart,
  Area
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { MapPin, ThermometerSun, TrendingUp } from 'lucide-react';

// Data for vegetation gradient
const vegetationGradientData = [
  {year: 2010, improvement_sqm: 84, deterioration_sqm: 293},
  {year: 2011, improvement_sqm: 315, deterioration_sqm: 78},
  {year: 2012, improvement_sqm: 136, deterioration_sqm: 248},
  {year: 2013, improvement_sqm: 275, deterioration_sqm: 112},
  {year: 2014, improvement_sqm: 157, deterioration_sqm: 231},
  {year: 2015, improvement_sqm: 300, deterioration_sqm: 85},
  {year: 2016, improvement_sqm: 179, deterioration_sqm: 212},
  {year: 2017, improvement_sqm: 248, deterioration_sqm: 144},
  {year: 2018, improvement_sqm: 125, deterioration_sqm: 265},
  {year: 2019, improvement_sqm: 362, deterioration_sqm: 28},
  {year: 2020, improvement_sqm: 38, deterioration_sqm: 352},
  {year: 2021, improvement_sqm: 329, deterioration_sqm: 59},
  {year: 2022, improvement_sqm: 95, deterioration_sqm: 296}
];

// New GDD data with north, center, south gradient
const gddData = [
  {year: 2010, north: 1250, center: 1680, south: 2150},
  {year: 2011, north: 1270, center: 1710, south: 2190},
  {year: 2012, north: 1220, center: 1650, south: 2130},
  {year: 2013, north: 1240, center: 1670, south: 2160},
  {year: 2014, north: 1260, center: 1700, south: 2200},
  {year: 2015, north: 1280, center: 1730, south: 2230},
  {year: 2016, north: 1300, center: 1750, south: 2260},
  {year: 2017, north: 1320, center: 1780, south: 2290},
  {year: 2018, north: 1340, center: 1810, south: 2320},
  {year: 2019, north: 1360, center: 1840, south: 2350},
  {year: 2020, north: 1380, center: 1870, south: 2380},
  {year: 2021, north: 1400, center: 1900, south: 2410},
  {year: 2022, north: 1420, center: 1930, south: 2440}
];

// GDD data for specific year
const getGddDataForYear = (year: number) => {
  const yearData = gddData.find(d => d.year === year) || gddData[gddData.length - 1];
  return [
    { name: 'North', value: yearData.north },
    { name: 'Center', value: yearData.center },
    { name: 'South', value: yearData.south }
  ];
};

// Data for precipitation gradient
const precipitationGradientData = [
  {year: 2010, increase_sqm: 45, decrease_sqm: 340},
  {year: 2011, increase_sqm: 288, decrease_sqm: 113},
  {year: 2012, increase_sqm: 105, decrease_sqm: 290},
  {year: 2013, increase_sqm: 215, decrease_sqm: 182},
  {year: 2014, increase_sqm: 122, decrease_sqm: 275},
  {year: 2015, increase_sqm: 260, decrease_sqm: 138},
  {year: 2016, increase_sqm: 134, decrease_sqm: 262},
  {year: 2017, increase_sqm: 198, decrease_sqm: 203},
  {year: 2018, increase_sqm: 112, decrease_sqm: 284},
  {year: 2019, increase_sqm: 325, decrease_sqm: 73},
  {year: 2020, increase_sqm: 65, decrease_sqm: 335},
  {year: 2021, increase_sqm: 273, decrease_sqm: 122},
  {year: 2022, increase_sqm: 92, decrease_sqm: 312}
];

// Line chart data for land cover trend
const landCoverTrendData = [
  {year: 2010, forest: 32, grassland: 45, cropland: 18, barren: 5},
  {year: 2011, forest: 30, grassland: 47, cropland: 19, barren: 4},
  {year: 2012, forest: 29, grassland: 45, cropland: 21, barren: 5},
  {year: 2013, forest: 28, grassland: 44, cropland: 22, barren: 6},
  {year: 2014, forest: 26, grassland: 45, cropland: 23, barren: 6},
  {year: 2015, forest: 25, grassland: 44, cropland: 25, barren: 6},
  {year: 2016, forest: 23, grassland: 43, cropland: 27, barren: 7},
  {year: 2017, forest: 22, grassland: 42, cropland: 28, barren: 8},
  {year: 2018, forest: 21, grassland: 40, cropland: 30, barren: 9},
  {year: 2019, forest: 20, grassland: 39, cropland: 31, barren: 10},
  {year: 2020, forest: 19, grassland: 38, cropland: 32, barren: 11},
  {year: 2021, forest: 18, grassland: 37, cropland: 33, barren: 12},
  {year: 2022, forest: 17, grassland: 36, cropland: 34, barren: 13}
];

// Line chart data for precipitation trend
const precipitationTrendData = [
  {year: 2010, annual: 620, wetSeason: 520, drySeason: 100},
  {year: 2011, annual: 640, wetSeason: 530, drySeason: 110},
  {year: 2012, annual: 600, wetSeason: 500, drySeason: 100},
  {year: 2013, annual: 590, wetSeason: 480, drySeason: 110},
  {year: 2014, annual: 570, wetSeason: 470, drySeason: 100},
  {year: 2015, annual: 550, wetSeason: 450, drySeason: 100},
  {year: 2016, annual: 540, wetSeason: 440, drySeason: 100},
  {year: 2017, annual: 530, wetSeason: 430, drySeason: 100},
  {year: 2018, annual: 520, wetSeason: 420, drySeason: 100},
  {year: 2019, annual: 510, wetSeason: 410, drySeason: 100},
  {year: 2020, annual: 500, wetSeason: 400, drySeason: 100},
  {year: 2021, annual: 490, wetSeason: 390, drySeason: 100},
  {year: 2022, annual: 480, wetSeason: 380, drySeason: 100}
];

interface GradientAnalysisProps {
  year: number;
  className?: string;
}

const GradientAnalysis = ({ year, className }: GradientAnalysisProps) => {
  return (
    <div className={className}>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Environmental Gradient Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="landCover" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="landCover">Land Cover</TabsTrigger>
              <TabsTrigger value="vegetation">Vegetation</TabsTrigger>
              <TabsTrigger value="precipitation">Precipitation</TabsTrigger>
            </TabsList>
            
            {/* Land Cover Tab Content */}
            <TabsContent value="landCover" className="space-y-6">
              <Tabs defaultValue="histogram" className="w-full">
                <TabsList className="w-full grid grid-cols-2 mb-4">
                  <TabsTrigger value="histogram">Histogram</TabsTrigger>
                  <TabsTrigger value="trend">Trend Lines</TabsTrigger>
                </TabsList>
                
                <TabsContent value="histogram" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LandCoverGradientChart className="w-full" />
                    <LandCoverGradientChart 
                      className="w-full" 
                      selectedYear={year} 
                      showSingleYear={true} 
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="trend">
                  <div className="h-[400px]">
                    <ChartContainer 
                      config={{
                        forest: { label: "Forest", color: "#4ade80" },
                        grassland: { label: "Grassland", color: "#facc15" },
                        cropland: { label: "Cropland", color: "#fb923c" },
                        barren: { label: "Barren", color: "#94a3b8" }
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={landCoverTrendData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis 
                            label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} 
                          />
                          <ChartTooltip 
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <ChartTooltipContent>
                                    <div className="px-2 py-1">
                                      <div className="text-sm font-bold">Year: {label}</div>
                                      <div className="grid grid-cols-2 gap-2 mt-1">
                                        {payload.map((entry, index) => (
                                          <React.Fragment key={`tooltip-${index}`}>
                                            <div className="flex items-center">
                                              <div 
                                                className="w-3 h-3 rounded-full mr-1" 
                                                style={{ backgroundColor: entry.color }} 
                                              />
                                              <span className="text-xs">{entry.name}:</span>
                                            </div>
                                            <span className="text-xs font-medium text-right">{entry.value}%</span>
                                          </React.Fragment>
                                        ))}
                                      </div>
                                    </div>
                                  </ChartTooltipContent>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend verticalAlign="bottom" height={36} />
                          <Line type="monotone" dataKey="forest" stroke="#4ade80" activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="grassland" stroke="#facc15" />
                          <Line type="monotone" dataKey="cropland" stroke="#fb923c" />
                          <Line type="monotone" dataKey="barren" stroke="#94a3b8" />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
            
            {/* Vegetation Tab Content - Updated to show GDD data */}
            <TabsContent value="vegetation" className="space-y-6">
              <Tabs defaultValue="histogram" className="w-full">
                <TabsList className="w-full grid grid-cols-2 mb-4">
                  <TabsTrigger value="histogram">Regional Data</TabsTrigger>
                  <TabsTrigger value="trend">GDD Trends</TabsTrigger>
                </TabsList>
                
                <TabsContent value="histogram" className="space-y-6">
                  <div className="bg-muted/40 border border-border/60 rounded-lg p-4 mb-4 text-sm">
                    <h4 className="font-medium mb-2 flex items-center">
                      <ThermometerSun className="w-4 h-4 mr-2 text-orange-500" /> 
                      Growing Degree Days (GDD) Gradient
                    </h4>
                    <p>
                      Growing Degree Days (GDD) is a measure of heat accumulation used to predict plant and insect development.
                      The Sahel region exhibits a clear north-south gradient in GDD values, with lower values in the northern areas
                      and progressively higher values toward the south, affecting vegetation productivity and agricultural potential.
                    </p>
                    <div className="flex items-center justify-center mt-3 gap-6 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-blue-500" /> North: Lower GDD
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-purple-500" /> Center: Moderate GDD
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-red-500" /> South: Higher GDD
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                          GDD North-South Gradient
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[400px]">
                          <ChartContainer 
                            config={{
                              north: { label: "North", color: "#3b82f6" },
                              center: { label: "Center", color: "#8b5cf6" },
                              south: { label: "South", color: "#ef4444" }
                            }}
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                data={gddData}
                                margin={{ top: 10, right: 30, left: 20, bottom: 25 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year" />
                                <YAxis 
                                  label={{ value: 'Growing Degree Days', angle: -90, position: 'insideLeft' }} 
                                />
                                <ChartTooltip 
                                  content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                      return (
                                        <ChartTooltipContent>
                                          <div className="px-2 py-1">
                                            <div className="text-sm font-bold">Year: {label}</div>
                                            <div className="grid grid-cols-2 gap-2 mt-1">
                                              {payload.map((entry, index) => (
                                                <React.Fragment key={`tooltip-${index}`}>
                                                  <div className="flex items-center">
                                                    <div 
                                                      className="w-3 h-3 rounded-full mr-1" 
                                                      style={{ backgroundColor: entry.color }} 
                                                    />
                                                    <span className="text-xs">{entry.name}:</span>
                                                  </div>
                                                  <span className="text-xs font-medium text-right">{entry.value} GDD</span>
                                                </React.Fragment>
                                              ))}
                                            </div>
                                          </div>
                                        </ChartTooltipContent>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                                <Area type="monotone" dataKey="north" stackId="1" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.6} />
                                <Area type="monotone" dataKey="center" stackId="2" fill="#8b5cf6" stroke="#8b5cf6" fillOpacity={0.6} />
                                <Area type="monotone" dataKey="south" stackId="3" fill="#ef4444" stroke="#ef4444" fillOpacity={0.6} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <ThermometerSun className="w-5 h-5 mr-2 text-orange-500" />
                          Regional GDD ({year})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[400px]">
                          <ChartContainer 
                            config={{
                              value: { label: "GDD", color: "#f97316" }
                            }}
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={getGddDataForYear(year)}
                                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                                barSize={80}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis 
                                  label={{ value: 'Growing Degree Days', angle: -90, position: 'insideLeft' }} 
                                />
                                <ChartTooltip 
                                  content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                      return (
                                        <ChartTooltipContent>
                                          <div className="px-2 py-1">
                                            <div className="text-sm font-bold">{label} Region</div>
                                            <div className="flex items-center justify-between gap-3 mt-1">
                                              <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-orange-500 mr-1" />
                                                <span className="text-xs">GDD:</span>
                                              </div>
                                              <span className="text-xs font-medium">{payload[0]?.value} GDD</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                              {label === 'North' ? 'Lowest heat accumulation, limiting vegetation growth' : 
                                               label === 'Center' ? 'Moderate heat accumulation, suitable for some crops' : 
                                               'Highest heat accumulation, supporting more diverse vegetation'}
                                            </div>
                                          </div>
                                        </ChartTooltipContent>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Bar 
                                  dataKey="value" 
                                  fill="#f97316" 
                                  background={{ fill: '#f5f5f5' }}
                                  label={{ 
                                    position: 'top', 
                                    formatter: (value: number) => `${value} GDD` 
                                  }}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="trend">
                  <div className="h-[400px]">
                    <div className="bg-muted/40 border border-border/60 rounded-lg p-4 mb-4 text-sm">
                      <h4 className="font-medium mb-1">GDD Trends and Implications</h4>
                      <p>
                        Growing Degree Days (GDD) show a consistent north-south gradient, with a gradual increase from northern to southern regions.
                        This gradient affects vegetation types, crop selection, and growing season length across the Sahel region.
                      </p>
                    </div>
                    <ChartContainer 
                      config={{
                        north: { label: "North", color: "#3b82f6" },
                        center: { label: "Center", color: "#8b5cf6" },
                        south: { label: "South", color: "#ef4444" }
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={gddData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis 
                            label={{ value: 'Growing Degree Days', angle: -90, position: 'insideLeft' }} 
                            domain={[1000, 2500]}
                          />
                          <ChartTooltip 
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <ChartTooltipContent>
                                    <div className="px-2 py-1">
                                      <div className="text-sm font-bold">Year: {label}</div>
                                      <div className="grid grid-cols-2 gap-2 mt-1">
                                        {payload.map((entry, index) => (
                                          <React.Fragment key={`tooltip-${index}`}>
                                            <div className="flex items-center">
                                              <div 
                                                className="w-3 h-3 rounded-full mr-1" 
                                                style={{ backgroundColor: entry.color }} 
                                              />
                                              <span className="text-xs">{entry.name}:</span>
                                            </div>
                                            <span className="text-xs font-medium text-right">{entry.value} GDD</span>
                                          </React.Fragment>
                                        ))}
                                      </div>
                                    </div>
                                  </ChartTooltipContent>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend verticalAlign="bottom" height={36} />
                          <Line type="monotone" dataKey="north" stroke="#3b82f6" activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="center" stroke="#8b5cf6" />
                          <Line type="monotone" dataKey="south" stroke="#ef4444" />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
            
            {/* Precipitation Tab Content */}
            <TabsContent value="precipitation" className="space-y-6">
              <Tabs defaultValue="histogram" className="w-full">
                <TabsList className="w-full grid grid-cols-2 mb-4">
                  <TabsTrigger value="histogram">Histogram</TabsTrigger>
                  <TabsTrigger value="trend">Trend Lines</TabsTrigger>
                </TabsList>
                
                <TabsContent value="histogram" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Precipitation Gradient (2010-2022)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[400px]">
                          <ChartContainer 
                            config={{
                              increase: { label: "Increase", color: "#60a5fa" },
                              decrease: { label: "Decrease", color: "#f87171" }
                            }}
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={precipitationGradientData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                                barSize={20}
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
                                <Bar dataKey="increase_sqm" name="Increase" fill="#60a5fa" />
                                <Bar dataKey="decrease_sqm" name="Decrease" fill="#f87171" />
                              </BarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Precipitation Gradient ({year})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[400px]">
                          <ChartContainer 
                            config={{
                              increase: { label: "Increase", color: "#60a5fa" },
                              decrease: { label: "Decrease", color: "#f87171" }
                            }}
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={precipitationGradientData.filter(item => item.year === year)}
                                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                                barSize={80}
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
                                <Bar dataKey="increase_sqm" name="Increase" fill="#60a5fa" />
                                <Bar dataKey="decrease_sqm" name="Decrease" fill="#f87171" />
                              </BarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="trend">
                  <div className="h-[400px]">
                    <ChartContainer 
                      config={{
                        annual: { label: "Annual", color: "#60a5fa" },
                        wetSeason: { label: "Wet Season", color: "#3b82f6" },
                        drySeason: { label: "Dry Season", color: "#f59e0b" }
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={precipitationTrendData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis 
                            label={{ value: 'Precipitation (mm)', angle: -90, position: 'insideLeft' }} 
                          />
                          <ChartTooltip 
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <ChartTooltipContent>
                                    <div className="px-2 py-1">
                                      <div className="text-sm font-bold">Year: {label}</div>
                                      <div className="grid grid-cols-2 gap-2 mt-1">
                                        {payload.map((entry, index) => (
                                          <React.Fragment key={`tooltip-${index}`}>
                                            <div className="flex items-center">
                                              <div 
                                                className="w-3 h-3 rounded-full mr-1" 
                                                style={{ backgroundColor: entry.color }} 
                                              />
                                              <span className="text-xs">{entry.name}:</span>
                                            </div>
                                            <span className="text-xs font-medium text-right">{entry.value} mm</span>
                                          </React.Fragment>
                                        ))}
                                      </div>
                                    </div>
                                  </ChartTooltipContent>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend verticalAlign="bottom" height={36} />
                          <Line type="monotone" dataKey="annual" stroke="#60a5fa" activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="wetSeason" stroke="#3b82f6" />
                          <Line type="monotone" dataKey="drySeason" stroke="#f59e0b" />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Add the new comparison section */}
      <GradientComparison year={year} className="mb-8" />
    </div>
  );
};

export default GradientAnalysis;
