import type { TrackedBranch, BranchData, CommitInfo, WorkflowStatus } from '@/types';
import { fetchLatestCommit, fetchLatestWorkflowRun } from '@/services/github';
import { getCachedCommitInfo, getCachedWorkflow } from '@/services/cache';
import { branchKey } from '@/lib/utils';

export type FetchResult = {
  data: BranchData;
  commitToCache: { key: string; value: CommitInfo } | null;
  workflowToCache: { key: string; value: WorkflowStatus | null } | null;
};

export function fetchBranchData(branch: TrackedBranch, token: string, force = false): Promise<FetchResult> {
  const base: BranchData = {
    key: branch,
    commit: null,
    workflow: null,
    loading: true,
    error: null,
  };
  const cacheKey = branchKey(branch.owner, branch.repo, branch.branch);
  const cachedCommit = force ? undefined : getCachedCommitInfo(cacheKey);
  const cachedWorkflow = force ? undefined : getCachedWorkflow(cacheKey);
  if (cachedCommit !== undefined && cachedWorkflow !== undefined) {
    return Promise.resolve({
      data: {
        ...base,
        commit: cachedCommit,
        workflow: cachedWorkflow,
        loading: false,
      },
      commitToCache: null,
      workflowToCache: null,
    });
  }
  return Promise.all([
    cachedCommit !== undefined
      ? Promise.resolve({ value: cachedCommit, fresh: false })
      : fetchLatestCommit(branch.owner, branch.repo, branch.branch, token).then((c) => ({ value: c, fresh: true })),
    cachedWorkflow !== undefined
      ? Promise.resolve({ value: cachedWorkflow, fresh: false })
      : fetchLatestWorkflowRun(branch.owner, branch.repo, branch.branch, token).then(
          (w) => ({ value: w, fresh: true }),
          () => ({ value: null as WorkflowStatus | null, fresh: false }),
        ),
  ])
    .then(([commit, workflow]) => ({
      data: {
        ...base,
        commit: commit.value,
        workflow: workflow.value,
        loading: false,
      },
      commitToCache: commit.fresh ? { key: cacheKey, value: commit.value } : null,
      workflowToCache: workflow.fresh ? { key: cacheKey, value: workflow.value } : null,
    }))
    .catch((err: Error) => ({
      data: { ...base, loading: false, error: err.message },
      commitToCache: null,
      workflowToCache: null,
    }));
}
