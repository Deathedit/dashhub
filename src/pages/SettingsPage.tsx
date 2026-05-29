import { useState } from "react";
import { useApp } from "../App";
import { parseGitHubUrl } from "../types";
import { fetchDefaultBranch, verifyToken } from "../services/github";
import { Plus, Trash2, Loader2, CheckCircle2, XCircle, Moon, Sun } from "lucide-react";

const MAX_BRANCHES = 50;

export default function SettingsPage() {
  const { branches, setBranches, token, setToken, autoRefresh, onToggleAutoRefresh, darkMode, onToggleDarkMode } = useApp();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  const [tokenInput, setTokenInput] = useState(token);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; login?: string; error?: string } | null>(null);

  const handleAdd = async () => {
    setError("");
    const parsed = parseGitHubUrl(input);
    if (!parsed) {
      setError("Invalid format. Paste a GitHub URL or owner/repo/branch.");
      return;
    }

    const { owner, repo, branch } = parsed;

    setAdding(true);
    let resolvedBranch: string;
    if (branch) {
      resolvedBranch = branch;
    } else {
      try {
        resolvedBranch = await fetchDefaultBranch(owner, repo, token || undefined);
      } catch (err) {
        setAdding(false);
        const msg = (err as Error).message ?? "";
        if (msg.includes("404")) {
          setError("Repository not found. Check the owner/repo name.");
        } else if (msg.includes("403")) {
          setError("GitHub API rate limit reached. Add a Personal Access Token above to continue.");
        } else {
          setError(msg);
        }
        return;
      }
    }
    setAdding(false);

    if (branches.length >= MAX_BRANCHES) {
      setError(`Limit of ${MAX_BRANCHES} branches reached.`);
      return;
    }

    const id = `${owner}/${repo}/${resolvedBranch}`;
    if (branches.some((b) => b.id === id)) {
      setError("This branch is already being tracked.");
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
      <h1 className="mb-6 text-xl font-bold text-gray-900 sm:mb-8 sm:text-2xl dark:text-white">Settings</h1>

      <section className="mb-6 sm:mb-8 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-3 sm:mb-4 text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
          General
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onToggleAutoRefresh}
            className={`inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              autoRefresh
                ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-400 dark:hover:bg-green-900/60"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {autoRefresh ? "Auto-refresh: On" : "Auto-refresh: Off"}
          </button>
          <button
            onClick={onToggleDarkMode}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </section>

      <section className="mb-6 sm:mb-8 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-3 sm:mb-4 text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
          GitHub Token
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="password"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            value={tokenInput}
            onChange={(e) => { setTokenInput(e.target.value); setVerifyResult(null); }}
            className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          />
          <div className="flex gap-2">
            <button
              onClick={handleVerifyToken}
              disabled={!tokenInput.trim() || verifying}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Verify
            </button>
            <button
              onClick={handleSaveToken}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
        {verifyResult && (
          <div className={`mt-2 flex items-center gap-1.5 text-sm ${
            verifyResult.valid ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }`}>
            {verifyResult.valid
              ? <><CheckCircle2 className="h-4 w-4" /> Valid — authenticated as <span className="font-mono font-medium">{verifyResult.login}</span></>
              : <><XCircle className="h-4 w-4" /> {verifyResult.error}</>}
          </div>
        )}
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Optional. A Personal Access Token increases the API rate limit from 60 to 5,000 requests/hour. No scopes are needed for public repos.{" "}
          <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            Create one here
          </a>.
        </p>
      </section>

      <section className="mb-6 sm:mb-8 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-3 sm:mb-4 text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
          Add Branch
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="e.g. https://github.com/vitejs/vite/tree/main"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && !adding && handleAdd()}
            disabled={adding}
            className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          />
          <button
            onClick={handleAdd}
            disabled={!input.trim() || adding}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {adding ? "Resolving…" : "Add"}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Paste a GitHub URL or use <span className="font-mono">owner/repo/branch</span> format. The default branch is auto-detected if omitted.
        </p>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
          Tracked Branches ({branches.length})
        </h2>
        {branches.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            No branches tracked yet. Add one above to get started.
          </p>
        )}
        <ul className="space-y-2">
          {branches.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/50"
            >
              <span className="min-w-0 truncate text-sm text-gray-800 dark:text-gray-200">
                <span className="font-medium">{b.owner}/{b.repo}</span>
                <span className="text-gray-400 dark:text-gray-500"> / </span>
                <span className="text-blue-600 dark:text-blue-400">{b.branch}</span>
              </span>
              <button
                onClick={() => handleRemove(b.id)}
                className="ml-3 shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}