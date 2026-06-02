import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '@/app-context';
import { useGlassActive, cardClass } from '@/lib/glass';
import { fetchCommits, fetchLatestWorkflowRun, getWorkflowDisplayStatus } from '@/services/github';
import { getCachedCommits, setCachedCommits, getCachedWorkflow, setCachedWorkflow } from '@/services/cache';
import type { CommitDetail, WorkflowStatus } from '@/types';
import { text, relativeTime } from '@/text';
import { STATUS_META } from '@/lib/status';
import { makeStatusIcons } from '@/lib/status-icons';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  GitBranch,
  ExternalLink,
} from 'lucide-react';

const COMMITS_PER_PAGE = 13;
const statusIcons = makeStatusIcons('lg');

function CommitRow({ commit }: { commit: CommitDetail }) {
  const isGlass = useGlassActive();
  return (
    <a
      href={commit.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-start gap-3 rounded-lg border p-4 transition-shadow hover:shadow-md ${cardClass(isGlass)}`}
    >
      <Avatar className="mt-0.5 h-8 w-8 shrink-0">
        {commit.avatarUrl && <AvatarImage src={commit.avatarUrl} alt="" />}
        <AvatarFallback className="text-xs font-medium">
          {commit.author.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{commit.message}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono text-muted-foreground/70">
            {commit.sha.slice(0, 7)}
          </span>
          <span className="font-medium">{commit.author}</span>
          {commit.date && <span>{relativeTime(commit.date)}</span>}
        </div>
      </div>
      <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/50 transition-colors hover:text-foreground/70" />
    </a>
  );
}

export default function BranchPage() {
  const {
    owner,
    repo,
    '*': branch,
  } = useParams<{ owner: string; repo: string; '*': string }>();
  const { data, token } = useApp();
  const cacheKey =
    owner && repo && branch ? `${owner}/${repo}/${branch}` : null;
  const cached = cacheKey ? getCachedCommits(cacheKey) : null;
  const [fetchState, setFetchState] = useState<{
    key: string;
    commits: CommitDetail[] | null;
    error: string | null;
  }>({
    key: '',
    commits: null,
    error: null,
  });
  const [localWorkflow, setLocalWorkflow] = useState<WorkflowStatus | null | undefined>(undefined);

  const branchData = data.find(
    (d) =>
      d.key.owner === owner && d.key.repo === repo && d.key.branch === branch,
  );
  const isGlass = useGlassActive();

  useEffect(() => {
    if (!cacheKey || cached) return;
    let ignore = false;
    fetchCommits(owner!, repo!, branch!, COMMITS_PER_PAGE, token)
      .then((result) => {
        if (ignore) return;
        setCachedCommits(cacheKey, result);
        setFetchState({ key: cacheKey, commits: result, error: null });
      })
      .catch((err: Error) => {
        if (!ignore)
          setFetchState({ key: cacheKey, commits: null, error: err.message });
      });
    return () => {
      ignore = true;
    };
  }, [cacheKey, cached, owner, repo, branch, token]);

  const shouldFetchWorkflow = branchData?.workflow === undefined && cacheKey !== null && !!owner && !!repo && !!branch && !!token;
  const cachedWorkflowForPage = shouldFetchWorkflow && cacheKey ? getCachedWorkflow(cacheKey) : undefined;

  useEffect(() => {
    if (!shouldFetchWorkflow || cachedWorkflowForPage !== undefined) return;
    let ignore = false;
    fetchLatestWorkflowRun(owner!, repo!, branch!, token).then((wf) => {
      if (ignore) return;
      setCachedWorkflow(cacheKey!, wf);
      setLocalWorkflow(wf);
    }).catch(() => {
      if (!ignore) setLocalWorkflow(null);
    });
    return () => { ignore = true; };
  }, [cacheKey, owner, repo, branch, token, shouldFetchWorkflow, cachedWorkflowForPage]);

  const resolvedWorkflow = branchData?.workflow ?? cachedWorkflowForPage ?? localWorkflow;

  const settledForKey = fetchState.key === cacheKey;
  const commits = cached ?? (settledForKey ? (fetchState.commits ?? []) : []);
  const error = settledForKey ? fetchState.error : null;
  const loading = cacheKey !== null && cached === null && !settledForKey;

  const workflow = resolvedWorkflow;
  const displayStatus = getWorkflowDisplayStatus(workflow ?? null);
  const cfg = STATUS_META[displayStatus];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {text.branch.backToDashboard}
      </Link>

      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold sm:text-2xl">
            {owner}/{repo}
          </h1>
          <Badge variant="secondary" className="gap-1.5">
            <GitBranch className="h-3 w-3" />
            {branch}
          </Badge>
          {(workflow !== undefined) && (
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

      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {text.branch.recentCommits}
      </h2>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-lg border p-4 ${cardClass(isGlass)}`}
            >
              <Skeleton className="mt-0.5 h-8 w-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {!loading && !error && commits.length === 0 && (
        <p className="text-sm text-muted-foreground">{text.branch.noCommits}</p>
      )}

      {!loading && !error && commits.length > 0 && (
        <div className="space-y-3">
          {commits.map((c) => (
            <CommitRow key={c.sha} commit={c} />
          ))}
        </div>
      )}
    </div>
  );
}
