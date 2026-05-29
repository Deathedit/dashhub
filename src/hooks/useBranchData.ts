import { useState, useEffect, useRef } from "react";
import type { TrackedBranch, BranchData } from "../types";
import { fetchLatestCommit, fetchLatestWorkflowRun } from "../services/github";
import { clearCommitCache } from "../services/cache";

function fetchBranchData(branch: TrackedBranch, token?: string): Promise<BranchData> {
  const base: BranchData = { key: branch, commit: null, workflow: null, loading: true, error: null };
  return Promise.all([
    fetchLatestCommit(branch.owner, branch.repo, branch.branch, token),
    fetchLatestWorkflowRun(branch.owner, branch.repo, branch.branch, token),
  ])
    .then(([commit, workflow]) => ({ ...base, commit, workflow, loading: false }))
    .catch((err: Error) => ({ ...base, loading: false, error: err.message }));
}

export function useBranchData(branches: TrackedBranch[], autoRefreshInterval: number, token?: string) {
  const [data, setData] = useState<BranchData[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!branches.length) {
      setData([]);
      return;
    }
    clearCommitCache();
    setData(branches.map((b) => ({ key: b, commit: null, workflow: null, loading: true, error: null })));
    Promise.all(branches.map((b) => fetchBranchData(b, token))).then(setData);
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