export interface TrackedBranch {
  id: string;
  owner: string;
  repo: string;
  branch: string;
}

export interface CommitInfo {
  message: string;
  author: string;
  date: string;
  avatarUrl: string;
}

export interface CommitDetail extends CommitInfo {
  sha: string;
  url: string;
}

export type AnimatedBg = 'none' | 'matrix';
export type WorkflowStatusValue = 'queued' | 'in_progress' | 'completed' | 'waiting' | 'pending' | 'requested';

export interface WorkflowStatus {
  status: WorkflowStatusValue;
  conclusion: string | null;
  name: string;
  url: string;
}

export interface BranchData {
  key: TrackedBranch;
  commit: CommitInfo | null;
  workflow: WorkflowStatus | null;
  loading: boolean;
  error: string | null;
}

export function parseGitHubUrl(input: string): { owner: string; repo: string; branch: string | undefined } | null {
  const trimmed = input.trim();
  const stripped = trimmed
    .replace(/^https?:\/\//, '')
    .replace(/^github\.com\//, '')
    .replace(/\/+$/, '');
  const parts = stripped.split('/');
  if (parts.length < 2 || !parts[0] || !parts[1]) return null;
  const owner = parts[0];
  const repo = parts[1];
  if (parts[2] === 'tree' && parts[3]) {
    return { owner, repo, branch: parts.slice(3).join('/') };
  }
  if (parts[2] && parts[2] !== 'tree') {
    return { owner, repo, branch: parts.slice(2).join('/') };
  }
  return { owner, repo, branch: undefined };
}
