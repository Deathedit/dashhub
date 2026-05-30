import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useApp } from "../App";
import { useGlass } from "../hooks/useGlass";
import { fetchCommits } from "../services/github";
import { getWorkflowDisplayStatus } from "../services/github";
import { getCachedCommits, setCachedCommits } from "../services/cache";
import type { CommitDetail } from "../types";
import { text, relativeTime } from "../text";
import { ArrowLeft, GitBranch, CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";

const COMMITS_PER_PAGE = 13;

const statusConfig: Record<string, { icon: React.ReactNode; label: string; textColor: string; bgColor: string }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />,
    label: text.status.passing,
    textColor: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/40",
  },
  failure: {
    icon: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
    label: text.status.failed,
    textColor: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/40",
  },
  in_progress: {
    icon: <Loader2 className="h-5 w-5 animate-spin text-yellow-600 dark:text-yellow-400" />,
    label: text.status.inProgress,
    textColor: "text-yellow-700 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/40",
  },
  unknown: {
    icon: <GitBranch className="h-5 w-5 text-gray-400 dark:text-gray-500" />,
    label: text.status.noCi,
    textColor: "text-gray-500 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-800/50",
  },
};

function CommitRow({ commit }: { commit: CommitDetail }) {
  const glass = useGlass();
  return (
    <a
      href={commit.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-start gap-3 rounded-lg border border-gray-100 p-4 transition-shadow hover:shadow-md dark:border-gray-800 ${glass.card}`}
    >
      {commit.avatarUrl ? (
        <img src={commit.avatarUrl} alt="" className="mt-0.5 h-8 w-8 shrink-0 rounded-full" />
      ) : (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {commit.author.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">{commit.message}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-mono text-gray-400 dark:text-gray-500">{commit.sha.slice(0, 7)}</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{commit.author}</span>
          {commit.date && <span>{relativeTime(commit.date)}</span>}
        </div>
      </div>
      <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" />
    </a>
  );
}

export default function BranchPage() {
  const { owner, repo, branch } = useParams<{ owner: string; repo: string; branch: string }>();
  const { data, token } = useApp();
  const [commits, setCommits] = useState<CommitDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const branchData = data.find(
    (d) => d.key.owner === owner && d.key.repo === repo && d.key.branch === branch,
  );
  const glass = useGlass();

  useEffect(() => {
    if (!owner || !repo || !branch) return;
    const cacheKey = `${owner}/${repo}/${branch}`;
    const cached = getCachedCommits(cacheKey);
    if (cached) {
      setCommits(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchCommits(owner, repo, branch, COMMITS_PER_PAGE, token)
      .then((data) => {
        setCachedCommits(cacheKey, data);
        setCommits(data);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [owner, repo, branch, token]);

  const displayStatus = branchData ? getWorkflowDisplayStatus(branchData.workflow) : "unknown";
  const cfg = statusConfig[displayStatus];
  const workflow = branchData?.workflow;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        {text.branch.backToDashboard}
      </Link>

      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
            {owner}/{repo}
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            <GitBranch className="h-3 w-3" />
            {branch}
          </span>
          {branchData && (
            <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium ${cfg.textColor} ${cfg.bgColor}`}>
              {cfg.icon}
              {cfg.label}
              {workflow?.url && (
                <a
                  href={workflow.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </span>
          )}
        </div>
      </div>

      <h2 className="mb-4 text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
        {text.branch.recentCommits}
      </h2>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`animate-pulse flex items-start gap-3 rounded-lg border border-gray-100 p-4 dark:border-gray-800 ${glass.card}`}>
              <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">{error}</p>
      )}

      {!loading && !error && commits.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500">{text.branch.noCommits}</p>
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