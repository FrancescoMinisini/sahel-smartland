
import { useState } from 'react';
import MapVisualization from '@/components/MapVisualization';
import YearSlider from '@/components/YearSlider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Calendar, 
  ChevronRight, 
  Cloud, 
  Home, 
  LineChart, 
  Download,
  Droplets,
  Eye,
  FileBarChart,
  FileLine,
  FileSpreadsheet,
  Fullscreen,
  Leaf,
  User,
} from 'lucide-react';
import { getPrecipitationTimeSeriesData, getVegetationTimeSeriesData, getPopulationTimeSeriesData } from '@/lib/geospatialUtils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart as RechartsBarChart, CartesianGrid, Cell, Legend, Line, LineChart as RechartsLineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PopulationInsightsCharts from '@/components/PopulationInsightsCharts';

const TemporalAnalysis = () => {
  const [year, setYear] = useState(2020);
  const [activeMapType, setActiveMapType] = useState<'landCover' | 'precipitation' | 'vegetation' | 'population'>('landCover');
  const [stats, setStats] = useState<Record<string, number>>({});
  
  const handleYearChange = (newYear: number) => {
    setYear(newYear);
  };
  
  const handleStatsChange = (newStats: Record<string, number>) => {
    setStats(newStats);
  };

  // Data for visualization
  const precipitationData = getPrecipitationTimeSeriesData();
  const vegetationData = getVegetationTimeSeriesData();
  const populationData = getPopulationTimeSeriesData().filter(d => d.year >= 2010 && d.year <= 2023);
  
  // Adjusted data for 'Annual Rainfall' graph
  const annualRainfallData = precipitationData.map(year => ({
    year: year.year,
    Annual: year.Annual,
    'Wet Season': year['Wet Season'],
    'Dry Season': year['Dry Season']
  }));
  
  // Data for 'Land Cover' pie chart
  const getLandCoverPieData = () => {
    const landCoverCategories = {
      'Forests': stats['7'] || 0,
      'Shrublands': stats['8'] || 0,
      'Savannas': stats['9'] || 0,
      'Grasslands': stats['10'] || 0,
      'Wetlands': stats['11'] || 0,
      'Croplands': stats['12'] || 0,
      'Urban': stats['13'] || 0,
      'Barren': stats['16'] || 0,
    };
    
    return Object.entries(landCoverCategories)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  };
  
  // Colors for land cover pie chart
  const LAND_COVER_COLORS = [
    '#1a9850', // Forests
    '#91cf60', // Shrublands
    '#d9ef8b', // Savannas
    '#fee08b', // Grasslands
    '#66c2a5', // Wetlands
    '#fc8d59', // Croplands
    '#d73027', // Urban
    '#bababa', // Barren
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Temporal Analysis</h1>
      
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-3/4">
          <Card className="h-[600px]">
            <CardContent className="p-4 h-full">
              <MapVisualization 
                year={year} 
                onStatsChange={handleStatsChange}
                dataType={activeMapType}
                className="h-full"
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full md:w-1/4 flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Year Control</CardTitle>
              <CardDescription>
                Slide to change the visualization year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <YearSlider 
                year={year}
                onYearChange={handleYearChange}
                min={2010}
                max={2023}
              />
              <div className="flex justify-center items-center text-xs mt-2">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                <span>Selected Year: <strong>{year}</strong></span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Data Layers</CardTitle>
              <CardDescription>
                Choose what data to display on the map
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant={activeMapType === 'landCover' ? 'default' : 'outline'} 
                className="w-full justify-start h-auto py-2"
                onClick={() => setActiveMapType('landCover')}
              >
                <Leaf className="mr-2 h-4 w-4" />
                Land Cover
              </Button>
              <Button 
                variant={activeMapType === 'vegetation' ? 'default' : 'outline'} 
                className="w-full justify-start h-auto py-2"
                onClick={() => setActiveMapType('vegetation')}
              >
                <LineChart className="mr-2 h-4 w-4" />
                Vegetation
              </Button>
              <Button 
                variant={activeMapType === 'precipitation' ? 'default' : 'outline'} 
                className="w-full justify-start h-auto py-2"
                onClick={() => setActiveMapType('precipitation')}
              >
                <Cloud className="mr-2 h-4 w-4" />
                Precipitation
              </Button>
              <Button 
                variant={activeMapType === 'population' ? 'default' : 'outline'} 
                className="w-full justify-start h-auto py-2"
                onClick={() => setActiveMapType('population')}
              >
                <User className="mr-2 h-4 w-4" />
                Population
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Statistics</CardTitle>
              <CardDescription>
                Key metrics for {year}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeMapType === 'landCover' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Major Land Cover:</span>
                    <span className="font-medium text-sm">
                      {
                        Object.entries(stats)
                          .filter(([key]) => key !== '0') // Filter out the 'No Data' class
                          .sort((a, b) => b[1] - a[1])[0]?.[0] === '7' ? 'Forests' :
                          Object.entries(stats)
                          .filter(([key]) => key !== '0') // Filter out the 'No Data' class
                          .sort((a, b) => b[1] - a[1])[0]?.[0] === '8' ? 'Shrublands' :
                          Object.entries(stats)
                          .filter(([key]) => key !== '0') // Filter out the 'No Data' class
                          .sort((a, b) => b[1] - a[1])[0]?.[0] === '9' ? 'Savannas' :
                          Object.entries(stats)
                          .filter(([key]) => key !== '0') // Filter out the 'No Data' class
                          .sort((a, b) => b[1] - a[1])[0]?.[0] === '10' ? 'Grasslands' :
                          Object.entries(stats)
                          .filter(([key]) => key !== '0') // Filter out the 'No Data' class
                          .sort((a, b) => b[1] - a[1])[0]?.[0] === '11' ? 'Wetlands' :
                          Object.entries(stats)
                          .filter(([key]) => key !== '0') // Filter out the 'No Data' class
                          .sort((a, b) => b[1] - a[1])[0]?.[0] === '12' ? 'Croplands' :
                          Object.entries(stats)
                          .filter(([key]) => key !== '0') // Filter out the 'No Data' class
                          .sort((a, b) => b[1] - a[1])[0]?.[0] === '13' ? 'Urban' :
                          Object.entries(stats)
                          .filter(([key]) => key !== '0') // Filter out the 'No Data' class
                          .sort((a, b) => b[1] - a[1])[0]?.[0] === '14' ? 'Cropland/Natural' :
                          Object.entries(stats)
                          .filter(([key]) => key !== '0') // Filter out the 'No Data' class
                          .sort((a, b) => b[1] - a[1])[0]?.[0] === '16' ? 'Barren' : 'Unknown'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Cropland Area:</span>
                    <span className="font-medium text-sm">{stats['12'] || 0} px</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Forest Area:</span>
                    <span className="font-medium text-sm">{stats['7'] || 0} px</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Urban Area:</span>
                    <span className="font-medium text-sm">{stats['13'] || 0} px</span>
                  </div>
                </div>
              )}
              
              {activeMapType === 'precipitation' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Average Rainfall:</span>
                    <span className="font-medium text-sm">{stats.average ? Math.round(stats.average) : 0} mm</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Maximum Rainfall:</span>
                    <span className="font-medium text-sm">{stats.max ? Math.round(stats.max) : 0} mm</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Minimum Rainfall:</span>
                    <span className="font-medium text-sm">{stats.min ? Math.round(stats.min) : 0} mm</span>
                  </div>
                </div>
              )}
              
              {activeMapType === 'vegetation' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Average GPP:</span>
                    <span className="font-medium text-sm">{stats.average ? Math.round(stats.average) : 0} gC/m²/yr</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Maximum GPP:</span>
                    <span className="font-medium text-sm">{stats.max ? Math.round(stats.max) : 0} gC/m²/yr</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Forest GPP:</span>
                    <span className="font-medium text-sm">{stats.forestGPP ? Math.round(stats.forestGPP) : 0} gC/m²/yr</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Cropland GPP:</span>
                    <span className="font-medium text-sm">{stats.croplandGPP ? Math.round(stats.croplandGPP) : 0} gC/m²/yr</span>
                  </div>
                </div>
              )}
              
              {activeMapType === 'population' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Total Population:</span>
                    <span className="font-medium text-sm">{stats.totalPopulation?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Population Density:</span>
                    <span className="font-medium text-sm">{stats.averageDensity ? stats.averageDensity.toFixed(1) : '0'} /km²</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Urban Population:</span>
                    <span className="font-medium text-sm">{stats.urbanPopulation?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Rural Population:</span>
                    <span className="font-medium text-sm">{stats.ruralPopulation?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="climate">Climate Analysis</TabsTrigger>
          <TabsTrigger value="vegetation">Vegetation Analysis</TabsTrigger>
          <TabsTrigger value="population">Population Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Droplets className="mr-2 h-5 w-5 text-blue-500" />
                  Annual Rainfall
                </CardTitle>
                <CardDescription>
                  Precipitation trends over time (2010-2023)
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 pt-0">
                <ChartContainer
                  config={{
                    annual: { label: 'Annual' },
                    wet: { label: 'Wet Season' },
                    dry: { label: 'Dry Season' },
                  }}
                >
                  <BarChart
                    data={annualRainfallData}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="year" />
                    <YAxis
                      label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Annual" name="annual" fill="#0ea5e9" />
                    <Bar dataKey="Wet Season" name="wet" fill="#38bdf8" />
                    <Bar dataKey="Dry Season" name="dry" fill="#7dd3fc" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="mr-2 h-5 w-5 text-green-600" />
                  Land Cover Distribution
                </CardTitle>
                <CardDescription>
                  Land cover proportions for {year}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 pt-4">
                <div className="h-full flex flex-col items-center justify-center">
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={getLandCoverPieData()}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {getLandCoverPieData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={LAND_COVER_COLORS[index % LAND_COVER_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="text-center text-sm mt-4">
                    <p>
                      Primary land cover: <span className="font-medium">
                        {
                          Object.entries(stats)
                            .filter(([key]) => key !== '0') // Filter out the 'No Data' class
                            .sort((a, b) => b[1] - a[1])[0]?.[0] === '7' ? 'Forests' :
                            Object.entries(stats)
                            .filter(([key]) => key !== '0') // Filter out the 'No Data' class
                            .sort((a, b) => b[1] - a[1])[0]?.[0] === '8' ? 'Shrublands' :
                            Object.entries(stats)
                            .filter(([key]) => key !== '0') // Filter out the 'No Data' class
                            .sort((a, b) => b[1] - a[1])[0]?.[0] === '9' ? 'Savannas' :
                            Object.entries(stats)
                            .filter(([key]) => key !== '0') // Filter out the 'No Data' class
                            .sort((a, b) => b[1] - a[1])[0]?.[0] === '10' ? 'Grasslands' :
                            Object.entries(stats)
                            .filter(([key]) => key !== '0') // Filter out the 'No Data' class
                            .sort((a, b) => b[1] - a[1])[0]?.[0] === '11' ? 'Wetlands' :
                            Object.entries(stats)
                            .filter(([key]) => key !== '0') // Filter out the 'No Data' class
                            .sort((a, b) => b[1] - a[1])[0]?.[0] === '12' ? 'Croplands' :
                            Object.entries(stats)
                            .filter(([key]) => key !== '0') // Filter out the 'No Data' class
                            .sort((a, b) => b[1] - a[1])[0]?.[0] === '13' ? 'Urban' :
                            Object.entries(stats)
                            .filter(([key]) => key !== '0') // Filter out the 'No Data' class
                            .sort((a, b) => b[1] - a[1])[0]?.[0] === '14' ? 'Cropland/Natural' :
                            Object.entries(stats)
                            .filter(([key]) => key !== '0') // Filter out the 'No Data' class
                            .sort((a, b) => b[1] - a[1])[0]?.[0] === '16' ? 'Barren' : 'Unknown'
                        }
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="mr-2 h-5 w-5 text-green-600" />
                  Vegetation Productivity
                </CardTitle>
                <CardDescription>
                  Gross Primary Production trends over time (2010-2023)
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 pt-0">
                <ChartContainer
                  config={{
                    total: { label: 'Total' },
                    forest: { label: 'Forest' },
                    grassland: { label: 'Grassland' },
                    cropland: { label: 'Cropland' },
                  }}
                >
                  <LineChart
                    data={vegetationData}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="year" />
                    <YAxis
                      label={{ value: 'GPP (gC/m²/year)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Total" name="total" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="Forest" name="forest" stroke="#059669" strokeWidth={2} />
                    <Line type="monotone" dataKey="Grassland" name="grassland" stroke="#84cc16" strokeWidth={2} />
                    <Line type="monotone" dataKey="Cropland" name="cropland" stroke="#ca8a04" strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-blue-600" />
                  Population Growth
                </CardTitle>
                <CardDescription>
                  Population trends over time (2010-2023)
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 pt-0">
                <ChartContainer
                  config={{
                    total: { label: 'Total Population' },
                    urban: { label: 'Urban Population' },
                    rural: { label: 'Rural Population' },
                  }}
                >
                  <BarChart
                    data={populationData}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="year" />
                    <YAxis
                      label={{ value: 'Population', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Total Population" name="total" fill="#6366f1" />
                    <Bar dataKey="Urban Population" name="urban" fill="#818cf8" />
                    <Bar dataKey="Rural Population" name="rural" fill="#a5b4fc" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="climate">
          <div className="p-6 mt-6 bg-card border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Cloud className="mr-2 h-6 w-6 text-blue-500" />
              Climate Analysis
            </h2>
            <p className="text-muted-foreground mb-6">
              Detailed analysis of precipitation patterns and climate trends in the region.
            </p>
            
            {/* Climate charts would go here */}
            <div className="text-center p-8 border-2 border-dashed rounded-lg">
              <FileBarChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Climate Analysis Charts</h3>
              <p className="text-muted-foreground mb-4">Climate analysis dashboard would display here.</p>
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                View Climate Dashboard
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="vegetation">
          <div className="p-6 mt-6 bg-card border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Leaf className="mr-2 h-6 w-6 text-green-600" />
              Vegetation Analysis
            </h2>
            <p className="text-muted-foreground mb-6">
              Detailed analysis of vegetation productivity and land cover changes over time.
            </p>
            
            {/* Vegetation charts would go here */}
            <div className="text-center p-8 border-2 border-dashed rounded-lg">
              <FileLine className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Vegetation Analysis Charts</h3>
              <p className="text-muted-foreground mb-4">Vegetation analysis dashboard would display here.</p>
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                View Vegetation Dashboard
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="population">
          <div className="mt-6 bg-card border rounded-lg">
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <User className="mr-2 h-6 w-6 text-indigo-600" />
                Population Analysis
              </h2>
              <p className="text-muted-foreground mb-6">
                Detailed analysis of population distribution, growth trends, and demographic patterns in the Assaba region.
              </p>
            </div>
            
            <PopulationInsightsCharts year={year} className="px-6 pb-6" />
            
            <div className="p-6 border-t">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Population Data Exports</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TemporalAnalysis;
