
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart, LineChart, Line, ComposedChart, Scatter } from 'recharts';
import { cn } from "@/lib/utils";
import { regionalPrecipitationColors, vegetationProductivityScale } from "@/lib/geospatialUtils";

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

const PIXEL_TO_SQ_KM = 0.2144;
const DISPLAY_IN_THOUSANDS = 1000;

const ChartCarousel = ({ 
  data = [], 
  timeSeriesData = [], 
  className, 
  dataType = 'landCover' 
}: ChartCarouselProps) => {
  const filteredData = data
    .filter(item => item.value > 0)
    .filter(item => item.name !== 'Overall' && item.name !== 'Total');
  
  let convertedData = filteredData;
  let convertedTimeSeriesData = timeSeriesData;
  let displayUnit = 'sq km';
  
  if (dataType === 'landCover') {
    const maxValue = Math.max(...filteredData.map(item => item.value * PIXEL_TO_SQ_KM));
    const useThousands = maxValue > DISPLAY_IN_THOUSANDS;
    const displayDivisor = useThousands ? 1000 : 1;
    displayUnit = useThousands ? 'thousand sq km' : 'sq km';
    
    convertedData = filteredData.map(item => ({
      ...item,
      value: Math.round((item.value * PIXEL_TO_SQ_KM) / displayDivisor * 10) / 10,
      rawSqKm: item.value * PIXEL_TO_SQ_KM,
    }));
    
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
    convertedData = filteredData;
    displayUnit = 'mm';
    
    convertedTimeSeriesData = timeSeriesData;
  } else if (dataType === 'vegetation') {
    convertedData = filteredData;
    displayUnit = 'gC/m²/year';
    
    convertedTimeSeriesData = timeSeriesData;
  }

  const calculateYDomain = () => {
    if (dataType === 'precipitation') {
      const values = convertedData.map(item => item.value);
      if (values.length === 0) return [0, 500] as [number, number];
      
      const min = Math.floor(Math.min(...values) * 0.95);
      const max = Math.ceil(Math.max(...values) * 1.05);
      const range = max - min;
      
      return [min, max + (range < 50 ? 50 : 0)] as [number, number];
    }
    
    return [0, 'auto'] as [number, string];
  };

  const formatTooltip = (value: number, name: string, entry: any) => {
    if (dataType === 'precipitation') {
      if (entry && entry.payload) {
        if (name === 'South' || name === 'Center' || name === 'North') {
          return [`${value.toLocaleString()} mm`, name];
        } else if (name === 'Extreme Events') {
          return [`${value.toLocaleString()} events`, name];
        } else if (name === 'Water Stress Index') {
          return [`${value.toLocaleString()} (${value < 40 ? 'Low' : value < 60 ? 'Medium' : 'High'})`, name];
        }
      }
      return [`${value.toLocaleString()} mm`, name];
    } else if (dataType === 'vegetation') {
      if (name === 'Forest' || name === 'Grassland' || name === 'Cropland' || name === 'Shrubland') {
        return [`${value.toLocaleString()} ${displayUnit}`, name];
      } else if (name === 'AnnualChange') {
        return [`${value > 0 ? '+' : ''}${value.toLocaleString()}%`, `Annual Change`];
      }
      return [`${value.toLocaleString()} ${displayUnit}`, name];
    }
    return [`${value.toLocaleString()} ${displayUnit}`, name];
  };

  const getRegionalColor = (region: string) => {
    return regionalPrecipitationColors[region as keyof typeof regionalPrecipitationColors] || '#999999';
  };

  const getVegetationColor = (key: string) => {
    const colorMap: Record<string, string> = {
      'Forest': '#1a9850',
      'Grassland': '#fee08b',
      'Cropland': '#fc8d59',
      'Shrubland': '#91cf60',
      'AnnualChange': '#d53e4f'
    };
    return colorMap[key] || '#999999';
  };

  const getLandCoverColor = (classKey: string) => {
    const colorMap: Record<string, string> = {
      'Forests': '#1a9850',
      'Shrublands': '#91cf60',
      'Grasslands': '#fee08b',
      'Croplands': '#fc8d59',
      'Urban': '#d73027',
      'Barren': '#bababa',
      'Water': '#4575b4',
      'Wetlands': '#74add1'
    };
    return colorMap[classKey] || '#999999';
  };

  const prepareLandCoverTimeSeriesData = () => {
    if (dataType !== 'landCover' || !timeSeriesData || timeSeriesData.length === 0) {
      return timeSeriesData;
    }

    if (!Array.isArray(timeSeriesData)) {
      console.error("Time series data is not an array:", timeSeriesData);
      return [];
    }

    const sortedData = [...timeSeriesData].sort((a, b) => {
      if (!a || !b || typeof a.year === 'undefined' || typeof b.year === 'undefined') {
        console.error("Invalid time series data item:", { a, b });
        return 0;
      }
      return a.year - b.year;
    });

    return sortedData.map(yearData => {
      const processed: {year: number, [key: string]: number} = { 
        year: yearData.year 
      };
      
      const landCoverMap: {[key: string]: string} = {
        'Value_7': 'Forests',
        'Value_10': 'Grasslands',
        'Value_12': 'Croplands',
        'Value_16': 'Barren'
      };
      
      Object.entries(yearData).forEach(([key, value]) => {
        if (key !== 'year') {
          if (landCoverMap[key]) {
            processed[landCoverMap[key]] = Number(value);
          } else {
            processed[key] = Number(value);
          }
        }
      });
      
      return processed;
    });
  };

  const sortedLandCoverTimeSeriesData = prepareLandCoverTimeSeriesData();

  // Fetch and prepare land cover gradient data for the gradient visualization
  const prepareLandCoverGradientData = (data: any[]) => {
    return data;
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
                    domain={calculateYDomain()}
                    label={{ 
                      value: dataType === 'precipitation' ? 
                        'Precipitation (mm)' : 
                        dataType === 'vegetation' ? 
                        `Productivity (${displayUnit})` :
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
                      'Precipitation (mm)' : 
                      dataType === 'vegetation' ?
                      `Productivity (${displayUnit})` :
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
                      domain={calculateYDomain()}
                      label={{ 
                        value: 'Precipitation (mm)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' }
                      }} 
                    />
                    <Tooltip formatter={formatTooltip} />
                    <Legend />
                    
                    <Line 
                      type="monotone" 
                      dataKey="South" 
                      stroke={getRegionalColor('South')} 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="South"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Center" 
                      stroke={getRegionalColor('Center')} 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Center"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="North" 
                      stroke={getRegionalColor('North')} 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="North"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-center mt-1 text-muted-foreground">
                Regional Precipitation Trends (2010-2023)
              </div>
            </CarouselItem>
          )}

          {dataType === 'vegetation' && (
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
                      domain={[0, 'auto'] as [number, string]}
                      label={{ 
                        value: `Productivity (${displayUnit})`, 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' }
                      }} 
                    />
                    <Tooltip formatter={formatTooltip} />
                    <Legend />
                    
                    <Line 
                      type="monotone" 
                      dataKey="Forest" 
                      stroke={getVegetationColor('Forest')} 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Forest"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Grassland" 
                      stroke={getVegetationColor('Grassland')} 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Grassland"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Cropland" 
                      stroke={getVegetationColor('Cropland')} 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Cropland"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Shrubland" 
                      stroke={getVegetationColor('Shrubland')} 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Shrubland"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-center mt-1 text-muted-foreground">
                Vegetation Productivity by Land Cover Type (2010-2023)
              </div>
            </CarouselItem>
          )}

          {dataType === 'vegetation' && (
            <CarouselItem className="md:basis-full">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
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
                      yAxisId="left"
                      label={{ 
                        value: 'Total Productivity', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' }
                      }} 
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      label={{ 
                        value: 'Annual Change (%)', 
                        angle: 90, 
                        position: 'insideRight',
                        style: { textAnchor: 'middle' }
                      }} 
                    />
                    <Tooltip formatter={formatTooltip} />
                    <Legend />
                    
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="AnnualChange" 
                      stroke={getVegetationColor('AnnualChange')} 
                      strokeWidth={2}
                      dot={{ r: 5 }}
                      name="Annual Change"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-center mt-1 text-muted-foreground">
                Vegetation Productivity Annual Change Rate
              </div>
            </CarouselItem>
          )}

          {dataType === 'precipitation' && (
            <CarouselItem className="md:basis-full">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
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
                        value: 'Precipitation (mm)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' }
                      }} 
                    />
                    <Tooltip formatter={formatTooltip} />
                    <Legend />
                    
                    <Bar dataKey="South" fill={getRegionalColor('South')} />
                    <Bar dataKey="Center" fill={getRegionalColor('Center')} />
                    <Bar dataKey="North" fill={getRegionalColor('North')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-center mt-1 text-muted-foreground">
                Regional Comparison: South, Center, and North Precipitation
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
