import type { WorkflowStatus } from '@/types';
import { getWorkflowDisplayStatus } from '@/services/github';
import { STATUS_META } from '@/lib/status';
import { makeStatusIcons } from '@/lib/status-icons';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { GitBranch, ExternalLink } from 'lucide-react';

const statusIcons = makeStatusIcons('lg');

interface BranchHeaderProps {
  owner: string;
  repo: string;
  branch: string;
  workflow: WorkflowStatus | null | undefined;
}

export function BranchHeader({ owner, repo, branch, workflow }: BranchHeaderProps) {
  const displayStatus = getWorkflowDisplayStatus(workflow ?? null);
  const cfg = STATUS_META[displayStatus];
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold sm:text-2xl">
          {owner}/{repo}
        </h1>
        <Badge variant="secondary" className="gap-1.5">
          <GitBranch className="h-3 w-3" />
          {branch}
        </Badge>
        {workflow !== undefined && (
          <Badge
            variant={cfg.variant}
            className={cn('gap-1.5', cfg.className)}
          >
            {statusIcons[displayStatus]}
            {cfg.label}
            {workflow?.url && (
              <a
                href={workflow.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-0.5 text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </Badge>
        )}
      </div>
    </div>
  );
}