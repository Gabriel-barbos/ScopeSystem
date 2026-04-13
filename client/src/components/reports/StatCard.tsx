// components/reports/StatCard.tsx
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import NumberFlow from "@number-flow/react";

type StatCardProps = {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  isLoading?: boolean;
};

export const StatCard = ({ title, value, icon: Icon, color, isLoading }: StatCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setDisplayValue(value);
    }
  }, [value, isLoading]);

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-200 hover:shadow-md"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div className="flex items-center gap-4 p-5">
        {isLoading ? (
          <>
            <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
          </>
        ) : (
          <>
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
              style={{ backgroundColor: `${color}14` }}
            >
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {title}
              </p>
              <NumberFlow
                value={displayValue}
                className="text-2xl font-semibold tabular-nums tracking-tight"
              />
            </div>
          </>
        )}
      </div>
    </Card>
  );
};