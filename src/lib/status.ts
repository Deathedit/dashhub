import { text } from '@/constants/text';

export type DisplayStatus = 'success' | 'failure' | 'in_progress' | 'unknown';

interface StatusMeta {
  label: string;
  variant: 'default' | 'destructive' | 'secondary' | 'outline' | 'ghost';
  className?: string;
  border: string;
}

export const STATUS_META: Record<DisplayStatus, StatusMeta> = {
  success: {
    label: text.status.passing,
    variant: 'ghost',
    className:
      'text-green-600 dark:text-green-400 hover:bg-transparent hover:text-green-600 dark:hover:text-green-400',
    border: 'border-l-green-500 dark:border-l-green-400',
  },
  failure: {
    label: text.status.failed,
    variant: 'destructive',
    border: 'border-l-red-500 dark:border-l-red-400',
  },
  in_progress: {
    label: text.status.inProgress,
    variant: 'secondary',
    border: 'border-l-yellow-500 dark:border-l-yellow-400',
  },
  unknown: {
    label: text.status.noCi,
    variant: 'outline',
    border: 'border-l-border',
  },
};
