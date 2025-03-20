
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, BarChart3, LineChart, PieChart } from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart as ReLineChart,
  Line,
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label
} from 'recharts';

interface DataPoint {
  name: string;
  value: number;
  color: string;
  change?: number;
  rawChange?: number;
}

interface ChartCarouselProps {
  data: DataPoint[];
  timeSeriesData: any[];
  dataType: 'landCover' | 'precipitation' | 'vegetation' | 'population';
}

const ChartCarousel = ({ data, timeSeriesData, dataType }: ChartCarouselProps) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  
  const handleChartTypeChange = (type: 'bar' | 'line' | 'pie') => {
    setChartType(type);
  };
  
  // Calculate min and max values for Y-axis scaling to make differences more visible
  const getYAxisDomain = () => {
    if (dataType === 'precipitation') {
      // Create more space between values for precipitation
      const allValues = timeSeriesData.flatMap(d => [d.South, d.Center, d.North])
                        .filter(v => v !== undefined);
      
      if (allValues.length === 0) return [0, 600];
      
      const min = Math.floor(Math.min(...allValues) * 0.95);
      const max = Math.ceil(Math.max(...allValues) * 1.05);
      
      // Ensure we have a meaningful range for visualization
      return [min, max];
    }
    
    return undefined; // Let recharts determine for other data types
  };
  
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart
              data={data}
              margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis 
                domain={getYAxisDomain()}
                tick={{ fontSize: 12 }} 
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  return [`${value.toLocaleString()}`, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="value" name="Value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </ReBarChart>
          </ResponsiveContainer>
        );
      case 'line':
        const timeData = timeSeriesData.map(entry => {
          const { year, ...rest } = entry;
          return { year, ...rest };
        });
        
        const getLines = () => {
          if (dataType === 'landCover') {
            return data.map((entry, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={entry.name}
                stroke={entry.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ));
          } else if (dataType === 'precipitation') {
            // Remove Overall from the lines
            return [
              <Line key="south" type="monotone" dataKey="South" stroke={data.find(d => d.name === 'South')?.color || '#8884d8'} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />,
              <Line key="center" type="monotone" dataKey="Center" stroke={data.find(d => d.name === 'Center')?.color || '#82ca9d'} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />,
              <Line key="north" type="monotone" dataKey="North" stroke={data.find(d => d.name === 'North')?.color || '#ffc658'} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            ];
          } else if (dataType === 'vegetation') {
            return [
              <Line key="forest" type="monotone" dataKey="Forest" stroke="#1a9850" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />,
              <Line key="grassland" type="monotone" dataKey="Grassland" stroke="#fee08b" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />,
              <Line key="cropland" type="monotone" dataKey="Cropland" stroke="#fc8d59" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />,
              <Line key="shrubland" type="monotone" dataKey="Shrubland" stroke="#91cf60" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            ];
          } else if (dataType === 'population') {
            // Remove Total from the lines to match getPopulationChartData
            return [
              <Line key="urban" type="monotone" dataKey="Urban" stroke="#1e88e5" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />,
              <Line key="rural" type="monotone" dataKey="Rural" stroke="#43a047" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />,
              <Line key="nomadic" type="monotone" dataKey="Nomadic" stroke="#ff7043" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            ];
          }
          
          return [];
        };
        
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart
              data={timeData}
              margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={getYAxisDomain()}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {getLines()}
            </ReLineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  value,
                  index,
                }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  
                  const item = data[index];
                  const percent = Math.round((value / data.reduce((sum, d) => sum + d.value, 0)) * 100);
                  
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="#333"
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                      fontSize={12}
                    >
                      {item.name} ({percent}%)
                    </text>
                  );
                }}
                outerRadius="70%"
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, props: any) => {
                  return [`${value.toLocaleString()}`, props.payload.name];
                }}
              />
            </RePieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant={chartType === 'bar' ? "default" : "outline"}
            size="sm"
            onClick={() => handleChartTypeChange('bar')}
            className="h-8 px-3"
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Bar
          </Button>
          <Button
            variant={chartType === 'line' ? "default" : "outline"}
            size="sm"
            onClick={() => handleChartTypeChange('line')}
            className="h-8 px-3"
          >
            <LineChart className="h-4 w-4 mr-1" />
            Trend
          </Button>
          <Button
            variant={chartType === 'pie' ? "default" : "outline"}
            size="sm"
            onClick={() => handleChartTypeChange('pie')}
            className="h-8 px-3"
          >
            <PieChart className="h-4 w-4 mr-1" />
            Distribution
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {chartType === 'line' ? 'Temporal Trend' : chartType === 'pie' ? 'Distribution' : 'Current Values'}
        </div>
      </div>
      
      <div className="h-[300px]">
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartCarousel;
