
import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPopulationTimeSeriesData, getPopulationEnvironmentCorrelation } from '@/lib/geospatialUtils';

const PopulationInsightsCharts = () => {
  const populationData = getPopulationTimeSeriesData();
  const correlationData = getPopulationEnvironmentCorrelation();
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD'];
  
  const ageDistributionData = [
    { name: 'Under 15', value: 39 },
    { name: '15-24', value: 20 },
    { name: '25-54', value: 33 },
    { name: '55-64', value: 4.2 },
    { name: '65 and over', value: 3.8 }
  ];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={populationData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="Urban" stackId="1" stroke="#8884d8" fill="#8884d8" />
            <Area type="monotone" dataKey="Rural" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
            <Area type="monotone" dataKey="Nomadic" stackId="1" stroke="#ffc658" fill="#ffc658" />
          </AreaChart>
        </ResponsiveContainer>
        
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={ageDistributionData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {ageDistributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Environmental Impact Correlation</h4>
        <div className="space-y-2">
          {correlationData.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-28 text-xs">{item.factor}</div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    item.correlation > 0.7 ? 'bg-red-500' : 
                    item.correlation > 0.5 ? 'bg-orange-500' : 
                    item.correlation > 0.3 ? 'bg-yellow-500' : 
                    item.correlation > 0 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.abs(item.correlation) * 100}%` }}
                ></div>
              </div>
              <div className="w-12 text-right text-xs">{item.correlation.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopulationInsightsCharts;
