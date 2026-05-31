import { useEffect, useRef, useState } from "react";
import type { TrackedBranch, BranchData, CommitInfo, WorkflowStatus } from "@/types";
import { fetchLatestCommit, fetchLatestWorkflowRun } from "@/services/github";
import { getCachedCommitInfo, setCachedCommitInfo, getCachedWorkflow, setCachedWorkflow, clearAllCache } from "@/services/cache";

type FetchResult = {
  data: BranchData;
  commitToCache: { key: string; value: CommitInfo } | null;
  workflowToCache: { key: string; value: WorkflowStatus | null } | null;
};

function fetchBranchData(branch: TrackedBranch, token: string, force = false): Promise<FetchResult> {
  const base: BranchData = { key: branch, commit: null, workflow: null, loading: true, error: null };
  const cacheKey = `${branch.owner}/${branch.repo}/${branch.branch}`;
  const cachedCommit = force ? undefined : getCachedCommitInfo(cacheKey);
  const cachedWorkflow = force ? undefined : getCachedWorkflow(cacheKey);
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
  const [refreshing, setRefreshing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevTokenRef = useRef(token);
  const refreshingRef = useRef(false);

  useEffect(() => {
    if (!branches.length) {
      setData([]);
      return;
    }
    if (prevTokenRef.current !== token) {
      prevTokenRef.current = token;
      clearAllCache();
    }
    const isRefresh = refreshingRef.current;
    refreshingRef.current = false;
    let ignore = false;
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setRefreshing(false);
      setData(branches.map((b) => ({ key: b, commit: null, workflow: null, loading: true, error: null })));
    }
    Promise.all(branches.map((b) => fetchBranchData(b, token, isRefresh))).then((results) => {
      if (ignore) return;
      results.forEach(({ commitToCache, workflowToCache }) => {
        if (commitToCache) setCachedCommitInfo(commitToCache.key, commitToCache.value);
        if (workflowToCache) setCachedWorkflow(workflowToCache.key, workflowToCache.value);
      });
      // On a background refresh, keep the last-known-good row if its refetch errored.
      setData((prev) =>
        results.map((r) =>
          isRefresh && r.data.error
            ? (prev.find((d) => d.key.id === r.data.key.id && !d.error && d.commit) ?? r.data)
            : r.data,
        ),
      );
      if (isRefresh) setRefreshing(false);
    });
    return () => { ignore = true; };
  }, [branches, refreshKey, token]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoRefreshInterval > 0) {
      timerRef.current = setInterval(() => {
        refreshingRef.current = true;
        setRefreshKey((k) => k + 1);
      }, autoRefreshInterval);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefreshInterval]);

  return { data, isRefreshing: refreshing };
}