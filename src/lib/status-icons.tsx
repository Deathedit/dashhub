import { CheckCircle2, GitBranch, Loader2, XCircle } from 'lucide-react';
import type { DisplayStatus } from '@/lib/status';

export function makeStatusIcons(
  size: 'sm' | 'lg',
): Record<DisplayStatus, React.ReactNode> {
  const s = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  return {
    success: (
      <CheckCircle2
        className={`${s} text-green-600 dark:text-green-400 transition-colors hover:text-green-700 dark:hover:text-green-300`}
      />
    ),
    failure: <XCircle className={`${s} text-red-600 dark:text-red-400`} />,
    in_progress: (
      <Loader2
        className={`${s} animate-spin text-yellow-600 dark:text-yellow-400`}
      />
    ),
    unknown: <GitBranch className={`${s} text-muted-foreground`} />,
  };
}