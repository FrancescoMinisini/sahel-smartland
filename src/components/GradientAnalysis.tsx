
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  ReferenceLine
} from 'recharts';
import { ArrowUpRight, ChevronDown, Info, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import RegionFilter from '@/components/RegionFilter';
import { ChartContainer } from '@/components/ui/chart';
import CorrelationAnalysis from '@/components/CorrelationAnalysis';

interface GradientAnalysisProps {
  year: number;
  className?: string;
}

interface LandCoverGradientData {
  year: number;
  improvement_sqm: number;
  deterioration_sqm: number;
}

const GradientAnalysis = ({ year, className }: GradientAnalysisProps) => {
  const [landCoverGradientData, setLandCoverGradientData] = useState<LandCoverGradientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegions, setSelectedRegions] = useState(['overall', 'north', 'central', 'south']);
  const [activeTab, setActiveTab] = useState('gradients');
  
  // Load land cover gradient data from the CSV file
  useEffect(() => {
    const fetchLandCoverGradientData = async () => {
      try {
        const response = await fetch('/Datasets_Hackathon/Graph_data/land_cover_gradient.csv');
        const text = await response.text();
        
        // Parse CSV data
        const rows = text.split('\n').filter(row => row.trim() !== '');
        const headers = rows[0].split(',');
        
        const parsedData = rows.slice(1).map(row => {
          const values = row.split(',');
          return {
            year: parseInt(values[0], 10),
            improvement_sqm: parseInt(values[1], 10),
            deterioration_sqm: parseInt(values[2], 10)
          };
        });
        
        setLandCoverGradientData(parsedData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading land cover gradient data:', error);
        // Fallback data in case of error
        setLandCoverGradientData([
          { year: 2010, improvement_sqm: 64, deterioration_sqm: 338 },
          { year: 2011, improvement_sqm: 351, deterioration_sqm: 51 },
          { year: 2012, improvement_sqm: 104, deterioration_sqm: 298 },
          { year: 2013, improvement_sqm: 260, deterioration_sqm: 142 },
          { year: 2014, improvement_sqm: 141, deterioration_sqm: 261 },
          { year: 2015, improvement_sqm: 277, deterioration_sqm: 125 },
          { year: 2016, improvement_sqm: 152, deterioration_sqm: 250 },
          { year: 2017, improvement_sqm: 213, deterioration_sqm: 189 },
          { year: 2018, improvement_sqm: 117, deterioration_sqm: 285 },
          { year: 2019, improvement_sqm: 376, deterioration_sqm: 26 },
          { year: 2020, improvement_sqm: 12, deterioration_sqm: 390 },
          { year: 2021, improvement_sqm: 313, deterioration_sqm: 89 },
          { year: 2022, improvement_sqm: 84, deterioration_sqm: 318 }
        ]);
        setIsLoading(false);
      }
    };
    
    fetchLandCoverGradientData();
  }, []);
  
  // Calculate yearly net change (improvement - deterioration)
  const netChangeData = landCoverGradientData.map(data => ({
    year: data.year,
    netChange: data.improvement_sqm - data.deterioration_sqm
  }));
  
  // Calculate current year data or use the latest available
  const currentYearData = landCoverGradientData.find(data => data.year === year) || 
                         landCoverGradientData[landCoverGradientData.length - 1] || 
                         { year: 2023, improvement_sqm: 100, deterioration_sqm: 300 };

  // Get trend data (last 3 years)
  const recentYears = landCoverGradientData
    .filter(data => data.year >= year - 2 && data.year <= year)
    .sort((a, b) => a.year - b.year);
  
  // Correlation analysis variables
  const allVariables = [
    { id: 'year', name: 'Year', unit: 'yr' },
    { id: 'improvement_sqm', name: 'Land Cover Improvement', unit: 'km²' },
    { id: 'deterioration_sqm', name: 'Land Cover Deterioration', unit: 'km²' },
    { id: 'netChange', name: 'Net Change', unit: 'km²' }
  ];
  
  // Combined data for correlation analysis
  const combinedData = landCoverGradientData.map((item, index) => ({
    ...item,
    netChange: item.improvement_sqm - item.deterioration_sqm
  }));

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-1.5">
              <TrendingUp size={16} />
              <span>Land Cover Gradient Analysis</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-sm font-medium text-muted-foreground">Improvement ({currentYearData.year})</h4>
                <div className="text-3xl font-bold mt-1 text-green-600 dark:text-green-500">
                  {currentYearData.improvement_sqm} km²
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Area with positive land cover transition
                </p>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-sm font-medium text-muted-foreground">Deterioration ({currentYearData.year})</h4>
                <div className="text-3xl font-bold mt-1 text-red-600 dark:text-red-500">
                  {currentYearData.deterioration_sqm} km²
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Area with negative land cover transition
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Net Change by Year (km²)</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Info size={16} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">About Land Cover Gradient</h4>
                    <p className="text-sm text-muted-foreground">
                      This chart shows the net change (improvement minus deterioration) in land cover across the region.
                      Positive values indicate net improvement, while negative values show net deterioration.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={netChangeData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="year" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.toString().slice(-2)}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => [`${value} km²`, 'Net Change']}
                    labelFormatter={(label) => `Year: ${label}`}
                  />
                  <ReferenceLine y={0} stroke="#666" />
                  <Bar dataKey="netChange" name="Net Change">
                    {netChangeData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.netChange >= 0 ? '#22c55e' : '#ef4444'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <CorrelationAnalysis 
          data={combinedData} 
          variables={allVariables} 
        />
      </div>
    </div>
  );
};

export default GradientAnalysis;
