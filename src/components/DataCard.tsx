
import { ReactNode } from 'react';
import { cn } from "@/lib/utils";
import { ArrowUpRight } from 'lucide-react';

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
}

const DataCard = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
  onClick
}: DataCardProps) => {
  return (
    <div 
      className={cn(
        "bg-white rounded-xl p-5 shadow-sm border border-border/40 hover:shadow-md transition-all duration-300",
        onClick && "cursor-pointer transform hover:-translate-y-1",
        className
      )}
      onClick={onClick}
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
            trend.isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
          </div>
        )}
      </div>
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      {onClick && (
        <div className="mt-3 text-xs flex items-center text-sahel-blue font-medium">
          View details <ArrowUpRight size={12} className="ml-1" />
        </div>
      )}
    </div>
  );
};

export default DataCard;
