import { memo } from 'react';
import type { CommitDetail } from '@/types';
import { useGlassActive, cardClass } from '@/lib/glass';
import { relativeTime } from '@/constants/text';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExternalLink } from 'lucide-react';

function CommitRowInner({ commit }: { commit: CommitDetail }) {
  const isGlass = useGlassActive();
  return (
    <a
      href={commit.url}
      target='_blank'
      rel='noopener noreferrer'
      aria-label={`${commit.sha.slice(0, 7)} by ${commit.author}: ${commit.message.split('\n')[0]}`}
      className={`flex items-start gap-3 rounded-lg border p-4 transition-shadow hover:shadow-md ${cardClass(isGlass)}`}
    >
      <Avatar className='mt-0.5 h-8 w-8 shrink-0'>
        {commit.avatarUrl && <AvatarImage src={commit.avatarUrl} alt='' />}
        <AvatarFallback className='text-xs font-medium'>{commit.author.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium'>{commit.message}</p>
        <div className='mt-1 flex items-center gap-2 text-xs text-muted-foreground'>
          <span className='font-mono text-muted-foreground/70'>{commit.sha.slice(0, 7)}</span>
          <span className='font-medium'>{commit.author}</span>
          {commit.date && <span>{relativeTime(commit.date)}</span>}
        </div>
      </div>
      <ExternalLink className='mt-1 h-4 w-4 shrink-0 text-muted-foreground/50 transition-colors hover:text-foreground/70' />
    </a>
  );
}

export const CommitRow = memo(CommitRowInner);
