import type {
  CommitInfo,
  CommitDetail,
  WorkflowStatus,
  WorkflowStatusValue,
} from '@/types';
import { text } from '@/constants/text';

const API = 'https://api.github.com';

interface GitHubCommitItem {
  sha?: string;
  html_url?: string;
  commit?: {
    message?: string;
    author?: { name?: string; date?: string };
    committer?: { date?: string };
  };
  author?: { login?: string; avatar_url?: string };
}

interface GitHubRun {
  status?: WorkflowStatusValue;
  conclusion?: string | null;
  name?: string;
  html_url?: string;
}

interface GitHubRunsResponse {
  workflow_runs?: GitHubRun[];
}

interface GitHubRepo {
  default_branch?: string;
}

interface GitHubUser {
  login?: string;
}

async function fetchJSON<T>(url: string, token: string, retries = 1): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  };
  if (token) headers.Authorization = `token ${token}`;
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const body = await res.text().catch(() => 'Unknown error');
      if (res.status >= 500 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
        continue;
      }
      throw new Error(`${text.errors.githubApiError} ${res.status}: ${body}`);
    }
    return res.json() as Promise<T>;
  }
}

function parseCommit(c: GitHubCommitItem): CommitInfo {
  const commit = c.commit;
  const author = commit?.author;
  return {
    message: commit?.message ?? '',
    author: author?.name ?? c.author?.login ?? 'unknown',
    date: author?.date ?? commit?.committer?.date ?? '',
    avatarUrl: c.author?.avatar_url ?? '',
  };
}

export async function fetchLatestCommit(
  owner: string,
  repo: string,
  branch: string,
  token: string,
): Promise<CommitInfo> {
  const data = await fetchJSON<GitHubCommitItem[]>(
    `${API}/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(branch)}&per_page=1`,
    token,
  );
  if (!data.length) throw new Error(text.errors.noCommits);
  return parseCommit(data[0]);
}

export async function fetchLatestWorkflowRun(
  owner: string,
  repo: string,
  branch: string,
  token: string,
): Promise<WorkflowStatus | null> {
  const data = await fetchJSON<GitHubRunsResponse>(
    `${API}/repos/${owner}/${repo}/actions/runs?branch=${encodeURIComponent(branch)}&per_page=1`,
    token,
  );
  const runs = data.workflow_runs;
  if (!runs || runs.length === 0) return null;
  const run = runs[0];
  return {
    status: run.status ?? 'queued',
    conclusion: run.conclusion ?? null,
    name: run.name ?? 'CI',
    url: run.html_url ?? '',
  };
}

export function getWorkflowDisplayStatus(
  workflow: WorkflowStatus | null,
): 'success' | 'failure' | 'in_progress' | 'unknown' {
  if (!workflow) return 'unknown';
  if (workflow.status === 'completed') {
    if (workflow.conclusion === 'success') return 'success';
    if (
      workflow.conclusion === 'cancelled' ||
      workflow.conclusion === 'skipped' ||
      workflow.conclusion === 'neutral'
    )
      return 'unknown';
    return 'failure';
  }
  if (workflow.status === 'in_progress' || workflow.status === 'queued')
    return 'in_progress';
  return 'unknown';
}

export async function fetchDefaultBranch(
  owner: string,
  repo: string,
  token: string,
): Promise<string> {
  const data = await fetchJSON<GitHubRepo>(
    `${API}/repos/${owner}/${repo}`,
    token,
  );
  return data.default_branch ?? 'main';
}

export async function verifyToken(
  token: string,
): Promise<{ valid: boolean; login?: string; error?: string }> {
  try {
    const data = await fetchJSON<GitHubUser>(`${API}/user`, token);
    return { valid: true, login: data.login };
  } catch (err) {
    return { valid: false, error: (err as Error).message };
  }
}

export async function fetchCommits(
  owner: string,
  repo: string,
  branch: string,
  perPage: number,
  token: string,
): Promise<CommitDetail[]> {
  const data = await fetchJSON<GitHubCommitItem[]>(
    `${API}/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(branch)}&per_page=${perPage}`,
    token,
  );
  return data.map((c) => {
    const base = parseCommit(c);
    return {
      ...base,
      message: base.message.split('\n')[0],
      sha: c.sha ?? '',
      url: c.html_url ?? '',
    };
  });
}
