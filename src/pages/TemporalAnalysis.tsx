
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import ReportGenerator from "@/components/ReportGenerator";
import TimeWindowSelector from "@/components/TimeWindowSelector";
import RegionFilter from "@/components/RegionFilter";
import MapVisualization from "@/components/MapVisualization";
import CorrelationAnalysis from "@/components/CorrelationAnalysis";

// Sample region data for RegionFilter
const SAMPLE_REGIONS = [
  { id: "region1", name: "Northern Region", color: "#4CAF50" },
  { id: "region2", name: "Central Region", color: "#2196F3" },
  { id: "region3", name: "Southern Region", color: "#FF9800" },
  { id: "region4", name: "Eastern Region", color: "#9C27B0" },
  { id: "region5", name: "Western Region", color: "#F44336" },
];

// Sample variable data for CorrelationAnalysis
const VARIABLES = [
  { id: "landcover", name: "Land Cover Change", unit: "km²" },
  { id: "rainfall", name: "Annual Rainfall", unit: "mm" },
  { id: "temperature", name: "Average Temperature", unit: "°C" },
  { id: "population", name: "Population Density", unit: "people/km²" },
];

// Sample correlation data
const CORRELATION_DATA = Array.from({ length: 50 }, (_, i) => ({
  id: `data-${i}`,
  year: 2010 + Math.floor(i / 4),
  landcover: Math.random() * 100,
  rainfall: 200 + Math.random() * 800,
  temperature: 20 + Math.random() * 15,
  population: 50 + Math.random() * 200,
}));

const TemporalAnalysis = () => {
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [startYear, setStartYear] = useState(2010);
  const [endYear, setEndYear] = useState(2023);
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportFormat, setReportFormat] = useState("pdf");
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const isMobile = useIsMobile();

  const handleTimeWindowChange = (start: number, end: number) => {
    setStartYear(start);
    setEndYear(end);
  };

  const handleRegionChange = (regions: string[]) => {
    setSelectedRegions(regions);
    console.log("Selected regions updated:", regions);
  };

  const handleDatasetSelection = (dataset: string, checked: boolean) => {
    if (checked) {
      setSelectedDatasets((prev) => [...prev, dataset]);
    } else {
      setSelectedDatasets((prev) => prev.filter((d) => d !== dataset));
    }
  };

  const handleGenerateReport = () => {
    if (selectedDatasets.length === 0) return;
    
    setIsGenerating(true);
    setProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          return 100;
        }
        return prevProgress + 10;
      });
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto p-4 max-w-full"
    >
      <h1 className="text-3xl font-bold mb-6 text-center">Temporal Analysis Dashboard</h1>
      
      <ResizablePanelGroup
        direction={isMobile ? "vertical" : "horizontal"}
        className="min-h-[80vh] rounded-lg border"
      >
        {/* Main content panel */}
        <ResizablePanel defaultSize={75} minSize={30}>
          <div className="h-full p-6 space-y-6">
            <TimeWindowSelector
              startYear={startYear}
              endYear={endYear}
              minYear={2010}
              maxYear={2023}
              onChange={handleTimeWindowChange}
              className="w-full"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Region Selection</CardTitle>
                </CardHeader>
                <CardContent>
                  <RegionFilter 
                    regions={SAMPLE_REGIONS}
                    selectedRegions={selectedRegions}
                    onChange={handleRegionChange}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Map Visualization</CardTitle>
                </CardHeader>
                <CardContent>
                  <MapVisualization />
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Correlation Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CorrelationAnalysis 
                  data={CORRELATION_DATA} 
                  variables={VARIABLES}
                />
              </CardContent>
            </Card>
          </div>
        </ResizablePanel>
        
        {/* Resizable handle */}
        <ResizableHandle withHandle />
        
        {/* Right panel for parameters */}
        <ResizablePanel defaultSize={25} minSize={20}>
          <div className="h-full p-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-name">Report Name</Label>
                    <Input
                      id="report-name"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      placeholder="Enter report name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="report-description">Description</Label>
                    <Input
                      id="report-description"
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Enter report description"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="report-format">Report Format</Label>
                    <Select
                      value={reportFormat}
                      onValueChange={setReportFormat}
                    >
                      <SelectTrigger id="report-format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="include-metadata"
                      checked={includeMetadata}
                      onChange={(e) => setIncludeMetadata(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="include-metadata">Include Metadata</Label>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Select Datasets</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="dataset-land-cover"
                          onChange={(e) => handleDatasetSelection("land-cover", e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="dataset-land-cover">Land Cover</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="dataset-climate"
                          onChange={(e) => handleDatasetSelection("climate", e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="dataset-climate">Climate Data</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="dataset-population"
                          onChange={(e) => handleDatasetSelection("population", e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="dataset-population">Population</Label>
                      </div>
                    </div>
                  </div>
                  
                  {isGenerating ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Generating report...</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} />
                    </div>
                  ) : (
                    <Button 
                      type="button" 
                      onClick={handleGenerateReport}
                      disabled={selectedDatasets.length === 0}
                      className="w-full"
                    >
                      Generate Report
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </motion.div>
  );
};

export default TemporalAnalysis;
