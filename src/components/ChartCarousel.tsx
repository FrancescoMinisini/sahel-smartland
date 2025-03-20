
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart, LineChart, Line, ComposedChart, Scatter } from 'recharts';
import { cn } from "@/lib/utils";
import { useEffect } from 'react';

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

const ChartCarousel = ({ 
  data, 
  timeSeriesData = [], 
  className, 
  dataType = 'landCover' 
}: ChartCarouselProps) => {
  useEffect(() => {
    console.log(`ChartCarousel received ${dataType} data:`, data);
    console.log(`ChartCarousel received ${dataType} time series data:`, timeSeriesData);
  }, [data, timeSeriesData, dataType]);
  
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
    displayUnit = 'mm';
    // For precipitation data, we use it as-is, but ensure it's properly formatted for charts
    convertedData = filteredData;
  }

  // Custom tooltip formatter for different data types
  const formatTooltip = (value: number, name: string, entry: any) => {
    if (dataType === 'precipitation') {
      return [`${value.toLocaleString()} mm`, name];
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
                        'Rainfall (mm)' : 
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
                      'Rainfall (mm)' : 
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
                {dataType === 'precipitation' && timeSeriesData.length > 0 ? (
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
                        value: 'Rainfall (mm)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' }
                      }} 
                    />
                    <Tooltip formatter={formatTooltip} />
                    <Legend />
                    
                    {/* Rainfall data shown as lines */}
                    <Line 
                      type="monotone" 
                      dataKey="Overall" 
                      stroke="#08306b" 
                      strokeWidth={2}
                      dot={{ r: 5 }}
                      name="Overall"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="South" 
                      stroke="#4292c6" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="South"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Center" 
                      stroke="#2171b5" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Center"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="North" 
                      stroke="#08519c" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="North"
                    />
                  </LineChart>
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
            {dataType === 'precipitation' && (
              <div className="text-xs text-center mt-1 text-muted-foreground">
                Regional Rainfall Trends (2010-2023) in mm
              </div>
            )}
          </CarouselItem>

          {/* Specialized Chart for Water Stress Index and Extreme Events - Only for Precipitation */}
          {dataType === 'precipitation' && timeSeriesData.length > 0 && (
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
