import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useApp } from '@/contexts/app-context';
import { fetchCommits, fetchLatestWorkflowRun } from '@/services/github';
import { getCachedCommits, setCachedCommits, getCachedWorkflow, setCachedWorkflow } from '@/services/cache';
import type { CommitDetail, WorkflowStatus } from '@/types';
import { text } from '@/constants/text';
import { ArrowLeft } from 'lucide-react';
import { CommitRow } from '@/components/branch/CommitRow';
import { BranchHeader } from '@/components/branch/BranchHeader';
import { CommitListSkeleton } from '@/components/branch/CommitListSkeleton';

const COMMITS_PER_PAGE = 13;

export default function BranchPage() {
  const {
    owner,
    repo,
    '*': branch,
  } = useParams<{ owner: string; repo: string; '*': string }>();
  const { data, token } = useApp();

  const cacheKey = owner && repo && branch ? `${owner}/${repo}/${branch}` : '';
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
  const [workflowError, setWorkflowError] = useState(false);

  const branchData = cacheKey
    ? data.find(
        (d) =>
          d.key.owner === owner && d.key.repo === repo && d.key.branch === branch,
      )
    : undefined;

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, cached, token]);

  const shouldFetchWorkflow = branchData?.workflow === undefined && !!cacheKey && !!owner && !!repo && !!branch && !!token;
  const cachedWorkflowForPage = shouldFetchWorkflow && cacheKey ? getCachedWorkflow(cacheKey) : undefined;

  useEffect(() => {
    if (!shouldFetchWorkflow || cachedWorkflowForPage !== undefined) return;
    let ignore = false;
    fetchLatestWorkflowRun(owner!, repo!, branch!, token).then((wf) => {
      if (ignore) return;
      setCachedWorkflow(cacheKey, wf);
      setLocalWorkflow(wf);
      setWorkflowError(false);
    }).catch(() => {
      if (!ignore) {
        setLocalWorkflow(null);
        setWorkflowError(true);
      }
    });
    return () => { ignore = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, shouldFetchWorkflow, cachedWorkflowForPage, token]);

  if (!owner || !repo || !branch) {
    return <Navigate to="/" replace />;
  }

  const resolvedWorkflow = branchData?.workflow ?? cachedWorkflowForPage ?? localWorkflow;

  const settledForKey = fetchState.key === cacheKey;
  const commits = cached ?? (settledForKey ? (fetchState.commits ?? []) : []);
  const error = settledForKey ? fetchState.error : null;
  const loading = cacheKey !== '' && cached === null && !settledForKey;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {text.branch.backToDashboard}
      </Link>

      <BranchHeader
        owner={owner}
        repo={repo}
        branch={branch}
        workflow={resolvedWorkflow}
        workflowError={workflowError}
      />

      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {text.branch.recentCommits}
      </h2>

      {loading && <CommitListSkeleton />}

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