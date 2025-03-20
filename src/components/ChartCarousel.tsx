
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
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
}

const ChartCarousel = ({ data, timeSeriesData = [], className }: ChartCarouselProps) => {
  // Filter out any data points with zero values
  const filteredData = data.filter(item => item.value > 0);
  
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
    };
    
    return colorMap[type] || `#${Math.floor(Math.random()*16777215).toString(16)}`;
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
                  data={filteredData}
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
                      value: 'Area (thousand pixels)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }} 
                  />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Bar 
                    dataKey="value" 
                    name="Area (thousand pixels)"
                  >
                    {filteredData.map((entry, index) => (
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
                    data={filteredData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    label={(entry) => entry.name}
                  >
                    {filteredData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CarouselItem>

          {/* Area Chart for Time Series Data - Updated to match TemporalAnalysis */}
          <CarouselItem className="md:basis-full">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timeSeriesData}
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
                      value: 'Area (thousand pixels)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }} 
                  />
                  <Tooltip />
                  <Legend />
                  
                  {/* Show the key land cover types with stacked area like in TemporalAnalysis */}
                  <Area type="monotone" dataKey="Forests" stackId="1" stroke="#1a9850" fill="#1a9850" fillOpacity={0.7} />
                  <Area type="monotone" dataKey="Shrublands" stackId="1" stroke="#91cf60" fill="#91cf60" fillOpacity={0.7} />
                  <Area type="monotone" dataKey="Grasslands" stackId="1" stroke="#fee08b" fill="#fee08b" fillOpacity={0.7} />
                  <Area type="monotone" dataKey="Croplands" stackId="1" stroke="#fc8d59" fill="#fc8d59" fillOpacity={0.7} />
                  <Area type="monotone" dataKey="Urban" stackId="1" stroke="#d73027" fill="#d73027" fillOpacity={0.7} />
                  <Area type="monotone" dataKey="Barren" stackId="1" stroke="#bababa" fill="#bababa" fillOpacity={0.7} />
                  <Area type="monotone" dataKey="Water" stackId="1" stroke="#4575b4" fill="#4575b4" fillOpacity={0.7} />
                  <Area type="monotone" dataKey="Wetlands" stackId="1" stroke="#74add1" fill="#74add1" fillOpacity={0.7} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2" />
        <CarouselNext className="absolute right-4 top-1/2" />
      </Carousel>
    </div>
  );
};

export default ChartCarousel;
