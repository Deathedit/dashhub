import { Link } from "react-router-dom";
import type { BranchData } from "../types";
import { getWorkflowDisplayStatus } from "../services/github";
import { useGlass } from "../hooks/useGlass";
import { text, relativeTime } from "../text";
import { GitBranch, CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";

const statusConfig: Record<string, { border: string; icon: React.ReactNode; label: string; textColor: string }> = {
  success: {
    border: "border-l-green-500 dark:border-l-green-400",
    icon: <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />,
    label: text.status.passing,
    textColor: "text-green-700 dark:text-green-400",
  },
  failure: {
    border: "border-l-red-500 dark:border-l-red-400",
    icon: <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />,
    label: text.status.failed,
    textColor: "text-red-700 dark:text-red-400",
  },
  in_progress: {
    border: "border-l-yellow-500 dark:border-l-yellow-400",
    icon: <Loader2 className="h-4 w-4 animate-spin text-yellow-600 dark:text-yellow-400" />,
    label: text.status.inProgress,
    textColor: "text-yellow-700 dark:text-yellow-400",
  },
  unknown: {
    border: "border-l-gray-300 dark:border-l-gray-600",
    icon: <GitBranch className="h-4 w-4 text-gray-400 dark:text-gray-500" />,
    label: text.status.noCi,
    textColor: "text-gray-500 dark:text-gray-400",
  },
};

export default function BranchRow({ branch }: { branch: BranchData }) {
  const { key, commit, workflow, loading, error } = branch;
  const displayStatus = getWorkflowDisplayStatus(workflow);
  const cfg = statusConfig[displayStatus];
  const glass = useGlass();

  if (loading) return null;

  const detailPath = `/${key.owner}/${key.repo}/${key.branch}`;
  const githubUrl = `https://github.com/${key.owner}/${key.repo}/tree/${key.branch}`;

  return (
    <Link
      to={detailPath}
      className={`flex items-start gap-3 rounded-lg border border-gray-100 border-l-4 p-4 transition-shadow hover:shadow-md dark:border-gray-800 ${glass.card} ${cfg.border}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {key.owner}/{key.repo}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            <GitBranch className="h-3 w-3" />
            {key.branch}
          </span>
          <span className={`inline-flex items-center gap-1 text-xs font-medium ${cfg.textColor}`}>
            {cfg.icon}
            {cfg.label}
          </span>
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
            {error.includes("404")
              ? text.errors.repoOrBranchNotFound
              : error.includes("403")
                ? <>API rate limit reached. <Link to="/settings" className="underline hover:text-red-800 dark:hover:text-red-300">{text.errors.addToken}</Link> to increase your limit.</>
                : error}
          </p>
        )}

        {commit && (
          <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            {commit.avatarUrl && (
              <img src={commit.avatarUrl} alt="" className="h-4 w-4 rounded-full" />
            )}
            <span className="truncate text-gray-700 dark:text-gray-300">{commit.message.split("\n")[0]}</span>
            <span className="shrink-0 font-medium text-gray-600 dark:text-gray-400">{commit.author}</span>
            {commit.date && <span className="shrink-0">{relativeTime(commit.date)}</span>}
          </div>
        )}
      </div>

      <span
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        className="inline-flex shrink-0"
      >
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          title={text.branch.openOnGitHub}
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </span>
    </Link>
  );
}