import { useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { parseGitHubUrl } from '@/types';
import { useGlassActive, cardClass, subtleClass } from '@/lib/glass';
import { fetchDefaultBranch } from '@/services/github';
import { text } from '@/constants/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Loader2, Check, X } from 'lucide-react';

const MAX_BRANCHES = 50;

export function BranchManager() {
  const { branches, setBranches, token } = useApp();
  const isGlass = useGlassActive();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const handleAdd = async () => {
    setError('');
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
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('404')) {
          setError(text.errors.repoNotFound);
        } else if (msg.includes('403')) {
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
    setInput('');
  };

  const handleRemove = (id: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <>
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
                onChange={(e) => {
                  setInput(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && !adding && handleAdd()}
                disabled={adding}
              />
            </div>
            <Button variant="default" size="default" onClick={handleAdd} disabled={!input.trim() || adding}>
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {adding ? text.settings.resolving : text.settings.add}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {text.settings.branchHelpPrefix} <span className="font-mono">{text.settings.branchHelpFormat}</span> {text.settings.branchHelpSuffix}
          </p>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Card className={cardClass(isGlass)}>
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-wider uppercase">{text.settings.trackedBranches(branches.length)}</CardTitle>
        </CardHeader>
        <CardContent>
          {branches.length === 0 && <p className="text-sm text-muted-foreground">{text.settings.noBranches}</p>}
          <ul className="space-y-2 max-h-80 overflow-y-auto scrollbar-hidden">
            {branches.map((b) => (
              <li key={b.id} className={`flex items-center justify-between rounded-md border p-3 ${subtleClass(isGlass)}`}>
                <span className="min-w-0 truncate text-sm">
                  <span className="font-medium">
                    {b.owner}/{b.repo}
                  </span>
                  <span className="text-muted-foreground"> / </span>
                  <span className="text-primary">{b.branch}</span>
                </span>
                {pendingDelete === b.id ? (
                  <div className="ml-3 flex shrink-0 gap-1">
                    <Button
                      variant="destructive"
                      size="icon-xs"
                      onClick={() => {
                        handleRemove(b.id);
                        setPendingDelete(null);
                      }}
                      aria-label="Confirm delete"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon-xs" onClick={() => setPendingDelete(null)} aria-label="Cancel delete">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="ml-3 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => setPendingDelete(b.id)}
                    aria-label="Delete branch"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
