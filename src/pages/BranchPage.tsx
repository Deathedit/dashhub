import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useApp } from "@/App";
import { useGlassActive, cardClass } from "@/hooks/useGlass";
import { fetchCommits } from "@/services/github";
import { getWorkflowDisplayStatus } from "@/services/github";
import { getCachedCommits, setCachedCommits } from "@/services/cache";
import type { CommitDetail } from "@/types";
import { text, relativeTime } from "@/text";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowLeft, GitBranch, CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";

const COMMITS_PER_PAGE = 13;

const statusConfig: Record<string, { icon: React.ReactNode; label: string; variant: "default" | "destructive" | "secondary" | "outline" | "ghost"; className?: string }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 transition-colors hover:text-green-700 dark:hover:text-green-300" />,
    label: text.status.passing,
    variant: "ghost",
    className: "text-green-600 dark:text-green-400 hover:bg-transparent hover:text-green-600 dark:hover:text-green-400",
  },
  failure: {
    icon: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
    label: text.status.failed,
    variant: "destructive",
  },
  in_progress: {
    icon: <Loader2 className="h-5 w-5 animate-spin text-yellow-600 dark:text-yellow-400" />,
    label: text.status.inProgress,
    variant: "secondary",
  },
  unknown: {
    icon: <GitBranch className="h-5 w-5 text-muted-foreground" />,
    label: text.status.noCi,
    variant: "outline",
  },
};

function CommitRow({ commit }: { commit: CommitDetail }) {
  const isGlass = useGlassActive();
  return (
    <a
      href={commit.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-start gap-3 rounded-lg border p-4 transition-shadow hover:shadow-md ${cardClass(isGlass)}`}
    >
      <Avatar className="mt-0.5 h-8 w-8 shrink-0">
        {commit.avatarUrl && <AvatarImage src={commit.avatarUrl} alt="" />}
        <AvatarFallback className="text-xs font-medium">
          {commit.author.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{commit.message}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono text-muted-foreground/70">{commit.sha.slice(0, 7)}</span>
          <span className="font-medium">{commit.author}</span>
          {commit.date && <span>{relativeTime(commit.date)}</span>}
        </div>
      </div>
      <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/50" />
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
  const isGlass = useGlassActive();

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
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {text.branch.backToDashboard}
      </Link>

      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold sm:text-2xl">
            {owner}/{repo}
          </h1>
          <Badge variant="secondary" className="gap-1.5">
            <GitBranch className="h-3 w-3" />
            {branch}
          </Badge>
          {branchData && (
            <Badge variant={cfg.variant} className={cn("gap-1.5", cfg.className)}>
              {cfg.icon}
              {cfg.label}
              {workflow?.url && (
                <a
                  href={workflow.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-0.5 text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </Badge>
          )}
        </div>
      </div>

      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {text.branch.recentCommits}
      </h2>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`flex items-start gap-3 rounded-lg border p-4 ${cardClass(isGlass)}`}>
              <Skeleton className="mt-0.5 h-8 w-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
      )}

      {!loading && !error && commits.length === 0 && (
        <p className="text-sm text-muted-foreground">{text.branch.noCommits}</p>
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