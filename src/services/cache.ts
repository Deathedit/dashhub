import type { CommitDetail } from "../types";

const CACHE_TTL_MS = 60 * 60 * 1000;

const commitCache = new Map<string, { data: CommitDetail[]; timestamp: number }>();

export function getCachedCommits(key: string): CommitDetail[] | null {
  const entry = commitCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    commitCache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCachedCommits(key: string, data: CommitDetail[]): void {
  commitCache.set(key, { data, timestamp: Date.now() });
}

export function clearCommitCache(): void {
  commitCache.clear();
}