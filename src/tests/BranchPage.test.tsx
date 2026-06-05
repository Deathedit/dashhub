import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppCtx, type AppContext } from '@/contexts/app-context';
import type { CommitDetail } from '@/types';
import { clearAllCache } from '@/services/cache';
import BranchPage from '@/pages/BranchPage';

vi.mock('@/services/github', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/github')>()),
  fetchCommits: vi.fn(),
  fetchLatestWorkflowRun: vi.fn(),
}));

import { fetchCommits, fetchLatestWorkflowRun } from '@/services/github';

const mockFetchCommits = vi.mocked(fetchCommits);
const mockFetchWorkflow = vi.mocked(fetchLatestWorkflowRun);

function commit(message: string, sha: string): CommitDetail {
  return { message, author: 'octocat', date: '', avatarUrl: '', sha, url: `https://x/${sha}` };
}

function makeCtx(refreshTick: number): AppContext {
  return {
    branches: [],
    setBranches: () => {},
    data: [],
    refreshTick,
    collapsed: false,
    onToggleCollapse: () => {},
    autoRefresh: true,
    onToggleAutoRefresh: () => {},
    refreshInterval: 5,
    setRefreshInterval: () => {},
    cacheTtl: 60,
    setCacheTtl: () => {},
    darkMode: false,
    onToggleDarkMode: () => {},
    animatedBg: 'none',
    setAnimatedBg: () => {},
    token: 'tok',
    setToken: () => {},
  };
}

function renderPage(ctx: AppContext) {
  return render(
    <AppCtx.Provider value={ctx}>
      <MemoryRouter initialEntries={['/octo/repo/main']}>
        <Routes>
          <Route path='/:owner/:repo/*' element={<BranchPage />} />
        </Routes>
      </MemoryRouter>
    </AppCtx.Provider>,
  );
}

beforeEach(() => {
  clearAllCache();
  vi.clearAllMocks();
  mockFetchWorkflow.mockResolvedValue(null);
});

describe('BranchPage commit auto-refresh', () => {
  it('refreshes commits on tick without a skeleton flash', async () => {
    mockFetchCommits.mockResolvedValueOnce([commit('first commit', 'aaa')]).mockResolvedValueOnce([commit('second commit', 'bbb')]);

    const { rerender, container } = renderPage(makeCtx(0));
    await screen.findByText('first commit');

    rerender(
      <AppCtx.Provider value={makeCtx(1)}>
        <MemoryRouter initialEntries={['/octo/repo/main']}>
          <Routes>
            <Route path='/:owner/:repo/*' element={<BranchPage />} />
          </Routes>
        </MemoryRouter>
      </AppCtx.Provider>,
    );

    // During the silent refresh the old list stays put and no skeleton appears.
    expect(screen.getByText('first commit')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="skeleton"]')).toBeNull();

    await screen.findByText('second commit');
    expect(screen.queryByText('first commit')).toBeNull();
    expect(container.querySelector('[data-slot="skeleton"]')).toBeNull();
    expect(mockFetchCommits).toHaveBeenCalledTimes(2);
  });

  it('keeps the last-known-good list when a refresh fails', async () => {
    mockFetchCommits.mockResolvedValueOnce([commit('first commit', 'aaa')]).mockRejectedValueOnce(new Error('boom'));

    const { rerender, container } = renderPage(makeCtx(0));
    await screen.findByText('first commit');

    rerender(
      <AppCtx.Provider value={makeCtx(1)}>
        <MemoryRouter initialEntries={['/octo/repo/main']}>
          <Routes>
            <Route path='/:owner/:repo/*' element={<BranchPage />} />
          </Routes>
        </MemoryRouter>
      </AppCtx.Provider>,
    );

    await waitFor(() => expect(mockFetchCommits).toHaveBeenCalledTimes(2));
    expect(screen.getByText('first commit')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="skeleton"]')).toBeNull();
  });
});
