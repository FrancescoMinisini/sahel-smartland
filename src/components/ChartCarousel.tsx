import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart, LineChart, Line, ComposedChart, Scatter } from 'recharts';
import { cn } from "@/lib/utils";

interface ChartCarouselProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
    change: number;
    rawChange: number;
  }>;
  className?: string;
  timeSeriesData?: Array<{year: number, [key: string]: number}>;
  dataType?: 'landCover' | 'precipitation' | 'vegetation' | 'population';
}

// Conversion factors based on MODIS pixel resolution (approximately 463m per pixel)
const PIXEL_TO_SQ_KM = 0.2144; // One MODIS pixel is about 0.2144 sq km (463m × 463m / 1000000)
const DISPLAY_IN_THOUSANDS = 1000; // Threshold to display in thousands of sq km

// Precipitation specific conversion (mm to volume)
const PRECIP_MM_TO_VOLUME = (mm: number, area: number) => mm * area; // Precipitation in mm * area in sq km = volume in thousand cubic meters

const ChartCarousel = ({ 
  data, 
  timeSeriesData = [], 
  className, 
  dataType = 'landCover' 
}: ChartCarouselProps) => {
  // Filter out any data points with zero values
  const filteredData = data.filter(item => item.value > 0);
  
  let convertedData = filteredData;
  let convertedTimeSeriesData = timeSeriesData;
  let displayUnit = 'sq km';
  
  // Process based on data type
  if (dataType === 'landCover') {
    // Determine if we need to display in thousands based on max value
    const maxValue = Math.max(...filteredData.map(item => item.value * PIXEL_TO_SQ_KM));
    const useThousands = maxValue > DISPLAY_IN_THOUSANDS;
    const displayDivisor = useThousands ? 1000 : 1;
    displayUnit = useThousands ? 'thousand sq km' : 'sq km';
    
    // Convert pixel data to square kilometers for display
    convertedData = filteredData.map(item => ({
      ...item,
      value: Math.round((item.value * PIXEL_TO_SQ_KM) / displayDivisor * 10) / 10, // Round to 1 decimal place
      rawSqKm: item.value * PIXEL_TO_SQ_KM,
    }));
    
    // Convert time series data to square kilometers
    convertedTimeSeriesData = timeSeriesData.map(yearData => {
      const convertedYearData: {year: number, [key: string]: number} = { year: yearData.year };
      
      Object.keys(yearData).forEach(key => {
        if (key !== 'year') {
          convertedYearData[key] = Math.round((yearData[key] * PIXEL_TO_SQ_KM) / displayDivisor * 10) / 10;
        }
      });
      
      return convertedYearData;
    });
  } else if (dataType === 'precipitation') {
    const totalLandArea = 100; // Approximated area in sq km for the region of interest
    
    // Modified: Filter out Extreme Events and Water Stress Index for bar and pie charts only
    const rainfallOnly = filteredData.filter(item => 
      item.name === 'Annual Rainfall' || 
      item.name === 'Dry Season' || 
      item.name === 'Wet Season'
    );
    
    // Keep all data for other visualizations
    const indexesOnly = filteredData.filter(item => 
      item.name === 'Water Stress Index' || 
      item.name === 'Extreme Events'
    );
    
    // Converting rainfall data (keep only rainfall metrics for bar/pie charts)
    convertedData = rainfallOnly.map(item => {
      return {
        ...item,
        value: Math.round(PRECIP_MM_TO_VOLUME(item.value, totalLandArea) / 1000 * 10) / 10,
        displayUnit: 'million cubic meters',
        originalValue: item.value,
        rawVolume: PRECIP_MM_TO_VOLUME(item.value, totalLandArea),
      };
    });
    
    // Store the full data separately for the specialized chart
    const fullConvertedData = [
      ...convertedData,
      ...indexesOnly.map(item => ({
        ...item,
        displayUnit: item.name === 'Extreme Events' ? 'events per year' : 'index value',
        originalValue: item.value,
      }))
    ];
    
    // Convert time series data with appropriate units
    convertedTimeSeriesData = timeSeriesData.map(yearData => {
      const convertedYearData: {year: number, [key: string]: number} = { year: yearData.year };
      
      Object.keys(yearData).forEach(key => {
        if (key !== 'year') {
          if (key === 'Annual' || key === 'Dry Season' || key === 'Wet Season') {
            convertedYearData[key] = Math.round(PRECIP_MM_TO_VOLUME(yearData[key], totalLandArea) / 1000 * 10) / 10;
          } else {
            convertedYearData[key] = yearData[key];
          }
        }
      });
      
      return convertedYearData;
    });
    
    displayUnit = 'million cubic meters';
  }
  // Add additional data type handling (vegetation, population) here if needed
  
  // Get all land cover types that appear in the time series data
  const getAllLandCoverTypes = () => {
    const types = new Set<string>();
    timeSeriesData.forEach(yearData => {
      Object.keys(yearData).forEach(key => {
        if (key !== 'year' && yearData[key] > 0) {
          types.add(key);
        }
      });
    });
    return Array.from(types);
  };
  
  const landCoverTypes = getAllLandCoverTypes();
  
  // Color mapping for consistency
  const getColorForType = (type: string) => {
    const colorMap: Record<string, string> = {
      'Forests': '#1a9850',
      'Shrublands': '#91cf60',
      'Grasslands': '#fee08b',
      'Croplands': '#fc8d59',
      'Urban': '#d73027',
      'Barren': '#bababa',
      'Water': '#4575b4',
      'Wetlands': '#74add1',
      'Savannas': '#f46d43',
      'Snow and Ice': '#ffffff',
      // Precipitation specific colors
      'Annual': '#4575b4',
      'Seasonal': '#74add1',
      'Monthly': '#91bfdb',
    };
    
    return colorMap[type] || `#${Math.floor(Math.random()*16777215).toString(16)}`;
  };

  // Debug function to ensure proper data
  const ensureUrbanData = () => {
    const hasUrban = filteredData.some(item => item.name === 'Urban' || item.name.includes('Urban'));
    console.log('Urban data in charts:', hasUrban, 
      filteredData.filter(item => item.name === 'Urban' || item.name.includes('Urban')));
    console.log('All chart data:', filteredData);
    console.log('Converted chart data:', convertedData);
  };

  // Call the check function
  ensureUrbanData();

  // Custom tooltip formatter for different data types
  const formatTooltip = (value: number, name: string, entry: any) => {
    if (dataType === 'precipitation') {
      if (entry && entry.payload) {
        const dataPoint = entry.payload;
        if (name === 'Annual' || name === 'Dry Season' || name === 'Wet Season' || 
            name === 'Annual Rainfall' || name === 'Dry Season' || name === 'Wet Season') {
          // For rainfall, show original mm and converted volume
          const originalValue = dataPoint.originalValue || value;
          return [`${value.toLocaleString()} million m³ (${originalValue} mm)`, name];
        } else if (name === 'Extreme Events') {
          return [`${value.toLocaleString()} events`, name];
        } else if (name === 'Water Stress Index') {
          return [`${value.toLocaleString()} (${value < 40 ? 'Low' : value < 60 ? 'Medium' : 'High'})`, name];
        }
      }
      return [`${value.toLocaleString()}`, name];
    }
    // Default for land cover
    return [`${value.toLocaleString()} ${displayUnit}`, name];
  };

  return (
    <div className={cn("relative", className)}>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {/* Bar Chart */}
          <CarouselItem className="md:basis-full">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={convertedData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={60} 
                  />
                  <YAxis 
                    label={{ 
                      value: dataType === 'precipitation' ? 
                        'Volume (million m³)' : 
                        `Area (${displayUnit})`, 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }} 
                  />
                  <Tooltip formatter={formatTooltip} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar 
                    dataKey="value" 
                    name={dataType === 'precipitation' ? 
                      'Rainfall Volume' : 
                      `Area (${displayUnit})`}
                  >
                    {convertedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CarouselItem>

          {/* Pie Chart */}
          <CarouselItem className="md:basis-full">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={convertedData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    label={(entry) => entry.name}
                  >
                    {convertedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={formatTooltip} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CarouselItem>

          {/* Time Series Chart */}
          <CarouselItem className="md:basis-full">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {dataType === 'precipitation' ? (
                  <AreaChart
                    data={convertedTimeSeriesData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="year" 
                      label={{ 
                        value: 'Year', 
                        position: 'insideBottom',
                        offset: -10
                      }}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Rainfall (million m³)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' }
                      }} 
                    />
                    <Tooltip formatter={formatTooltip} />
                    <Legend />
                    
                    {/* Only rainfall data shown in time series chart */}
                    <Area 
                      type="monotone" 
                      dataKey="Annual" 
                      stroke="#4575b4" 
                      fill="#4575b4" 
                      fillOpacity={0.7} 
                      name="Annual Rainfall"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Dry Season" 
                      stroke="#74add1" 
                      fill="#74add1" 
                      fillOpacity={0.7}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Wet Season" 
                      stroke="#91bfdb" 
                      fill="#91bfdb" 
                      fillOpacity={0.7}
                    />
                  </AreaChart>
                ) : (
                  <AreaChart
                    data={convertedTimeSeriesData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="year" 
                      label={{ 
                        value: 'Year', 
                        position: 'insideBottom',
                        offset: -10
                      }}
                    />
                    <YAxis 
                      label={{ 
                        value: `Area (${displayUnit})`, 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' }
                      }} 
                    />
                    <Tooltip formatter={formatTooltip} />
                    <Legend />
                    
                    {/* Show the key land cover types with stacked area */}
                    <Area type="monotone" dataKey="Forests" stackId="1" stroke="#1a9850" fill="#1a9850" fillOpacity={0.7} />
                    <Area type="monotone" dataKey="Shrublands" stackId="1" stroke="#91cf60" fill="#91cf60" fillOpacity={0.7} />
                    <Area type="monotone" dataKey="Grasslands" stackId="1" stroke="#fee08b" fill="#fee08b" fillOpacity={0.7} />
                    <Area type="monotone" dataKey="Croplands" stackId="1" stroke="#fc8d59" fill="#fc8d59" fillOpacity={0.7} />
                    <Area type="monotone" dataKey="Urban" stackId="1" stroke="#d73027" fill="#d73027" fillOpacity={0.7} />
                    <Area type="monotone" dataKey="Barren" stackId="1" stroke="#bababa" fill="#bababa" fillOpacity={0.7} />
                    <Area type="monotone" dataKey="Water" stackId="1" stroke="#4575b4" fill="#4575b4" fillOpacity={0.7} />
                    <Area type="monotone" dataKey="Wetlands" stackId="1" stroke="#74add1" fill="#74add1" fillOpacity={0.7} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </CarouselItem>

          {/* Specialized Chart for Water Stress Index and Extreme Events - Only for Precipitation */}
          {dataType === 'precipitation' && (
            <CarouselItem className="md:basis-full">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={convertedTimeSeriesData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="year" 
                      label={{ 
                        value: 'Year', 
                        position: 'insideBottom',
                        offset: -10
                      }}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Index & Event Values', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' }
                      }} 
                    />
                    <Tooltip formatter={formatTooltip} />
                    <Legend />
                    
                    {/* Only show Water Stress Index and Extreme Events */}
                    <Line 
                      type="monotone" 
                      dataKey="Water Stress Index" 
                      stroke="#fc8d59" 
                      strokeWidth={2} 
                      dot={{ r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Extreme Events" 
                      stroke="#d73027" 
                      strokeWidth={2} 
                      dot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-center mt-1 text-muted-foreground">
                Trend Analysis: Water Stress Index and Extreme Weather Events (2010-2023)
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2" />
        <CarouselNext className="absolute right-4 top-1/2" />
      </Carousel>
    </div>
  );
};

export default ChartCarousel;
