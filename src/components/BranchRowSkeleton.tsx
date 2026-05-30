import { useGlassActive, cardClass } from "@/hooks/useGlass";
import { Skeleton } from "@/components/ui/skeleton";

export default function BranchRowSkeleton() {
  const isGlass = useGlassActive();
  return (
    <div className={`flex items-start gap-3 rounded-lg border p-4 ${cardClass(isGlass)}`}>
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
    </div>
  );
}