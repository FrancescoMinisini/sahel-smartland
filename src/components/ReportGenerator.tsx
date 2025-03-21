
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, FileText, Image, Table, CheckSquare } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ReportGeneratorProps {
  data: any;
  charts: React.ReactNode[];
  insights: string;
  timestamp: string;
  className?: string;
}

const ReportGenerator = ({ 
  data, 
  charts, 
  insights, 
  timestamp,
  className 
}: ReportGeneratorProps) => {
  const [reportType, setReportType] = useState<'summary' | 'detailed'>('summary');
  const [customNotes, setCustomNotes] = useState('');
  const [includeOptions, setIncludeOptions] = useState({
    charts: true,
    data: true,
    insights: true,
    notes: false,
  });

  const toggleOption = (option: keyof typeof includeOptions) => {
    setIncludeOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const generateReport = () => {
    // In a real implementation, this would generate a PDF or other format
    // For now, we'll just download a JSON file with the report data
    const reportData = {
      type: reportType,
      generatedAt: timestamp,
      includeCharts: includeOptions.charts,
      includeData: includeOptions.data,
      includeInsights: includeOptions.insights,
      includeNotes: includeOptions.notes && customNotes.trim().length > 0,
      notes: customNotes,
      data: includeOptions.data ? data : null,
      insights: includeOptions.insights ? insights : null,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sahel-report-${timestamp.replace(/[: ]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-1.5">
          <FileText size={16} />
          <span>Report Generator</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs defaultValue="summary" onValueChange={(value) => setReportType(value as 'summary' | 'detailed')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Summary Report</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Report</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="space-y-2 pt-2">
          <Label className="text-sm font-medium">Include in Report:</Label>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-charts" 
                checked={includeOptions.charts}
                onCheckedChange={() => toggleOption('charts')}
              />
              <Label htmlFor="include-charts" className="text-sm cursor-pointer flex items-center gap-1.5">
                <Image size={14} />
                <span>Charts & Visualizations</span>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-data" 
                checked={includeOptions.data}
                onCheckedChange={() => toggleOption('data')}
              />
              <Label htmlFor="include-data" className="text-sm cursor-pointer flex items-center gap-1.5">
                <Table size={14} />
                <span>Raw Data Tables</span>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-insights" 
                checked={includeOptions.insights}
                onCheckedChange={() => toggleOption('insights')}
              />
              <Label htmlFor="include-insights" className="text-sm cursor-pointer flex items-center gap-1.5">
                <CheckSquare size={14} />
                <span>Analysis Insights</span>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-notes" 
                checked={includeOptions.notes}
                onCheckedChange={() => toggleOption('notes')}
              />
              <Label htmlFor="include-notes" className="text-sm cursor-pointer flex items-center gap-1.5">
                <FileText size={14} />
                <span>Custom Notes</span>
              </Label>
            </div>
          </div>
        </div>
        
        {includeOptions.notes && (
          <div className="space-y-2 pt-1">
            <Label htmlFor="notes" className="text-sm">Custom Notes:</Label>
            <Textarea
              id="notes"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Add your observations and recommendations..."
              className="min-h-[100px] text-sm"
            />
          </div>
        )}
        
        <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
          <p>
            {reportType === 'summary' 
              ? 'Summary report includes high-level findings and key visualizations for quick stakeholder review.'
              : 'Detailed report includes comprehensive data analysis, all visualizations, and raw data tables for in-depth examination.'}
          </p>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full flex items-center gap-2" 
          onClick={generateReport}
        >
          <Download size={16} />
          <span>Export {reportType === 'summary' ? 'Summary' : 'Detailed'} Report</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReportGenerator;
