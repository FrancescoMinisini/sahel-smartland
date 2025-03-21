
import React, { createContext, useContext, ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

interface ChartContextType {
  config: ChartConfig;
  showInsights?: boolean;
  toggleInsights?: () => void;
}

const ChartContext = createContext<ChartContextType | undefined>(undefined);

export const useChart = () => {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a ChartContainer');
  }
  return context;
};

interface ChartContainerProps {
  children: ReactNode;
  config: ChartConfig;
  className?: string;
  insights?: ReactNode;
}

export const ChartContainer = ({
  children,
  config,
  className,
  insights,
}: ChartContainerProps) => {
  const [showInsights, setShowInsights] = useState(false);
  
  const toggleInsights = () => {
    setShowInsights((prev) => !prev);
  };

  return (
    <ChartContext.Provider value={{ config, showInsights, toggleInsights }}>
      <div className={cn("w-full h-full relative", className)}>
        {insights && (
          <div className="absolute top-2 right-2 z-10">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={toggleInsights}
                    className={cn(
                      "p-1.5 rounded-full transition-colors", 
                      showInsights 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    <Info size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle insights</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        
        {showInsights && insights ? (
          <div className="absolute inset-0 bg-card/95 backdrop-blur-sm z-[5] p-4 overflow-auto rounded-lg border">
            <div className="space-y-2">
              <h4 className="font-medium">Chart Insights</h4>
              {insights}
            </div>
            <button 
              onClick={toggleInsights} 
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
          </div>
        ) : null}
        
        {children}
      </div>
    </ChartContext.Provider>
  );
};

// Fixed type error by correctly typing the content prop to accept either ReactNode or a function
interface ChartTooltipProps {
  content: React.ReactNode | ((props: any) => React.ReactNode);
  className?: string;
}

export const ChartTooltip = ({ content, className }: ChartTooltipProps) => {
  // Using type guard to check if content is a function
  const renderContent = () => {
    if (typeof content === 'function') {
      return content({});
    }
    return content;
  };

  return (
    <div className={className}>
      {renderContent()}
    </div>
  );
};

interface ChartTooltipContentProps {
  children: ReactNode;
  className?: string;
}

export const ChartTooltipContent = ({
  children,
  className,
}: ChartTooltipContentProps) => {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700",
        className
      )}
    >
      {children}
    </div>
  );
};
