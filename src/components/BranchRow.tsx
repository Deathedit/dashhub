import { Link } from "react-router-dom";
import type { BranchData } from "@/types";
import { getWorkflowDisplayStatus } from "@/services/github";
import { useGlassActive, cardClass } from "@/hooks/useGlass";
import { text, relativeTime } from "@/text";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ExternalLink, GitBranch, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const statusConfig: Record<string, { border: string; icon: React.ReactNode; label: string; variant: "default" | "destructive" | "secondary" | "outline" | "ghost"; className?: string }> = {
  success: {
    border: "border-l-green-500 dark:border-l-green-400",
    icon: <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />,
    label: text.status.passing,
    variant: "ghost",
    className: "text-green-600 dark:text-green-400",
  },
  failure: {
    border: "border-l-red-500 dark:border-l-red-400",
    icon: <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />,
    label: text.status.failed,
    variant: "destructive",
  },
  in_progress: {
    border: "border-l-yellow-500 dark:border-l-yellow-400",
    icon: <Loader2 className="h-4 w-4 animate-spin text-yellow-600 dark:text-yellow-400" />,
    label: text.status.inProgress,
    variant: "secondary",
  },
  unknown: {
    border: "border-l-border",
    icon: <GitBranch className="h-4 w-4 text-muted-foreground" />,
    label: text.status.noCi,
    variant: "outline",
  },
};

export default function BranchRow({ branch }: { branch: BranchData }) {
  const { key, commit, workflow, loading, error } = branch;
  const displayStatus = getWorkflowDisplayStatus(workflow);
  const cfg = statusConfig[displayStatus];
  const isGlass = useGlassActive();

  if (loading) return null;

  const detailPath = `/${key.owner}/${key.repo}/${key.branch}`;
  const githubUrl = `https://github.com/${key.owner}/${key.repo}/tree/${key.branch}`;

  return (
    <Link
      to={detailPath}
      className={`flex items-start gap-3 rounded-lg border border-l-4 p-4 transition-shadow hover:shadow-md ${cfg.border} ${cardClass(isGlass)}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold">
            {key.owner}/{key.repo}
          </span>
          <Badge variant="secondary" className="gap-1">
            <GitBranch className="h-3 w-3" />
            {key.branch}
          </Badge>
          <span className={cn("inline-flex items-center gap-1 text-xs font-medium", cfg.className)}>
            {cfg.icon}
            {cfg.label}
          </span>
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-destructive">
            {error.includes("404")
              ? text.errors.repoOrBranchNotFound
              : error.includes("403")
                ? <>API rate limit reached. <Link to="/settings" className="underline hover:text-destructive/80">{text.errors.addToken}</Link> to increase your limit.</>
                : error}
          </p>
        )}

        {commit && (
          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            <Avatar className="h-4 w-4">
              {commit.avatarUrl && <AvatarImage src={commit.avatarUrl} alt="" />}
              <AvatarFallback className="text-[8px]">{commit.author.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="truncate text-foreground">{commit.message.split("\n")[0]}</span>
            <span className="shrink-0 font-medium">{commit.author}</span>
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
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title={text.branch.openOnGitHub}
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </span>
    </Link>
  );
}