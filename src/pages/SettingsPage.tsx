import { useState } from "react";
import { useApp } from "@/App";
import { parseGitHubUrl } from "@/types";
import { BG_OPTIONS } from "@/components/Background";
import { useGlassActive, cardClass, subtleClass } from "@/hooks/useGlass";
import { fetchDefaultBranch, verifyToken } from "@/services/github";
import { text } from "@/text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Loader2, CheckCircle2, XCircle, Moon, Sun, Check, X } from "lucide-react";

const MAX_BRANCHES = 50;

export default function SettingsPage() {
  const { branches, setBranches, token, setToken, autoRefresh, onToggleAutoRefresh, darkMode, onToggleDarkMode, animatedBg, setAnimatedBg } = useApp();
  const isGlass = useGlassActive();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const [tokenInput, setTokenInput] = useState(token);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; login?: string; error?: string } | null>(null);

  const handleAdd = async () => {
    setError("");
    const parsed = parseGitHubUrl(input);
    if (!parsed) {
      setError(text.errors.invalidFormat);
      return;
    }

    const { owner, repo, branch } = parsed;

    setAdding(true);
    let resolvedBranch: string;
    if (branch) {
      resolvedBranch = branch;
    } else {
      try {
        resolvedBranch = await fetchDefaultBranch(owner, repo, token);
      } catch (err) {
        setAdding(false);
        const msg = (err as Error).message ?? "";
        if (msg.includes("404")) {
          setError(text.errors.repoNotFound);
        } else if (msg.includes("403")) {
          setError(text.errors.rateLimit);
        } else {
          setError(text.errors.githubApiError);
        }
        return;
      }
    }
    setAdding(false);

    if (branches.length >= MAX_BRANCHES) {
      setError(text.errors.branchLimit(MAX_BRANCHES));
      return;
    }

    const id = `${owner}/${repo}/${resolvedBranch}`;
    if (branches.some((b) => b.id === id)) {
      setError(text.errors.alreadyTracked);
      return;
    }
    setBranches((prev) => [...prev, { id, owner, repo, branch: resolvedBranch }]);
    setInput("");
  };

  const handleRemove = (id: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));
  };

  const handleVerifyToken = async () => {
    setVerifying(true);
    setVerifyResult(null);
    const result = await verifyToken(tokenInput);
    setVerifyResult(result);
    setVerifying(false);
  };

  const handleSaveToken = () => {
    setToken(tokenInput);
    setVerifyResult(null);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-xl font-bold sm:mb-8 sm:text-2xl">{text.settings.title}</h1>

      <Card className={`mb-6 sm:mb-8 ${cardClass(isGlass)}`}>
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-wider uppercase">{text.settings.general}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant={autoRefresh ? "default" : "secondary"}
            size="default"
            onClick={onToggleAutoRefresh}
          >
            {autoRefresh ? text.settings.autoRefreshOn : text.settings.autoRefreshOff}
          </Button>
          <Button
            variant="secondary"
            size="default"
            onClick={onToggleDarkMode}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {darkMode ? text.settings.lightMode : text.settings.darkMode}
          </Button>
        </CardContent>
      </Card>

      {darkMode && (
        <Card className={`mb-6 sm:mb-8 ${cardClass(isGlass)}`}>
          <CardHeader>
            <CardTitle className="text-sm font-semibold tracking-wider uppercase">{text.settings.background}</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            {BG_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={animatedBg === opt.value ? "default" : "secondary"}
                size="default"
                onClick={() => setAnimatedBg(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className={`mb-6 sm:mb-8 ${cardClass(isGlass)}`}>
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-wider uppercase">{text.settings.tokenTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="min-w-0 flex-1">
              <Input
                type="password"
                placeholder={text.settings.tokenPlaceholder}
                value={tokenInput}
                onChange={(e) => { setTokenInput(e.target.value); setVerifyResult(null); }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="default"
                onClick={handleVerifyToken}
                disabled={!tokenInput.trim() || verifying}
              >
                {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {text.settings.verify}
              </Button>
              <Button
                variant="default"
                size="default"
                onClick={handleSaveToken}
              >
                {text.settings.save}
              </Button>
            </div>
          </div>
          {verifyResult && (
            <div className={`mt-2 flex items-center gap-1.5 text-sm ${
              verifyResult.valid ? "text-green-600 dark:text-green-400" : "text-destructive"
            }`}>
              {verifyResult.valid
                ? <><CheckCircle2 className="h-4 w-4" /> {text.settings.validAs} <span className="font-mono font-medium">{verifyResult.login}</span></>
                : <><XCircle className="h-4 w-4" /> {verifyResult.error}</>}
            </div>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {text.settings.tokenHelp}{" "}
            <a href={text.settings.createTokenUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {text.settings.createToken}
            </a>.
          </p>
        </CardContent>
      </Card>

      <Card className={`mb-6 sm:mb-8 ${cardClass(isGlass)}`}>
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-wider uppercase">{text.settings.addBranch}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="min-w-0 flex-1">
              <Input
                type="text"
                placeholder={text.settings.branchPlaceholder}
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && !adding && handleAdd()}
                disabled={adding}
              />
            </div>
            <Button
              variant="default"
              size="default"
              onClick={handleAdd}
              disabled={!input.trim() || adding}
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {adding ? text.settings.resolving : text.settings.add}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {text.settings.branchHelpPrefix} <span className="font-mono">{text.settings.branchHelpFormat}</span> {text.settings.branchHelpSuffix}
          </p>
          {error && (
            <p className="mt-2 text-sm text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>

      <Card className={cardClass(isGlass)}>
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-wider uppercase">{text.settings.trackedBranches(branches.length)}</CardTitle>
        </CardHeader>
        <CardContent>
          {branches.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {text.settings.noBranches}
            </p>
          )}
          <ul className="space-y-2 max-h-80 overflow-y-auto scrollbar-hidden">
            {branches.map((b) => (
              <li
                key={b.id}
                className={`flex items-center justify-between rounded-md border p-3 ${subtleClass(isGlass)}`}
              >
                <span className="min-w-0 truncate text-sm">
                  <span className="font-medium">{b.owner}/{b.repo}</span>
                  <span className="text-muted-foreground"> / </span>
                  <span className="text-primary">{b.branch}</span>
                </span>
                {pendingDelete === b.id ? (
                  <div className="ml-3 flex shrink-0 gap-1">
                    <Button
                      variant="destructive"
                      size="icon-xs"
                      onClick={() => { handleRemove(b.id); setPendingDelete(null); }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-xs"
                      onClick={() => setPendingDelete(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="ml-3 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => setPendingDelete(b.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}