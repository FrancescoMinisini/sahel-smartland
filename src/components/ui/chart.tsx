
import React, { createContext, useContext, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

interface ChartContextType {
  config: ChartConfig;
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
}

export const ChartContainer = ({
  children,
  config,
  className,
}: ChartContainerProps) => {
  return (
    <ChartContext.Provider value={{ config }}>
      <div className={cn("w-full h-full", className)}>
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
