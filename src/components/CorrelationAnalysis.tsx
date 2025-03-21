
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis, Legend } from 'recharts';
import { InfoCircle, Shuffle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CorrelationAnalysisProps {
  data: any[];
  variables: {
    id: string;
    name: string;
    unit: string;
  }[];
  className?: string;
}

const CorrelationAnalysis = ({ data, variables, className }: CorrelationAnalysisProps) => {
  const [xVariable, setXVariable] = useState(variables[0]?.id || '');
  const [yVariable, setYVariable] = useState(variables[1]?.id || '');
  const [confidenceLevel, setConfidenceLevel] = useState(90);
  const [sampleSize, setSampleSize] = useState(50);

  // Calculate correlation coefficient (Pearson's r)
  const calculateCorrelation = (x: string, y: string) => {
    if (!data.length || !x || !y) return 0;

    // Extract values for the selected variables
    const values = data.map(item => ({
      x: item[x],
      y: item[y]
    })).filter(item => item.x !== undefined && item.y !== undefined);

    if (values.length < 2) return 0;

    // Calculate means
    const xMean = values.reduce((sum, val) => sum + val.x, 0) / values.length;
    const yMean = values.reduce((sum, val) => sum + val.y, 0) / values.length;

    // Calculate correlation coefficient
    let numerator = 0;
    let xDenominator = 0;
    let yDenominator = 0;

    for (const val of values) {
      const xDiff = val.x - xMean;
      const yDiff = val.y - yMean;
      numerator += xDiff * yDiff;
      xDenominator += xDiff * xDiff;
      yDenominator += yDiff * yDiff;
    }

    if (xDenominator === 0 || yDenominator === 0) return 0;
    
    const r = numerator / Math.sqrt(xDenominator * yDenominator);
    return r;
  };

  const correlation = calculateCorrelation(xVariable, yVariable);
  const correlationStrength = 
    Math.abs(correlation) < 0.3 ? 'Weak' :
    Math.abs(correlation) < 0.7 ? 'Moderate' : 'Strong';
  
  const correlationDirection = 
    correlation > 0.1 ? 'Positive' :
    correlation < -0.1 ? 'Negative' : 'Neutral';

  // Generate scatter plot data
  const generateScatterData = () => {
    if (!data.length || !xVariable || !yVariable) return [];
    
    // Sample the data based on sampleSize
    const sampledData = [...data]
      .sort(() => 0.5 - Math.random())
      .slice(0, sampleSize)
      .map(item => ({
        x: item[xVariable],
        y: item[yVariable],
        name: item.year || item.id || ''
      }))
      .filter(item => item.x !== undefined && item.y !== undefined);
    
    return sampledData;
  };

  const scatterData = generateScatterData();
  const xUnit = variables.find(v => v.id === xVariable)?.unit || '';
  const yUnit = variables.find(v => v.id === yVariable)?.unit || '';
  const xName = variables.find(v => v.id === xVariable)?.name || '';
  const yName = variables.find(v => v.id === yVariable)?.name || '';

  const randomizeSampling = () => {
    // This will trigger a re-render with a new random sample
    setSampleSize(prev => prev);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-1.5">
          <TrendingUp size={16} />
          <span>Correlation Analysis</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-sm mb-1 block">X-Axis Variable</Label>
            <Select value={xVariable} onValueChange={setXVariable}>
              <SelectTrigger>
                <SelectValue placeholder="Select variable" />
              </SelectTrigger>
              <SelectContent>
                {variables.map(variable => (
                  <SelectItem key={variable.id} value={variable.id}>
                    {variable.name} ({variable.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-sm mb-1 block">Y-Axis Variable</Label>
            <Select value={yVariable} onValueChange={setYVariable}>
              <SelectTrigger>
                <SelectValue placeholder="Select variable" />
              </SelectTrigger>
              <SelectContent>
                {variables.map(variable => (
                  <SelectItem key={variable.id} value={variable.id}>
                    {variable.name} ({variable.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm mb-1 block">Confidence Level: {confidenceLevel}%</Label>
            <Slider
              value={[confidenceLevel]}
              min={70}
              max={99}
              step={1}
              onValueChange={(values) => setConfidenceLevel(values[0])}
            />
          </div>
          
          <div>
            <Label className="text-sm mb-1 block">Sample Size: {sampleSize}</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[sampleSize]}
                min={10}
                max={100}
                step={5}
                onValueChange={(values) => setSampleSize(values[0])}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7" 
                onClick={randomizeSampling}
                title="Randomize sample"
              >
                <Shuffle size={14} />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name={xName} 
                unit={xUnit} 
                tickFormatter={(value) => value.toFixed(1)}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name={yName} 
                unit={yUnit} 
                tickFormatter={(value) => value.toFixed(1)}
              />
              <ZAxis range={[50, 50]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value: any) => [value.toFixed(2), '']}
                labelFormatter={(name) => `${name}`}
              />
              <Legend />
              <Scatter 
                name={`${xName} vs ${yName}`} 
                data={scatterData} 
                fill="#8884d8"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-muted p-3 rounded-md text-sm">
          <div className="flex items-start gap-2">
            <InfoCircle size={16} className="mt-0.5 text-muted-foreground" />
            <div>
              <div className="font-medium mb-1">Correlation: {correlation.toFixed(2)}</div>
              <p className="text-muted-foreground">
                There is a <strong>{correlationStrength} {correlationDirection}</strong> correlation between {xName} and {yName}.
                {Math.abs(correlation) > 0.5 && 
                  ` This suggests that changes in one variable may be ${correlation > 0 ? 'accompanied by similar' : 'inversely related to'} changes in the other.`}
                {Math.abs(correlation) < 0.3 && 
                  ` This suggests that these variables don't have a strong linear relationship.`}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CorrelationAnalysis;
