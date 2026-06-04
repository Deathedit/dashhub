import { useGlassActive, cardClass } from '@/lib/glass';
import { Skeleton } from '@/components/ui/skeleton';

export function CommitListSkeleton() {
  const isGlass = useGlassActive();
  return (
    <div className='space-y-3'>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={`flex items-start gap-3 rounded-lg border p-4 ${cardClass(isGlass)}`}>
          <Skeleton className='mt-0.5 h-8 w-8 shrink-0 rounded-full' />
          <div className='flex-1 space-y-2'>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-3 w-1/2' />
          </div>
        </div>
      ))}
    </div>
  );
}
