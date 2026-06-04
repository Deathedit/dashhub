import { useMemo } from 'react';
import { useApp } from '@/contexts/app-context';
import { text } from '@/constants/text';
import type { BranchData } from '@/types';
import { BranchRow } from '@/components/BranchRow';
import { BranchRowSkeleton } from '@/components/BranchRowSkeleton';

export default function DashboardPage() {
  const { branches, data } = useApp();

  const sorted = useMemo(() => {
    const sortPriority = (b: BranchData): number => (b.loading ? 0 : b.error || !b.commit ? 2 : 1);

    return [...data].sort((a, b) => {
      const pa = sortPriority(a);
      const pb = sortPriority(b);
      if (pa !== pb) return pa - pb;
      const da = a.commit ? new Date(a.commit.date).getTime() : 0;
      const db = b.commit ? new Date(b.commit.date).getTime() : 0;
      return db - da;
    });
  }, [data]);

  if (branches.length === 0) {
    return (
      <div className='mx-auto max-w-3xl px-4 py-6 sm:px-6'>
        <div className='flex flex-col items-center justify-center py-24 text-center'>
          <p className='mb-2 text-lg font-medium text-muted-foreground'>{text.dashboard.noBranchesTitle}</p>
          <p className='text-sm text-muted-foreground'>{text.dashboard.noBranchesSubtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-3xl px-4 py-6 sm:px-6'>
      <div className='space-y-3'>
        {sorted.map((branch) => (branch.loading ? <BranchRowSkeleton key={branch.key.id} /> : <BranchRow key={branch.key.id} branch={branch} />))}
      </div>
    </div>
  );
}
