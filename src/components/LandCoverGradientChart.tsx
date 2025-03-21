
import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ComposedChart, Area 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { HelpCircle } from 'lucide-react';
import { TooltipProvider, Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface GradientData {
  year: number;
  improvement_sqm: number;
  deterioration_sqm: number;
}

const LandCoverGradientChart: React.FC = () => {
  const [gradientData, setGradientData] = useState<GradientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch the CSV data
    fetch('/Datasets_Hackathon/Graph_data/land_cover_gradient.csv')
      .then(response => response.text())
      .then(csvText => {
        // Parse CSV data
        const rows = csvText.split('\n');
        const headers = rows[0].split(',');
        
        const parsedData: GradientData[] = [];
        
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue; // Skip empty rows
          
          const values = rows[i].split(',');
          parsedData.push({
            year: parseInt(values[0]),
            improvement_sqm: parseInt(values[1]),
            deterioration_sqm: parseInt(values[2])
          });
        }
        
        setGradientData(parsedData);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading gradient data:', error);
        setIsLoading(false);
      });
  }, []);

  // Calculate net change for each year
  const dataWithNetChange = gradientData.map(item => ({
    ...item,
    netChange: item.improvement_sqm - item.deterioration_sqm
  }));

  // Calculate insights
  const getGradientInsights = () => {
    if (gradientData.length === 0) return "No data available for analysis.";

    const totalImprovement = gradientData.reduce((sum, item) => sum + item.improvement_sqm, 0);
    const totalDeterioration = gradientData.reduce((sum, item) => sum + item.deterioration_sqm, 0);
    const netChange = totalImprovement - totalDeterioration;
    
    const bestYear = [...gradientData].sort((a, b) => 
      (b.improvement_sqm - b.deterioration_sqm) - (a.improvement_sqm - a.deterioration_sqm)
    )[0];
    
    const worstYear = [...gradientData].sort((a, b) => 
      (a.improvement_sqm - a.deterioration_sqm) - (b.improvement_sqm - b.deterioration_sqm)
    )[0];

    const recentYears = gradientData.slice(-3);
    const recentTrend = recentYears.reduce((sum, item) => sum + (item.improvement_sqm - item.deterioration_sqm), 0);
    
    return `
• Overall, the land cover shows a net ${netChange > 0 ? 'improvement' : 'deterioration'} of ${Math.abs(netChange)} sq. meters over the recorded period.
• The best year was ${bestYear.year} with a net improvement of ${bestYear.improvement_sqm - bestYear.deterioration_sqm} sq. meters.
• The worst year was ${worstYear.year} with a net deterioration of ${Math.abs(worstYear.improvement_sqm - worstYear.deterioration_sqm)} sq. meters.
• In recent years, the trend shows ${recentTrend > 0 ? 'positive recovery' : 'continued degradation'} with a net ${Math.abs(recentTrend)} sq. meter ${recentTrend > 0 ? 'improvement' : 'loss'}.
• The data indicates that periods of improvement are often followed by deterioration, suggesting cyclical patterns potentially linked to seasonal or policy changes.
    `;
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Land Cover Gradient Analysis</CardTitle>
            <CardDescription>Tracking land improvement and deterioration over time</CardDescription>
          </div>
          <Badge variant="outline" className="ml-2">2010-2022</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-t-sahel-green border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm text-muted-foreground">Loading data...</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="histogram" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="histogram">Histogram View</TabsTrigger>
              <TabsTrigger value="timeseries">Time Series</TabsTrigger>
              <TabsTrigger value="combined">Combined Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="histogram">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={gradientData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis domain={[0, 400]} />
                    <Tooltip 
                      formatter={(value, name) => {
                        return [`${value} sq. meters`, name === 'improvement_sqm' ? 'Improvement' : 'Deterioration'];
                      }}
                    />
                    <Legend 
                      formatter={(value) => value === 'improvement_sqm' ? 'Improvement' : 'Deterioration'} 
                    />
                    <Bar 
                      dataKey="improvement_sqm" 
                      name="improvement_sqm" 
                      fill="#22c55e" 
                    />
                    <Bar 
                      dataKey="deterioration_sqm" 
                      name="deterioration_sqm" 
                      fill="#ef4444" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-start gap-2 mt-4 text-sm text-muted-foreground">
                <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>
                  This histogram shows the total area of land cover improvement (green) 
                  and deterioration (red) for each year, measured in square meters.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="timeseries">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={gradientData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis domain={[0, 400]} />
                    <Tooltip 
                      formatter={(value, name) => {
                        return [`${value} sq. meters`, name === 'improvement_sqm' ? 'Improvement' : 'Deterioration'];
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="improvement_sqm" 
                      name="Land Improvement" 
                      stroke="#22c55e" 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="deterioration_sqm" 
                      name="Land Deterioration" 
                      stroke="#ef4444" 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-start gap-2 mt-4 text-sm text-muted-foreground">
                <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>
                  This time series plot shows the trends of land cover improvement and 
                  deterioration over the years. Notice how improvements and deterioration 
                  often follow opposing patterns.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="combined">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={dataWithNetChange}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis domain={[-400, 400]} />
                    <Tooltip 
                      formatter={(value, name) => {
                        return [`${value} sq. meters`, name === 'netChange' ? 'Net Change' : 
                               name === 'improvement_sqm' ? 'Improvement' : 'Deterioration'];
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="improvement_sqm" 
                      name="Improvement" 
                      fill="#22c55e" 
                      stroke="#22c55e" 
                      fillOpacity={0.3}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="deterioration_sqm" 
                      name="Deterioration" 
                      fill="#ef4444" 
                      stroke="#ef4444" 
                      fillOpacity={0.3}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="netChange" 
                      name="Net Change" 
                      stroke="#3b82f6" 
                      dot={{ r: 5 }} 
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-start gap-2 mt-4 text-sm text-muted-foreground">
                <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>
                  This combined view shows both the raw improvement/deterioration values 
                  as area charts and the calculated net change (blue line) over time. 
                  Positive net change values indicate years of overall improvement.
                </p>
              </div>
            </TabsContent>
            
            <div className="p-4 bg-muted rounded-lg mt-6">
              <h4 className="font-medium mb-2">Gradient Analysis Insights:</h4>
              <p className="whitespace-pre-line text-sm">
                {getGradientInsights()}
              </p>
            </div>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default LandCoverGradientChart;
