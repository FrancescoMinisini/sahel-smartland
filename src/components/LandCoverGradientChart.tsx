
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const gradientData = [
  {year: 2010, improvement_sqm: 64, deterioration_sqm: 338},
  {year: 2011, improvement_sqm: 351, deterioration_sqm: 51},
  {year: 2012, improvement_sqm: 104, deterioration_sqm: 298},
  {year: 2013, improvement_sqm: 260, deterioration_sqm: 142},
  {year: 2014, improvement_sqm: 141, deterioration_sqm: 261},
  {year: 2015, improvement_sqm: 277, deterioration_sqm: 125},
  {year: 2016, improvement_sqm: 152, deterioration_sqm: 250},
  {year: 2017, improvement_sqm: 213, deterioration_sqm: 189},
  {year: 2018, improvement_sqm: 117, deterioration_sqm: 285},
  {year: 2019, improvement_sqm: 376, deterioration_sqm: 26},
  {year: 2020, improvement_sqm: 12, deterioration_sqm: 390},
  {year: 2021, improvement_sqm: 313, deterioration_sqm: 89},
  {year: 2022, improvement_sqm: 84, deterioration_sqm: 318}
];

interface LandCoverGradientChartProps {
  className?: string;
  selectedYear?: number;
  showSingleYear?: boolean;
}

const LandCoverGradientChart = ({ className, selectedYear = 2022, showSingleYear = false }: LandCoverGradientChartProps) => {
  const chartData = showSingleYear 
    ? gradientData.filter(item => item.year === selectedYear)
    : gradientData;
  
  const chartTitle = showSingleYear 
    ? `Land Cover Gradient (${selectedYear})` 
    : 'Land Cover Gradient (2010-2022)';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{chartTitle}</CardTitle>
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
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                barSize={showSingleYear ? 80 : 20}
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
  );
};

export default LandCoverGradientChart;
