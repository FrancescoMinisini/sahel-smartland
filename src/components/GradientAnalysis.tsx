
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
  ResponsiveContainer 
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

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

// Line chart data for vegetation trend
const vegetationTrendData = [
  {year: 2010, forest: 1850, grassland: 1100, cropland: 750, barren: 250},
  {year: 2011, forest: 1820, grassland: 1150, cropland: 780, barren: 240},
  {year: 2012, forest: 1790, grassland: 1120, cropland: 810, barren: 260},
  {year: 2013, forest: 1750, grassland: 1080, cropland: 840, barren: 270},
  {year: 2014, forest: 1720, grassland: 1050, cropland: 870, barren: 290},
  {year: 2015, forest: 1680, grassland: 1020, cropland: 900, barren: 310},
  {year: 2016, forest: 1650, grassland: 990, cropland: 930, barren: 330},
  {year: 2017, forest: 1610, grassland: 970, cropland: 960, barren: 350},
  {year: 2018, forest: 1580, grassland: 950, cropland: 990, barren: 370},
  {year: 2019, forest: 1550, grassland: 930, cropland: 1020, barren: 390},
  {year: 2020, forest: 1520, grassland: 910, cropland: 1050, barren: 410},
  {year: 2021, forest: 1490, grassland: 890, cropland: 1080, barren: 430},
  {year: 2022, forest: 1460, grassland: 870, cropland: 1110, barren: 450}
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
            
            {/* Vegetation Tab Content */}
            <TabsContent value="vegetation" className="space-y-6">
              <Tabs defaultValue="histogram" className="w-full">
                <TabsList className="w-full grid grid-cols-2 mb-4">
                  <TabsTrigger value="histogram">Histogram</TabsTrigger>
                  <TabsTrigger value="trend">Trend Lines</TabsTrigger>
                </TabsList>
                
                <TabsContent value="histogram" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Vegetation Gradient (2010-2022)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[400px]">
                          <ChartContainer 
                            config={{
                              improvement: { label: "Improvement", color: "#4ade80" },
                              deterioration: { label: "Deterioration", color: "#f87171" }
                            }}
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={vegetationGradientData}
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
                                                <div className="w-3 h-3 rounded-full bg-green-400 mr-1" />
                                                <span className="text-xs">Improvement:</span>
                                              </div>
                                              <span className="text-xs font-medium text-right">{payload[0]?.value} km²</span>
                                              
                                              <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-red-400 mr-1" />
                                                <span className="text-xs">Deterioration:</span>
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
                                <Bar dataKey="improvement_sqm" name="Improvement" fill="#4ade80" />
                                <Bar dataKey="deterioration_sqm" name="Deterioration" fill="#f87171" />
                              </BarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Vegetation Gradient ({year})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[400px]">
                          <ChartContainer 
                            config={{
                              improvement: { label: "Improvement", color: "#4ade80" },
                              deterioration: { label: "Deterioration", color: "#f87171" }
                            }}
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={vegetationGradientData.filter(item => item.year === year)}
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
                                                <div className="w-3 h-3 rounded-full bg-green-400 mr-1" />
                                                <span className="text-xs">Improvement:</span>
                                              </div>
                                              <span className="text-xs font-medium text-right">{payload[0]?.value} km²</span>
                                              
                                              <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-red-400 mr-1" />
                                                <span className="text-xs">Deterioration:</span>
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
                                <Bar dataKey="improvement_sqm" name="Improvement" fill="#4ade80" />
                                <Bar dataKey="deterioration_sqm" name="Deterioration" fill="#f87171" />
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
                        forest: { label: "Forest", color: "#4ade80" },
                        grassland: { label: "Grassland", color: "#facc15" },
                        cropland: { label: "Cropland", color: "#fb923c" },
                        barren: { label: "Barren", color: "#94a3b8" }
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={vegetationTrendData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis 
                            label={{ value: 'GPP (gC/m²/year)', angle: -90, position: 'insideLeft' }} 
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
                                            <span className="text-xs font-medium text-right">{entry.value} gC/m²/year</span>
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
