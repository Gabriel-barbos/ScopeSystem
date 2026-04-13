import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ChartCardSkeleton() {
  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3.5 w-56" />
      </div>
      <Skeleton className="h-[280px] w-full rounded-lg" />
    </Card>
  );
}