
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LandCoverGradientChart from './LandCoverGradientChart';
import { BarChart2, RefreshCw, Layers, Sun, CloudRain } from 'lucide-react';

interface GradientAnalysisProps {
  year?: number;
  className?: string;
}

const GradientAnalysis = ({ year = 2023, className }: GradientAnalysisProps) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg font-medium">
          <RefreshCw size={18} className="mr-2 text-primary" />
          Trend Analysis and Change Detection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="landCover" className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="landCover" className="flex items-center">
              <Layers size={14} className="mr-1.5" />
              <span>Land Cover</span>
            </TabsTrigger>
            <TabsTrigger value="vegetation" className="flex items-center">
              <Sun size={14} className="mr-1.5" />
              <span>Vegetation</span>
            </TabsTrigger>
            <TabsTrigger value="precipitation" className="flex items-center">
              <CloudRain size={14} className="mr-1.5" />
              <span>Precipitation</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="landCover" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-full">
                <LandCoverGradientChart />
              </div>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Land Cover Improvement</p>
                      <p className="text-2xl font-bold text-green-600">+{year > 2020 ? 84 : year > 2015 ? 117 : 351} km²</p>
                      <p className="text-xs text-muted-foreground">from {year - 1} to {year}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Land Cover Deterioration</p>
                      <p className="text-2xl font-bold text-red-600">-{year > 2020 ? 318 : year > 2015 ? 285 : 51} km²</p>
                      <p className="text-xs text-muted-foreground">from {year - 1} to {year}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">Contributing Factors</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-xs">Agricultural Expansion</p>
                        <p className="text-xs font-medium">{year > 2020 ? '58%' : year > 2015 ? '55%' : '49%'}</p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: year > 2020 ? '58%' : year > 2015 ? '55%' : '49%' }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-xs">Urbanization</p>
                        <p className="text-xs font-medium">{year > 2020 ? '32%' : year > 2015 ? '28%' : '23%'}</p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: year > 2020 ? '32%' : year > 2015 ? '28%' : '23%' }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-xs">Climate Factors</p>
                        <p className="text-xs font-medium">{year > 2020 ? '42%' : year > 2015 ? '39%' : '34%'}</p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: year > 2020 ? '42%' : year > 2015 ? '39%' : '34%' }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-xs">Conservation Efforts</p>
                        <p className="text-xs font-medium">{year > 2020 ? '21%' : year > 2015 ? '17%' : '12%'}</p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: year > 2020 ? '21%' : year > 2015 ? '17%' : '12%' }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="vegetation" className="mt-4 space-y-4">
            <div className="grid place-items-center p-8 border border-dashed rounded-md">
              <p className="text-muted-foreground text-sm">Vegetation trend data will be visualized here...</p>
            </div>
          </TabsContent>
          
          <TabsContent value="precipitation" className="mt-4 space-y-4">
            <div className="grid place-items-center p-8 border border-dashed rounded-md">
              <p className="text-muted-foreground text-sm">Precipitation trend data will be visualized here...</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GradientAnalysis;
