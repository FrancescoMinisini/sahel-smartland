
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Leaf, TrendingUp, TrendingDown, Info, AlertTriangle } from 'lucide-react';

interface GradientAnalysisProps {
  year: number;
}

// Define the data structure for land cover gradient data
interface LandCoverGradientData {
  year: number;
  improvement_sqm: number;
  deterioration_sqm: number;
  ratio?: number;
  net?: number;
}

const GradientAnalysis: React.FC<GradientAnalysisProps> = ({ year }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [gradientData, setGradientData] = useState<LandCoverGradientData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load the land cover gradient data from CSV
  useEffect(() => {
    const fetchGradientData = async () => {
      try {
        const response = await fetch('/Datasets_Hackathon/Graph_data/land_cover_gradient.csv');
        const csvText = await response.text();
        
        // Parse CSV
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        
        const parsedData: LandCoverGradientData[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',');
          const dataObj: LandCoverGradientData = {
            year: parseInt(values[0]),
            improvement_sqm: parseInt(values[1]),
            deterioration_sqm: parseInt(values[2]),
          };
          
          // Calculate the net change and improvement/deterioration ratio
          dataObj.net = dataObj.improvement_sqm - dataObj.deterioration_sqm;
          dataObj.ratio = dataObj.improvement_sqm / (dataObj.improvement_sqm + dataObj.deterioration_sqm);
          
          parsedData.push(dataObj);
        }
        
        setGradientData(parsedData);
      } catch (error) {
        console.error('Error loading gradient data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGradientData();
  }, []);
  
  // Get the data for the selected year or closest year
  const selectedYearData = gradientData.find(d => d.year === year) || 
                           gradientData.sort((a, b) => Math.abs(a.year - year) - Math.abs(b.year - year))[0] || 
                           { year: 2010, improvement_sqm: 0, deterioration_sqm: 0, ratio: 0, net: 0 };
  
  // Calculate averages and trends
  const averageImprovement = gradientData.reduce((acc, curr) => acc + curr.improvement_sqm, 0) / (gradientData.length || 1);
  const averageDeterioration = gradientData.reduce((acc, curr) => acc + curr.deterioration_sqm, 0) / (gradientData.length || 1);
  
  const improvementTrend = selectedYearData.improvement_sqm > averageImprovement;
  const deteriorationTrend = selectedYearData.deterioration_sqm > averageDeterioration;
  
  // Generate insights
  const generateInsights = () => {
    const insights = [];
    
    if (selectedYearData.improvement_sqm > selectedYearData.deterioration_sqm) {
      insights.push({
        title: "Net Positive Land Cover Change",
        description: `${year} showed a net positive land cover change of ${selectedYearData.net} sq.km.`,
        type: "positive"
      });
    } else {
      insights.push({
        title: "Net Negative Land Cover Change",
        description: `${year} showed a net negative land cover change of ${Math.abs(selectedYearData.net || 0)} sq.km.`,
        type: "negative"
      });
    }
    
    if (improvementTrend) {
      insights.push({
        title: "Above Average Improvement",
        description: `Land cover improvement in ${year} was above the average of ${Math.round(averageImprovement)} sq.km.`,
        type: "positive"
      });
    } else {
      insights.push({
        title: "Below Average Improvement",
        description: `Land cover improvement in ${year} was below the average of ${Math.round(averageImprovement)} sq.km.`,
        type: "warning"
      });
    }
    
    if (!deteriorationTrend) {
      insights.push({
        title: "Below Average Deterioration",
        description: `Land cover deterioration in ${year} was below the average of ${Math.round(averageDeterioration)} sq.km.`,
        type: "positive"
      });
    } else {
      insights.push({
        title: "Above Average Deterioration",
        description: `Land cover deterioration in ${year} was above the average of ${Math.round(averageDeterioration)} sq.km.`,
        type: "warning"
      });
    }
    
    return insights;
  };
  
  const insights = generateInsights();
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Land Cover Gradient Analysis</CardTitle>
            <CardDescription>
              Analysis of land cover change gradients showing improvements and deteriorations
            </CardDescription>
          </div>
          <Badge variant={selectedYearData.improvement_sqm > selectedYearData.deterioration_sqm ? "default" : "destructive"} className="ml-auto">
            {year}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-t-sahel-green border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm text-muted-foreground">Loading data...</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Historical Trends</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Land Cover Improvement</CardTitle>
                    <CardDescription>Areas with improved land cover</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${improvementTrend ? 'bg-green-100' : 'bg-orange-100'} mr-3`}>
                        {improvementTrend ? <TrendingUp className="text-green-600" size={18} /> : <TrendingDown className="text-orange-600" size={18} />}
                      </div>
                      <div>
                        <div className="font-bold text-2xl">{selectedYearData.improvement_sqm} sq.km</div>
                        <div className="text-xs text-muted-foreground">
                          {improvementTrend 
                            ? `${Math.round((selectedYearData.improvement_sqm / averageImprovement - 1) * 100)}% above average` 
                            : `${Math.round((1 - selectedYearData.improvement_sqm / averageImprovement) * 100)}% below average`}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Land Cover Deterioration</CardTitle>
                    <CardDescription>Areas with degraded land cover</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${!deteriorationTrend ? 'bg-green-100' : 'bg-red-100'} mr-3`}>
                        {!deteriorationTrend ? <TrendingDown className="text-green-600" size={18} /> : <TrendingUp className="text-red-600" size={18} />}
                      </div>
                      <div>
                        <div className="font-bold text-2xl">{selectedYearData.deterioration_sqm} sq.km</div>
                        <div className="text-xs text-muted-foreground">
                          {!deteriorationTrend 
                            ? `${Math.round((1 - selectedYearData.deterioration_sqm / averageDeterioration) * 100)}% below average` 
                            : `${Math.round((selectedYearData.deterioration_sqm / averageDeterioration - 1) * 100)}% above average`}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Improvement/Deterioration Ratio</CardTitle>
                    <CardDescription>Balance of positive to negative changes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${selectedYearData.ratio && selectedYearData.ratio > 0.5 ? 'bg-green-100' : 'bg-red-100'} mr-3`}>
                        <Leaf className={selectedYearData.ratio && selectedYearData.ratio > 0.5 ? "text-green-600" : "text-red-600"} size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-2xl">{(selectedYearData.ratio || 0).toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">
                          {selectedYearData.ratio && selectedYearData.ratio > 0.5 
                            ? "More improvement than deterioration" 
                            : "More deterioration than improvement"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Land Cover Change Balance ({year})</CardTitle>
                  <CardDescription>Comparison of improvement vs deterioration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Improvement', value: selectedYearData.improvement_sqm },
                          { name: 'Deterioration', value: selectedYearData.deterioration_sqm }
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value} sq.km`} />
                        <Legend />
                        <Bar dataKey="value" name="Square Kilometers" fill="#8884d8">
                          {[
                            { name: 'Improvement', value: selectedYearData.improvement_sqm, fill: '#22c55e' },
                            { name: 'Deterioration', value: selectedYearData.deterioration_sqm, fill: '#ef4444' }
                          ].map((entry, index) => (
                            <defs key={`pattern-${index}`}>
                              <pattern id={`pattern-${index}`} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                                <rect width="2" height="6" transform="translate(0,0)" fill={entry.fill} />
                              </pattern>
                            </defs>
                          ))}
                          {[
                            { name: 'Improvement', value: selectedYearData.improvement_sqm, fill: '#22c55e' },
                            { name: 'Deterioration', value: selectedYearData.deterioration_sqm, fill: '#ef4444' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="trends" className="space-y-6">
              <Card className="bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Historical Land Cover Change Trends (2010-2022)</CardTitle>
                  <CardDescription>Annual trends in land cover improvement and deterioration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={gradientData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value} sq.km`} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="improvement_sqm" 
                          name="Improvement" 
                          stroke="#22c55e" 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="deterioration_sqm" 
                          name="Deterioration" 
                          stroke="#ef4444" 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Net Land Cover Change (2010-2022)</CardTitle>
                  <CardDescription>Annual net change in land cover (improvement - deterioration)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={gradientData.map(item => ({
                          year: item.year,
                          net: item.improvement_sqm - item.deterioration_sqm
                        }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value} sq.km`} />
                        <Legend />
                        <Bar 
                          dataKey="net" 
                          name="Net Change" 
                          fill="#8884d8"
                        >
                          {gradientData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={(entry.improvement_sqm - entry.deterioration_sqm) >= 0 ? '#22c55e' : '#ef4444'} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, index) => (
                  <Card key={index} className="bg-white">
                    <CardHeader className="pb-2">
                      <div className="flex items-center">
                        {insight.type === "positive" ? (
                          <div className="p-2 rounded-full bg-green-100 mr-2">
                            <TrendingUp className="text-green-600" size={16} />
                          </div>
                        ) : insight.type === "negative" ? (
                          <div className="p-2 rounded-full bg-red-100 mr-2">
                            <TrendingDown className="text-red-600" size={16} />
                          </div>
                        ) : (
                          <div className="p-2 rounded-full bg-amber-100 mr-2">
                            <AlertTriangle className="text-amber-600" size={16} />
                          </div>
                        )}
                        <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Card className="bg-white">
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-blue-100 mr-2">
                      <Info className="text-blue-600" size={16} />
                    </div>
                    <CardTitle className="text-sm font-medium">Land Cover Change Summary</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    The land cover gradient analysis provides insights into the balance between improvement and deterioration of land cover in the Sahel region.
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Leaf className="text-green-600 mr-2" size={16} />
                      <span className="text-sm">
                        <strong>Improvement:</strong> Areas where land cover has changed positively, such as revegetation or afforestation
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Leaf className="text-red-600 mr-2" size={16} />
                      <span className="text-sm">
                        <strong>Deterioration:</strong> Areas where land cover has changed negatively, such as deforestation or desertification
                      </span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="text-blue-600 mr-2" size={16} />
                      <span className="text-sm">
                        <strong>Ratio:</strong> The proportion of improvement to total change (values closer to 1 indicate more improvement)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default GradientAnalysis;
