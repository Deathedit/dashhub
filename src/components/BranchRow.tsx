import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BranchData } from '@/types';
import { getWorkflowDisplayStatus } from '@/services/github';
import { useGlassActive, cardClass } from '@/lib/glass';
import { relativeTime, text } from '@/constants/text';
import { STATUS_META } from '@/lib/status';
import { makeStatusIcons } from '@/lib/status-icons';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ExternalLink, GitBranch } from 'lucide-react';

const statusIcons = makeStatusIcons('sm');

function BranchRowInner({ branch }: { branch: BranchData }) {
  const { key, commit, workflow, error } = branch;
  const displayStatus = getWorkflowDisplayStatus(workflow);
  const cfg = STATUS_META[displayStatus];
  const isGlass = useGlassActive();
  const navigate = useNavigate();

  const detailPath = `/${key.owner}/${key.repo}/${key.branch}`;
  const githubUrl = `https://github.com/${key.owner}/${key.repo}/tree/${key.branch}`;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => navigate(detailPath)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(detailPath); } }}
      className={`flex cursor-pointer items-start gap-3 rounded-lg border border-l-4 p-4 transition-shadow hover:shadow-md ${cfg.border} ${cardClass(isGlass)}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold">
            {key.owner}/{key.repo}
          </span>
          <Badge variant="secondary" className="gap-1">
            <GitBranch className="h-3 w-3" />
            {key.branch}
          </Badge>
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium',
              cfg.className,
            )}
          >
            {statusIcons[displayStatus]}
            {cfg.label}
          </span>
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-destructive">
            {error.includes('404') ? (
              text.errors.repoOrBranchNotFound
            ) : error.includes('403') ? (
              <>
                {text.errors.rateLimit}{' '}
                <a
                  href="/settings"
                  onClick={(e) => e.stopPropagation()}
                  className="underline hover:text-destructive/80"
                >
                  {text.errors.addToken}
                </a>{' '}
                {text.errors.rateLimitSuffix}
              </>
            ) : (
              text.errors.githubApiError
            )}
          </p>
        )}

        {commit && (
          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            <Avatar className="h-4 w-4">
              {commit.avatarUrl && (
                <AvatarImage src={commit.avatarUrl} alt="" />
              )}
              <AvatarFallback className="text-[8px]">
                {commit.author.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-foreground">
              {commit.message.split('\n')[0]}
            </span>
            <span className="shrink-0 font-medium">{commit.author}</span>
            {commit.date && (
              <span className="shrink-0">{relativeTime(commit.date)}</span>
            )}
          </div>
        )}
      </div>

      <span className="inline-flex shrink-0">
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title={text.branch.openOnGitHub}
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </span>
    </div>
  );
}

export const BranchRow = memo(BranchRowInner);