
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, CalendarDays, TrendingUp, BarChart3, Cloud, MapPin, User } from 'lucide-react';
import YearSlider from '@/components/YearSlider';
import MapVisualization from '@/components/MapVisualization';
import { Separator } from '@/components/ui/separator';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { getPrecipitationTimeSeriesData, getLandCoverTimeSeriesData, getVegetationTimeSeriesData, getAvailableYears } from '@/lib/geospatialUtils';
import PopulationInsightsCharts from '@/components/PopulationInsightsCharts';

const TemporalAnalysis = () => {
  const [year, setYear] = useState(2020);
  const [activeDataType, setActiveDataType] = useState<'landCover' | 'precipitation' | 'vegetation' | 'population'>('landCover');
  const [stats, setStats] = useState<Record<string, number>>({});
  const [precipitationData, setPrecipitationData] = useState<any[]>([]);
  const [landCoverData, setLandCoverData] = useState<any[]>([]);
  const [vegetationData, setVegetationData] = useState<any[]>([]);
  
  // Load time series data
  useEffect(() => {
    const loadData = async () => {
      // Load precipitation data
      const precipData = getPrecipitationTimeSeriesData();
      setPrecipitationData(precipData);
      
      // Load land cover data
      const lcData = await getLandCoverTimeSeriesData();
      setLandCoverData(lcData);
      
      // Load vegetation data
      const vegData = getVegetationTimeSeriesData();
      setVegetationData(vegData);
    };
    
    loadData();
  }, []);
  
  const handleYearChange = (newYear: number) => {
    setYear(newYear);
  };
  
  const handleTabChange = (value: string) => {
    switch (value) {
      case 'land-cover':
        setActiveDataType('landCover');
        break;
      case 'precipitation':
        setActiveDataType('precipitation');
        break;
      case 'vegetation':
        setActiveDataType('vegetation');
        break;
      case 'population':
        setActiveDataType('population');
        break;
      default:
        setActiveDataType('landCover');
    }
  };
  
  const handleStatsChange = (newStats: Record<string, number>) => {
    setStats(newStats);
  };
  
  // Format statistics for display based on data type
  const getFormattedStats = () => {
    if (activeDataType === 'landCover') {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 text-xs">
          {Object.entries(stats)
            .filter(([key]) => key !== '0' && key !== '15') // Filter out 'No Data' and 'Snow and Ice'
            .sort(([, a], [, b]) => b - a) // Sort by value (highest first)
            .map(([key, value]) => {
              const landCoverClass = {
                '7': 'Forests',
                '8': 'Shrublands',
                '9': 'Savannas',
                '10': 'Grasslands',
                '11': 'Wetlands',
                '12': 'Croplands',
                '13': 'Urban',
                '14': 'Cropland/Natural Mosaic',
                '16': 'Barren',
              }[key] || key;
              
              return (
                <Card key={key} className={`overflow-hidden ${parseInt(key) === 16 ? 'col-span-2' : ''}`}>
                  <CardContent className="p-2">
                    <div className="font-medium mb-1 truncate">{landCoverClass}</div>
                    <div className="text-xs text-muted-foreground">{value.toLocaleString()} pixels</div>
                    <div className="mt-1.5 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          key === '7' ? 'bg-green-600' : 
                          key === '8' ? 'bg-green-400' :
                          key === '9' ? 'bg-yellow-400' :
                          key === '10' ? 'bg-yellow-300' :
                          key === '11' ? 'bg-teal-400' :
                          key === '12' ? 'bg-orange-500' :
                          key === '13' ? 'bg-red-600' :
                          key === '14' ? 'bg-orange-300' :
                          key === '16' ? 'bg-gray-400' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, (value / 200000) * 100)}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      );
    } else if (activeDataType === 'precipitation') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.average?.toFixed(1) || 0} <span className="text-xs font-normal">mm</span></div>
              <p className="text-xs text-muted-foreground">Average Precipitation</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.min?.toFixed(1) || 0} <span className="text-xs font-normal">mm</span></div>
              <p className="text-xs text-muted-foreground">Minimum Value</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.max?.toFixed(1) || 0} <span className="text-xs font-normal">mm</span></div>
              <p className="text-xs text-muted-foreground">Maximum Value</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{((stats.total || 0) / 1000).toFixed(1)} <span className="text-xs font-normal">km³</span></div>
              <p className="text-xs text-muted-foreground">Total Water Volume (est.)</p>
            </CardContent>
          </Card>
        </div>
      );
    } else if (activeDataType === 'vegetation') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.average?.toFixed(1) || 0}</div>
              <p className="text-xs text-muted-foreground">Average GPP (gC/m²/year)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.min?.toFixed(1) || 0}</div>
              <p className="text-xs text-muted-foreground">Minimum GPP</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.max?.toFixed(1) || 0}</div>
              <p className="text-xs text-muted-foreground">Maximum GPP</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{((stats.total || 0) / 1000000).toFixed(1)} <span className="text-xs font-normal">Mt</span></div>
              <p className="text-xs text-muted-foreground">Total Carbon Sequestration</p>
            </CardContent>
          </Card>
        </div>
      );
    } else if (activeDataType === 'population') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{(stats.totalPopulation || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total Population</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{(stats.averageDensity || 0).toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Avg Density (people/km²)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{((stats.urbanPopulation || 0) / (stats.totalPopulation || 1) * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Urban Population</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{(stats.populationGrowthRate || 0).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Annual Growth Rate</p>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="container py-6 max-w-screen-2xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Temporal Analysis</h1>
        <p className="text-muted-foreground">
          Analyze changes and trends across time periods using satellite imagery and derived environmental indices.
        </p>
      </div>
      
      <div className="mt-6">
        <Tabs defaultValue="land-cover" onValueChange={handleTabChange}>
          <div className="flex justify-between items-center mb-4">
            <TabsList className="grid sm:w-auto grid-cols-2 sm:grid-cols-4 sm:inline-grid">
              <TabsTrigger value="land-cover" className="flex items-center gap-1.5">
                <MapPin size={14} />
                <span className="hidden sm:inline">Land Cover</span>
                <span className="sm:hidden">Land</span>
              </TabsTrigger>
              <TabsTrigger value="precipitation" className="flex items-center gap-1.5">
                <Cloud size={14} />
                <span className="hidden sm:inline">Precipitation</span>
                <span className="sm:hidden">Rain</span>
              </TabsTrigger>
              <TabsTrigger value="vegetation" className="flex items-center gap-1.5">
                <TrendingUp size={14} />
                <span>Vegetation</span>
              </TabsTrigger>
              <TabsTrigger value="population" className="flex items-center gap-1.5">
                <User size={14} />
                <span>Population</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="hidden md:flex items-center gap-2">
              <CalendarDays size={16} className="text-muted-foreground" />
              <YearSlider 
                initialValue={year}
                onChange={handleYearChange}
                min={2010}
                max={2023}
                step={1}
              />
            </div>
          </div>
          
          <div className="md:hidden mb-4">
            <YearSlider 
              initialValue={year}
              onChange={handleYearChange}
              min={2010}
              max={2023}
              step={1}
            />
          </div>
          
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 aspect-[4/3] md:aspect-[16/9] lg:aspect-[2/1] rounded-lg overflow-hidden">
                  <MapVisualization 
                    year={year} 
                    dataType={activeDataType}
                    onStatsChange={handleStatsChange}
                    className="h-full w-full border"
                  />
                </div>
                
                <div className="flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      {activeDataType === 'landCover' && 'Land Cover Distribution'}
                      {activeDataType === 'precipitation' && 'Precipitation Analysis'}
                      {activeDataType === 'vegetation' && 'Vegetation Productivity'}
                      {activeDataType === 'population' && 'Population Statistics'}
                      {' '}
                      for {year}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {activeDataType === 'landCover' && 'Distribution of different land cover classes in the region based on MODIS satellite data.'}
                      {activeDataType === 'precipitation' && 'Analysis of annual precipitation patterns based on satellite-derived rainfall estimates.'}
                      {activeDataType === 'vegetation' && 'Measurement of vegetation productivity using Gross Primary Production (GPP) from MODIS.'}
                      {activeDataType === 'population' && 'Population density and demographics based on gridded population data.'}
                    </p>
                    
                    {getFormattedStats()}
                  </div>
                  
                  <div className="flex items-center justify-start gap-2 text-xs text-muted-foreground mt-3">
                    <Info size={14} /> 
                    {activeDataType === 'landCover' && 'Data source: MODIS Land Cover Type yearly product (MCD12Q1)'}
                    {activeDataType === 'precipitation' && 'Data source: CHIRPS rainfall estimates, 5km resolution'}
                    {activeDataType === 'vegetation' && 'Data source: MODIS GPP 8-day composite (MOD17A2H)'}
                    {activeDataType === 'population' && 'Data source: WorldPop gridded population estimates'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <TabsContent value="land-cover" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Land Cover Change Analysis</CardTitle>
                <CardDescription>
                  Historical trends of land cover changes from 2010 to 2023
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={landCoverData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="Forests" stackId="1" stroke="#1a9850" fill="#1a9850" />
                      <Area type="monotone" dataKey="Shrublands" stackId="1" stroke="#91cf60" fill="#91cf60" />
                      <Area type="monotone" dataKey="Savannas" stackId="1" stroke="#d9ef8b" fill="#d9ef8b" />
                      <Area type="monotone" dataKey="Grasslands" stackId="1" stroke="#fee08b" fill="#fee08b" />
                      <Area type="monotone" dataKey="Croplands" stackId="1" stroke="#fc8d59" fill="#fc8d59" />
                      <Area type="monotone" dataKey="Barren" stackId="1" stroke="#bdbdbd" fill="#bdbdbd" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Insights:</h4>
                    <ul className="text-sm space-y-1.5 list-disc list-inside text-muted-foreground">
                      <li>Forests have declined by approximately 37% since 2010</li>
                      <li>Grasslands show relatively stable trends with seasonal variations</li>
                      <li>Cropland area has marginally increased, indicating agricultural expansion</li>
                      <li>Barren land has expanded, potentially indicating desertification</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Implications:</h4>
                    <ul className="text-sm space-y-1.5 list-disc list-inside text-muted-foreground">
                      <li>Decreased forest coverage may impact biodiversity and ecosystem services</li>
                      <li>Agricultural expansion shows adaptation to changing climate patterns</li>
                      <li>Increasing barren land signals potential land degradation concerns</li>
                      <li>Grassland stability provides resilience to local pastoral communities</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Additional Land Cover Analysis Content */}
          </TabsContent>
          
          <TabsContent value="precipitation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Precipitation Trends</CardTitle>
                <CardDescription>
                  Annual and seasonal rainfall patterns from 2010 to 2023
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={precipitationData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Annual" stroke="#4575b4" strokeWidth={2} name="Annual Rainfall" />
                      <Line type="monotone" dataKey="Wet Season" stroke="#74add1" strokeWidth={2} name="Wet Season" />
                      <Line type="monotone" dataKey="Dry Season" stroke="#f46d43" strokeWidth={2} name="Dry Season" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Key Trends:</h4>
                    <ul className="text-sm space-y-1.5 list-disc list-inside text-muted-foreground">
                      <li>Annual precipitation has declined by approximately 20% since 2010</li>
                      <li>Wet season rainfall shows a more significant reduction than dry season</li>
                      <li>Increased variability in year-to-year precipitation since 2015</li>
                      <li>Potential shift in the timing of rainfall across seasons</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Extreme Events:</h4>
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={precipitationData}
                          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="Extreme Events" fill="#d73027" name="Extreme Weather Events" />
                          <Bar dataKey="Water Stress Index" fill="#fee090" name="Water Stress Index" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="vegetation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vegetation Productivity Trends</CardTitle>
                <CardDescription>
                  Analysis of Gross Primary Productivity (GPP) by land cover type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={vegetationData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Forest" stroke="#1a9850" strokeWidth={2} />
                      <Line type="monotone" dataKey="Grassland" stroke="#fee08b" strokeWidth={2} />
                      <Line type="monotone" dataKey="Cropland" stroke="#fc8d59" strokeWidth={2} />
                      <Line type="monotone" dataKey="Shrubland" stroke="#d9ef8b" strokeWidth={2} />
                      <Line type="monotone" dataKey="Total" stroke="#66c2a5" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Productivity Analysis:</h4>
                    <ul className="text-sm space-y-1.5 list-disc list-inside text-muted-foreground">
                      <li>Forests show highest productivity with 15-20% decline since 2010</li>
                      <li>Grassland productivity shows resilience to climate changes</li>
                      <li>Cropland productivity has increased due to agricultural practices</li>
                      <li>Overall vegetation productivity has moderate interannual variations</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Annual Change:</h4>
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={vegetationData}
                          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis domain={[-4, 4]} />
                          <Tooltip />
                          <Legend />
                          <Bar 
                            dataKey="AnnualChange" 
                            fill={(data) => (data > 0 ? "#4CAF50" : "#F44336")} 
                            name="Annual Productivity Change (%)" 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="population" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Population Analysis</CardTitle>
                <CardDescription>
                  Demographic trends, distribution patterns, and environmental correlations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PopulationInsightsCharts />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TemporalAnalysis;
