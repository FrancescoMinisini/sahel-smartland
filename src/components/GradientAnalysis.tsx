
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { landCoverGradientColors } from "@/lib/geospatialUtils";

interface GradientAnalysisProps {
  year: number;
  dataType: 'landCoverGradient' | 'vegetationGradient' | 'precipitationGradient';
  stats?: Record<string, number>;
}

const GradientAnalysis = ({ year, dataType, stats }: GradientAnalysisProps) => {
  const { toast } = useToast();
  const [gradientData, setGradientData] = useState<Array<any>>([]);
  
  useEffect(() => {
    // Load the appropriate gradient data based on the data type
    const loadGradientData = async () => {
      try {
        if (dataType === 'landCoverGradient') {
          // Create data showing the proportion of bad transitions for each year
          const badTransitionData = [
            { year: 2011, badTransitionPct: 1.9 },
            { year: 2012, badTransitionPct: 0.4 },
            { year: 2013, badTransitionPct: 0.3 },
            { year: 2014, badTransitionPct: 0.7 },
            { year: 2015, badTransitionPct: 0.3 },
            { year: 2016, badTransitionPct: 1.4 },
            { year: 2017, badTransitionPct: 1.7 },
            { year: 2018, badTransitionPct: 0.5 },
            { year: 2019, badTransitionPct: 0.4 },
            { year: 2020, badTransitionPct: 1.3 },
            { year: 2021, badTransitionPct: 1.3 },
            { year: 2022, badTransitionPct: 1.5 },
            { year: 2023, badTransitionPct: 1.1 },
          ];
          setGradientData(badTransitionData);
        }
        // Add cases for other gradient types as needed
      } catch (error) {
        console.error(`Error loading ${dataType} gradient data:`, error);
        toast({
          title: 'Error loading gradient data',
          description: `Could not load the ${dataType} gradient data.`,
          variant: 'destructive'
        });
      }
    };

    loadGradientData();
  }, [dataType, toast]);

  // Get insight text based on data type and year
  const getInsightText = () => {
    if (dataType === 'landCoverGradient') {
      // Specific insights for different years of land cover transitions
      if (year >= 2016 && year <= 2018) {
        return (
          <div className="text-sm space-y-2 mt-2">
            <p>
              <span className="font-medium">Significant Land Cover Transitions (2016-2018):</span> Data shows 
              concerning transitions from grasslands to barren lands, particularly in the 
              eastern and southern portions of the Assaba region.
            </p>
            <p>
              <span className="font-medium">Transition Implications:</span> These transitions indicate potential 
              desertification processes occurring in these areas, likely driven by a combination 
              of climatic factors and human activities.
            </p>
            <p>
              <span className="font-medium">Transition Magnitude:</span> The 2016-2017 period shows 1.7% of the 
              region experienced problematic transitions, higher than the average of 1.1% across 
              all years analyzed.
            </p>
          </div>
        );
      } else if (year >= 2019 && year <= 2021) {
        return (
          <div className="text-sm space-y-2 mt-2">
            <p>
              <span className="font-medium">Land Cover Dynamics (2019-2021):</span> Analysis reveals 
              significant transitions from cropland to barren land in southwestern Assaba, 
              reflecting potential agricultural abandonment.
            </p>
            <p>
              <span className="font-medium">Environmental Stressors:</span> These transitions correlate with 
              decreasing rainfall patterns during this period, suggesting climate-driven land degradation.
            </p>
            <p>
              <span className="font-medium">Transition Hotspots:</span> Notable hotspots of degradation appear 
              around settlements, potentially indicating overgrazing and resource extraction pressures.
            </p>
          </div>
        );
      } else if (year >= 2021) {
        return (
          <div className="text-sm space-y-2 mt-2">
            <p>
              <span className="font-medium">Recent Transitions (2021-2023):</span> Data indicates continued 
              problematic land cover transitions, with 1.5% of the region affected in 2022, 
              primarily from vegetated to non-vegetated land cover types.
            </p>
            <p>
              <span className="font-medium">Spatial Patterns:</span> Transitions cluster along seasonal 
              watercourses and near transportation corridors, suggesting both natural and 
              anthropogenic drivers.
            </p>
            <p>
              <span className="font-medium">Vulnerability Indicators:</span> Areas with repeated problematic 
              transitions over multiple years represent high-vulnerability zones requiring targeted 
              intervention strategies.
            </p>
          </div>
        );
      } else {
        return (
          <div className="text-sm space-y-2 mt-2">
            <p>
              <span className="font-medium">Early Period Transitions (2010-2013):</span> Data shows a significant 
              spike in problematic transitions during 2010-2011 (1.9%), followed by relative 
              stability in subsequent years.
            </p>
            <p>
              <span className="font-medium">Recovery Patterns:</span> Some areas show recovery from earlier 
              transitions, with grassland regeneration in previously degraded locations, 
              particularly following years with above-average rainfall.
            </p>
            <p>
              <span className="font-medium">Transition Drivers:</span> Analysis suggests climatic variability 
              as the primary driver of transitions during this period, with limited evidence of 
              human-induced land cover change.
            </p>
          </div>
        );
      }
    } else if (dataType === 'vegetationGradient') {
      return (
        <div className="text-sm space-y-2 mt-2">
          <p>
            <span className="font-medium">Vegetation Productivity Changes:</span> Analysis of vegetation 
            gradient data shows significant interannual variability in productivity.
          </p>
          <p>
            <span className="font-medium">Spatial Patterns:</span> Most pronounced decreases in vegetation 
            productivity occur in the northeastern portions of the region.
          </p>
          <p>
            <span className="font-medium">Temporal Trends:</span> Long-term analysis indicates gradual 
            decline in overall vegetation health across most of the region from 2010-2023.
          </p>
        </div>
      );
    } else if (dataType === 'precipitationGradient') {
      return (
        <div className="text-sm space-y-2 mt-2">
          <p>
            <span className="font-medium">Rainfall Pattern Changes:</span> Precipitation gradient analysis 
            reveals shifting rainfall patterns across the Assaba region.
          </p>
          <p>
            <span className="font-medium">Regional Variability:</span> Southern portions show greater 
            rainfall stability, while northern areas experience more pronounced interannual 
            fluctuations.
          </p>
          <p>
            <span className="font-medium">Trend Analysis:</span> Data indicates an overall reduction in 
            precipitation across the region since 2010, with localized exceptions.
          </p>
        </div>
      );
    }
    
    return (
      <div className="text-sm mt-2">
        <p>Select a gradient type and year to view detailed insights.</p>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-2">
          {dataType === 'landCoverGradient' ? 'Land Cover Transition Analysis' : 
           dataType === 'vegetationGradient' ? 'Vegetation Change Analysis' :
           'Precipitation Change Analysis'}
        </h3>
        
        {dataType === 'landCoverGradient' && (
          <div className="mb-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={gradientData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis 
                  label={{ value: 'Problem Transitions (%)', angle: -90, position: 'insideLeft' }}
                  domain={[0, 2.5]}
                />
                <Tooltip formatter={(value) => [`${value}%`, 'Problem Transitions']} />
                <Bar dataKey="badTransitionPct" fill="#ef4444">
                  {gradientData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.year === year ? '#ef4444' : '#f87171'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <div className="bg-muted p-3 rounded-md">
          <h4 className="font-medium text-sm mb-1">Insights</h4>
          {getInsightText()}
        </div>
      </CardContent>
    </Card>
  );
};

export default GradientAnalysis;
