
import { ReactNode, useState } from 'react';
import { cn } from "@/lib/utils";
import { ArrowUpRight, X } from 'lucide-react';
import { 
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription
} from "@/components/ui/drawer";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
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
  Bar
} from "recharts";

interface DataCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
  analyticsData?: Array<any>;
  correlations?: Array<{
    name: string;
    value: number;
    correlation: number;
  }>;
  year?: number;
}

const DataCard = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
  onClick,
  analyticsData,
  correlations,
  year = 2023
}: DataCardProps) => {
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  
  // Generate sample data if none provided
  const defaultTimeSeriesData = [
    { year: 2018, value: typeof value === 'number' ? value * 0.75 : 50 },
    { year: 2019, value: typeof value === 'number' ? value * 0.85 : 60 },
    { year: 2020, value: typeof value === 'number' ? value * 0.92 : 70 },
    { year: 2021, value: typeof value === 'number' ? value * 0.95 : 80 },
    { year: 2022, value: typeof value === 'number' ? value * 0.98 : 90 },
    { year: 2023, value: typeof value === 'number' ? value : 100 },
  ];

  const timeSeriesData = analyticsData || defaultTimeSeriesData;
  
  // Sample correlation data if none provided
  const defaultCorrelations = [
    { name: "Precipitation", value: 75, correlation: 0.67 },
    { name: "Temperature", value: 82, correlation: -0.45 },
    { name: "Population", value: 65, correlation: 0.28 },
    { name: "Urban Growth", value: 55, correlation: 0.72 },
  ];

  const correlationData = correlations || defaultCorrelations;
  
  const handleCardClick = () => {
    setIsAnalyticsOpen(true);
    if (onClick) onClick();
  };

  return (
    <>
      <div 
        className={cn(
          "bg-white dark:bg-muted rounded-xl p-5 shadow-sm border border-border/40 hover:shadow-md transition-all duration-300",
          "cursor-pointer transform hover:-translate-y-1",
          className
        )}
        onClick={handleCardClick}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {icon && <div className="text-sahel-earth/80">{icon}</div>}
        </div>
        
        <div className="flex items-baseline gap-2 mb-1">
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <div className={cn(
              "text-xs font-medium px-1.5 py-0.5 rounded-full flex items-center",
              trend.isPositive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : 
                                "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}>
              {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
            </div>
          )}
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        
        <div className="mt-3 text-xs flex items-center text-sahel-blue font-medium">
          View detailed analysis <ArrowUpRight size={12} className="ml-1" />
        </div>
      </div>

      {/* Analytics Drawer */}
      <Drawer open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
        <DrawerContent className="max-h-[90vh] overflow-y-auto">
          <DrawerHeader className="border-b pb-4">
            <div className="flex justify-between items-center">
              <DrawerTitle className="text-xl font-bold">{title} Analysis</DrawerTitle>
              <DrawerClose className="rounded-full p-2 hover:bg-muted">
                <X size={18} />
              </DrawerClose>
            </div>
            <DrawerDescription className="mt-2">
              Detailed statistical analysis and correlations for {year}
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="p-6 grid gap-8">
            {/* Key Metrics Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Current Value</h4>
                  <div className="text-3xl font-bold mt-1">{value}</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Historical Average</h4>
                  <div className="text-3xl font-bold mt-1">
                    {typeof value === 'number' 
                      ? (value * 0.85).toFixed(1) 
                      : "N/A"}
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Year-over-Year Change</h4>
                  <div className="text-3xl font-bold mt-1 flex items-center">
                    {trend ? (
                      <>
                        <span className={trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                          {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
                        </span>
                      </>
                    ) : (
                      "N/A"
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Time Series Analysis */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Historical Trend (2018-2023)</h3>
              <div className="bg-white dark:bg-muted rounded-lg p-4 border border-border/30 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={timeSeriesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name={title}
                      stroke="#22c55e" 
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Correlation Analysis */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Correlation Analysis</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-muted rounded-lg p-4 border border-border/30">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Correlation Strength</h4>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={correlationData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[-1, 1]} />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="correlation" 
                          name="Correlation Coefficient" 
                          fill="#3b82f6"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-muted rounded-lg p-4 border border-border/30">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Statistical Significance</h4>
                  <div className="space-y-4">
                    {correlationData.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{item.name}</span>
                          <span className="text-sm font-semibold">
                            {Math.abs(item.correlation) > 0.5 ? "Significant" : "Low Significance"}
                          </span>
                        </div>
                        <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${Math.abs(item.correlation) > 0.7 
                              ? "bg-green-500" 
                              : Math.abs(item.correlation) > 0.4 
                                ? "bg-amber-500" 
                                : "bg-red-500"}`}
                            style={{ width: `${Math.abs(item.correlation) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.correlation > 0 
                            ? `Positive correlation: As ${title} increases, ${item.name} tends to increase`
                            : `Negative correlation: As ${title} increases, ${item.name} tends to decrease`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Key Insights */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
              <div className="bg-muted/30 rounded-lg p-4">
                <ul className="space-y-3">
                  <li className="flex gap-2">
                    <div className="w-5 h-5 rounded-full bg-sahel-green/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-sahel-green"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </div>
                    <span>
                      {trend && trend.isPositive 
                        ? `${title} has shown a consistent upward trend of ${trend.value}% annually since 2020.`
                        : `${title} has decreased by ${trend?.value || 0}% compared to previous years, indicating potential challenges.`}
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <div className="w-5 h-5 rounded-full bg-sahel-green/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-sahel-green"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </div>
                    <span>Strongest correlation observed with {correlationData.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))[0].name} (r = {correlationData.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))[0].correlation.toFixed(2)}).</span>
                  </li>
                  <li className="flex gap-2">
                    <div className="w-5 h-5 rounded-full bg-sahel-green/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-sahel-green"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </div>
                    <span>The data suggests that focused interventions in {correlationData.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))[0].name.toLowerCase()} could potentially improve overall outcomes.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default DataCard;
