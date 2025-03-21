
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Badge } from './ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

type LandCoverGradientData = {
  year: number;
  improvement_sqm: number;
  deterioration_sqm: number;
};

const LandCoverGradientCard = () => {
  const [data, setData] = useState<LandCoverGradientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestYear, setLatestYear] = useState<number | null>(null);
  const [trend, setTrend] = useState<{
    value: number;
    isPositive: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/Datasets_Hackathon/Graph_data/land_cover_gradient.csv');
        const csvText = await response.text();
        
        // Parse CSV
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        
        const parsedData: LandCoverGradientData[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const values = line.split(',');
          const year = parseInt(values[0], 10);
          
          if (isNaN(year)) continue;
          
          const improvement_sqm = parseFloat(values[1]);
          const deterioration_sqm = parseFloat(values[2]);
          
          parsedData.push({
            year,
            improvement_sqm,
            deterioration_sqm,
          });
        }
        
        // Sort by year
        parsedData.sort((a, b) => a.year - b.year);
        
        // Calculate trend from last two years
        if (parsedData.length >= 2) {
          const lastYear = parsedData[parsedData.length - 1];
          const prevYear = parsedData[parsedData.length - 2];
          
          const lastNetChange = lastYear.improvement_sqm - lastYear.deterioration_sqm;
          const prevNetChange = prevYear.improvement_sqm - prevYear.deterioration_sqm;
          
          // Calculate percentage change
          let percentChange = 0;
          if (prevNetChange !== 0) {
            percentChange = ((lastNetChange - prevNetChange) / Math.abs(prevNetChange)) * 100;
          } else if (lastNetChange > 0) {
            percentChange = 100; // If previous was 0 and current is positive
          } else if (lastNetChange < 0) {
            percentChange = -100; // If previous was 0 and current is negative
          }
          
          setTrend({
            value: Math.abs(Math.round(percentChange)),
            isPositive: percentChange >= 0
          });
          
          setLatestYear(lastYear.year);
        }
        
        setData(parsedData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading land cover gradient data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getInsights = () => {
    if (data.length === 0) return "No data available";
    
    // Calculate total improvements and deteriorations
    const totalImprovement = data.reduce((sum, item) => sum + item.improvement_sqm, 0);
    const totalDeterioration = data.reduce((sum, item) => sum + item.deterioration_sqm, 0);
    const netChange = totalImprovement - totalDeterioration;
    
    // Find years with best and worst net change
    const netChangeByYear = data.map(item => ({
      year: item.year,
      netChange: item.improvement_sqm - item.deterioration_sqm
    }));
    
    const bestYear = [...netChangeByYear].sort((a, b) => b.netChange - a.netChange)[0];
    const worstYear = [...netChangeByYear].sort((a, b) => a.netChange - b.netChange)[0];
    
    // Calculate trend direction
    const isImproving = trend?.isPositive || false;
    
    return {
      summary: isImproving 
        ? "Land cover is showing signs of recovery" 
        : "Land cover degradation continues to be a concern",
      netChange: netChange > 0 
        ? `Net improvement of ${netChange.toLocaleString()} sqm over the studied period` 
        : `Net degradation of ${Math.abs(netChange).toLocaleString()} sqm over the studied period`,
      bestYear: `Best recovery in ${bestYear.year} with net gain of ${bestYear.netChange.toLocaleString()} sqm`,
      worstYear: `Worst degradation in ${worstYear.year} with net loss of ${Math.abs(worstYear.netChange).toLocaleString()} sqm`,
      trend: isImproving 
        ? `Improving trend with ${trend?.value}% better recovery rate compared to previous year` 
        : `Worsening trend with ${trend?.value}% worse degradation rate compared to previous year`
    };
  };

  const insights = getInsights();

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Land Cover Gradient Analysis</CardTitle>
            <CardDescription className="mt-1">Improvement vs. Deterioration Trends</CardDescription>
          </div>
          <div className="bg-sahel-green/10 p-2 rounded-full">
            <Activity className="h-5 w-5 text-sahel-green" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-[200px] w-full rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-2xl font-bold">
                  {latestYear ? data.find(d => d.year === latestYear)?.improvement_sqm.toLocaleString() : '--'} sqm
                </span>
                <span className="text-sm text-muted-foreground ml-2">improvement in {latestYear}</span>
              </div>
              
              {trend && (
                <Badge className={`flex items-center gap-1 ${trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {trend.isPositive ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {trend.value}%
                </Badge>
              )}
            </div>
            
            <div className="h-[200px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis 
                    dataKey="year" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 400]}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip formatter={(value) => [`${value} sqm`, '']} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="improvement_sqm" 
                    name="Improvement" 
                    fill="#4ade80" 
                    stroke="#22c55e" 
                    fillOpacity={0.2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="deterioration_sqm" 
                    name="Deterioration" 
                    fill="#f87171" 
                    stroke="#ef4444" 
                    fillOpacity={0.2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="improvement_sqm" 
                    name="Improvement" 
                    stroke="#22c55e" 
                    strokeWidth={2} 
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="deterioration_sqm" 
                    name="Deterioration" 
                    stroke="#ef4444" 
                    strokeWidth={2} 
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2 mt-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{insights.summary}</p>
              <p>{insights.netChange}</p>
              <p>{insights.trend}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LandCoverGradientCard;
