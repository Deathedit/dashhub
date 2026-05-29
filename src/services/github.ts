import type { CommitInfo, CommitDetail, WorkflowStatus, WorkflowStatusValue } from "../types";

const API = "https://api.github.com";

async function fetchJSON<T>(url: string, token: string): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", Authorization: `token ${token}` };
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchLatestCommit(owner: string, repo: string, branch: string, token: string): Promise<CommitInfo> {
  const data = await fetchJSON<Record<string, unknown>[]>(
    `${API}/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(branch)}&per_page=1`,
    token,
  );
  if (!data.length) throw new Error("No commits found");
  const c = data[0];
  const commit = c.commit as Record<string, unknown>;
  const author = commit.author as Record<string, unknown> | undefined;
  return {
    message: (commit.message as string) ?? "",
    author: (author?.name as string) ?? ((c.author as Record<string, unknown>)?.login as string) ?? "unknown",
    date: (author?.date as string) ?? ((commit.committer as Record<string, unknown>)?.date as string) ?? "",
    avatarUrl: ((c.author as Record<string, unknown>)?.avatar_url as string) ?? "",
  };
}

export async function fetchLatestWorkflowRun(
  owner: string,
  repo: string,
  branch: string,
  token: string,
): Promise<WorkflowStatus | null> {
  try {
    const data = await fetchJSON<Record<string, unknown>>(
      `${API}/repos/${owner}/${repo}/actions/runs?branch=${encodeURIComponent(branch)}&per_page=1`,
      token,
    );
    const runs = data.workflow_runs as Record<string, unknown>[] | undefined;
    if (!runs || runs.length === 0) return null;
    const run = runs[0];
    return {
      status: (run.status as WorkflowStatusValue) ?? "queued",
      conclusion: (run.conclusion as string | null) ?? null,
      name: (run.name as string) ?? "CI",
      url: (run.html_url as string) ?? "",
    };
  } catch {
    return null;
  }
}

export function getWorkflowDisplayStatus(
  workflow: WorkflowStatus | null,
): "success" | "failure" | "in_progress" | "unknown" {
  if (!workflow) return "unknown";
  if (workflow.status === "completed") {
    return workflow.conclusion === "success" ? "success" : "failure";
  }
  if (workflow.status === "in_progress" || workflow.status === "queued") return "in_progress";
  return "unknown";
}

export async function fetchDefaultBranch(owner: string, repo: string, token: string): Promise<string> {
  const data = await fetchJSON<Record<string, unknown>>(
    `${API}/repos/${owner}/${repo}`,
    token,
  );
  return (data.default_branch as string) ?? "main";
}

export async function verifyToken(token: string): Promise<{ valid: boolean; login?: string; error?: string }> {
  try {
    const data = await fetchJSON<Record<string, unknown>>(
      `${API}/user`,
      token,
    );
    return { valid: true, login: data.login as string };
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
  const data = await fetchJSON<Record<string, unknown>[]>(
    `${API}/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(branch)}&per_page=${perPage}`,
    token,
  );
  return data.map((c) => {
    const commit = c.commit as Record<string, unknown>;
    const author = commit.author as Record<string, unknown> | undefined;
    return {
      sha: (c.sha as string) ?? "",
      message: ((commit.message as string) ?? "").split("\n")[0],
      author: (author?.name as string) ?? ((c.author as Record<string, unknown>)?.login as string) ?? "unknown",
      date: (author?.date as string) ?? ((commit.committer as Record<string, unknown>)?.date as string) ?? "",
      avatarUrl: ((c.author as Record<string, unknown>)?.avatar_url as string) ?? "",
      url: ((c.html_url as string) ?? ""),
    };
  });
}