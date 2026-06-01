import type { CommitInfo, CommitDetail, WorkflowStatus } from '@/types';

const CACHE_TTL_MS = 60 * 60 * 1000;

const commitDetailCache = new Map<
  string,
  { data: CommitDetail[]; timestamp: number }
>();
const commitInfoCache = new Map<
  string,
  { data: CommitInfo; timestamp: number }
>();
const workflowCache = new Map<
  string,
  { data: WorkflowStatus | null; timestamp: number }
>();

function get<T>(
  map: Map<string, { data: T; timestamp: number }>,
  key: string,
): T | undefined {
  const entry = map.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    map.delete(key);
    return undefined;
  }
  return entry.data;
}

function set<T>(
  map: Map<string, { data: T; timestamp: number }>,
  key: string,
  data: T,
): void {
  map.set(key, { data, timestamp: Date.now() });
}

export function getCachedCommits(key: string): CommitDetail[] | null {
  return get(commitDetailCache, key) ?? null;
}

export function setCachedCommits(key: string, data: CommitDetail[]): void {
  set(commitDetailCache, key, data);
}

export function getCachedCommitInfo(key: string): CommitInfo | undefined {
  return get(commitInfoCache, key);
}

export function setCachedCommitInfo(key: string, data: CommitInfo): void {
  set(commitInfoCache, key, data);
}

export function getCachedWorkflow(
  key: string,
): WorkflowStatus | null | undefined {
  return get(workflowCache, key);
}

export function setCachedWorkflow(
  key: string,
  data: WorkflowStatus | null,
): void {
  set(workflowCache, key, data);
}

export function clearAllCache(): void {
  commitDetailCache.clear();
  commitInfoCache.clear();
  workflowCache.clear();
}
