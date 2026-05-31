import { useEffect, useRef, useState } from "react";
import type { TrackedBranch, BranchData, CommitInfo, WorkflowStatus } from "@/types";
import { fetchLatestCommit, fetchLatestWorkflowRun } from "@/services/github";
import { getCachedCommitInfo, setCachedCommitInfo, getCachedWorkflow, setCachedWorkflow, clearDashboardCache } from "@/services/cache";

type FetchResult = {
  data: BranchData;
  commitToCache: { key: string; value: CommitInfo } | null;
  workflowToCache: { key: string; value: WorkflowStatus | null } | null;
};

function fetchBranchData(branch: TrackedBranch, token: string): Promise<FetchResult> {
  const base: BranchData = { key: branch, commit: null, workflow: null, loading: true, error: null };
  const cacheKey = `${branch.owner}/${branch.repo}/${branch.branch}`;
  const cachedCommit = getCachedCommitInfo(cacheKey);
  const cachedWorkflow = getCachedWorkflow(cacheKey);
  if (cachedCommit !== undefined && cachedWorkflow !== undefined) {
    return Promise.resolve({ data: { ...base, commit: cachedCommit, workflow: cachedWorkflow, loading: false }, commitToCache: null, workflowToCache: null });
  }
  return Promise.all([
    cachedCommit !== undefined
      ? Promise.resolve({ value: cachedCommit, fresh: false })
      : fetchLatestCommit(branch.owner, branch.repo, branch.branch, token).then((c) => ({ value: c, fresh: true })),
    cachedWorkflow !== undefined
      ? Promise.resolve({ value: cachedWorkflow, fresh: false })
      : fetchLatestWorkflowRun(branch.owner, branch.repo, branch.branch, token).then(
          (w) => ({ value: w, fresh: true }),
          () => ({ value: null as WorkflowStatus | null, fresh: false }),
        ),
  ])
    .then(([commit, workflow]) => ({
      data: { ...base, commit: commit.value, workflow: workflow.value, loading: false },
      commitToCache: commit.fresh ? { key: cacheKey, value: commit.value } : null,
      workflowToCache: workflow.fresh ? { key: cacheKey, value: workflow.value } : null,
    }))
    .catch((err: Error) => ({ data: { ...base, loading: false, error: err.message }, commitToCache: null, workflowToCache: null }));
}

export function useBranchData(branches: TrackedBranch[], autoRefreshInterval: number, token: string) {
  const [data, setData] = useState<BranchData[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevTokenRef = useRef(token);

  useEffect(() => {
    if (!branches.length) {
      setData([]);
      return;
    }
    if (prevTokenRef.current !== token) {
      prevTokenRef.current = token;
      clearDashboardCache();
    }
    let ignore = false;
    setData(branches.map((b) => ({ key: b, commit: null, workflow: null, loading: true, error: null })));
    Promise.all(branches.map((b) => fetchBranchData(b, token))).then((results) => {
      if (!ignore) {
        results.forEach(({ commitToCache, workflowToCache }) => {
          if (commitToCache) setCachedCommitInfo(commitToCache.key, commitToCache.value);
          if (workflowToCache) setCachedWorkflow(workflowToCache.key, workflowToCache.value);
        });
        setData(results.map((r) => r.data));
      }
    });
    return () => { ignore = true; };
  }, [branches, refreshKey, token]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoRefreshInterval > 0) {
      timerRef.current = setInterval(() => setRefreshKey((k) => k + 1), autoRefreshInterval);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefreshInterval]);

  return { data };
}