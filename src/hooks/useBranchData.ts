import { useEffect, useRef, useState } from 'react';
import type { TrackedBranch, BranchData } from '@/types';
import { fetchBranchData } from '@/services/fetchBranchData';
import { setCachedCommitInfo, setCachedWorkflow, clearAllCache } from '@/services/cache';

export function useBranchData(branches: TrackedBranch[], autoRefreshInterval: number, token: string) {
  const [data, setData] = useState<BranchData[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevTokenRef = useRef(token);
  const refreshingRef = useRef(false);

  useEffect(() => {
    if (!branches.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData((prev) => (prev.length === 0 ? prev : []));
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
      setData(
        branches.map((b) => ({
          key: b,
          commit: null,
          workflow: null,
          loading: true,
          error: null,
        })),
      );
    }
    Promise.all(branches.map((b) => fetchBranchData(b, token, isRefresh)))
      .then((results) => {
        if (ignore) return;
        results.forEach(({ commitToCache, workflowToCache }) => {
          if (commitToCache) setCachedCommitInfo(commitToCache.key, commitToCache.value);
          if (workflowToCache) setCachedWorkflow(workflowToCache.key, workflowToCache.value);
        });
        setData((prev) =>
          results.map((r) =>
            isRefresh && r.data.error ? (prev.find((d) => d.key.id === r.data.key.id && !d.error && d.commit) ?? r.data) : r.data,
          ),
        );
        if (isRefresh) setRefreshing(false);
      })
      .catch(() => {
        if (isRefresh) setRefreshing(false);
      });
    return () => {
      ignore = true;
    };
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
