
import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, PieChart, Pie, Sector } from 'recharts';
import { HelpCircle } from 'lucide-react';
import { landCoverColors } from '@/lib/geospatialUtils';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';

type ChartData = {
  name: string;
  value: number;
  color: string;
  change?: number;
  rawChange?: number;
};

type ChartCarouselProps = {
  chartData: ChartData[];
  className?: string;
  year: number;
};

// Pie chart active shape renderer
const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-sm font-medium">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-xs">
        {`${value.toLocaleString()} px (${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

const ChartCarousel: React.FC<ChartCarouselProps> = ({ chartData, className, year }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activePieIndex, setActivePieIndex] = useState(0);

  const onPieEnter = (_: any, index: number) => {
    setActivePieIndex(index);
  };

  return (
    <div className={className}>
      <Carousel className="w-full">
        <CarouselContent>
          {/* Bar Chart */}
          <CarouselItem>
            <div className="bg-white dark:bg-muted rounded-lg border border-border/40 p-6">
              <h3 className="text-lg font-medium mb-4">Land Cover Distribution ({year})</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
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
                    <Tooltip 
                      formatter={(value, name, props) => {
                        if (name === "Area (thousand pixels)") {
                          const change = props.payload.change;
                          return [
                            `${value} thousand pixels ${change !== 0 ? `(${change > 0 ? '+' : ''}${change}%)` : ''}`, 
                            name
                          ];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Bar 
                      dataKey="value" 
                      name="Area (thousand pixels)" 
                      fill="#8884d8"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-2 mb-2">
                  <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>
                    The chart displays the distribution of land cover types measured in thousands of pixels. Each pixel represents approximately 500m², with colors matching the map visualization.
                  </p>
                </div>
              </div>
            </div>
          </CarouselItem>

          {/* Pie Chart */}
          <CarouselItem>
            <div className="bg-white dark:bg-muted rounded-lg border border-border/40 p-6">
              <h3 className="text-lg font-medium mb-4">Land Cover Proportion ({year})</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activePieIndex}
                      activeShape={renderActiveShape}
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-2 mb-2">
                  <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>
                    This pie chart shows the proportional distribution of land cover types. Hover over segments to see detailed values. The chart uses the same color scheme as the map for easy comparison.
                  </p>
                </div>
              </div>
            </div>
          </CarouselItem>
        </CarouselContent>
        <div className="flex justify-center mt-4">
          <CarouselPrevious className="relative static transform-none mx-1" />
          <CarouselNext className="relative static transform-none mx-1" />
        </div>
      </Carousel>
    </div>
  );
};

export default ChartCarousel;
