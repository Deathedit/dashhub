import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getCachedCommits,
  setCachedCommits,
  getCachedCommitInfo,
  setCachedCommitInfo,
  getCachedWorkflow,
  setCachedWorkflow,
  clearAllCache,
  setCacheTtlMs,
} from '@/services/cache';
import type { CommitInfo, WorkflowStatus } from '@/types';

beforeEach(() => {
  clearAllCache();
});

describe('commit detail cache', () => {
  it('returns null on cache miss', () => {
    expect(getCachedCommits('owner/repo/branch')).toBeNull();
  });

  it('stores and retrieves commit details', () => {
    const data = [
      {
        sha: 'abc123',
        message: 'fix: bug',
        author: 'alice',
        date: '2024-01-01',
        avatarUrl: '',
        url: '',
      },
    ];
    setCachedCommits('owner/repo/branch', data);
    expect(getCachedCommits('owner/repo/branch')).toEqual(data);
  });

  it('clears all caches', () => {
    setCachedCommits('k1', []);
    clearAllCache();
    expect(getCachedCommits('k1')).toBeNull();
  });
});

describe('commit info cache', () => {
  it('returns undefined on cache miss', () => {
    expect(getCachedCommitInfo('owner/repo/branch')).toBeUndefined();
  });

  it('stores and retrieves commit info', () => {
    const info: CommitInfo = {
      message: 'fix: bug',
      author: 'alice',
      date: '2024-01-01',
      avatarUrl: '',
    };
    setCachedCommitInfo('owner/repo/branch', info);
    expect(getCachedCommitInfo('owner/repo/branch')).toEqual(info);
  });
});

describe('workflow cache', () => {
  it('returns undefined on cache miss', () => {
    expect(getCachedWorkflow('owner/repo/branch')).toBeUndefined();
  });

  it('stores and retrieves workflow status', () => {
    const wf: WorkflowStatus = {
      status: 'completed',
      conclusion: 'success',
      name: 'CI',
      url: 'https://github.com',
    };
    setCachedWorkflow('owner/repo/branch', wf);
    expect(getCachedWorkflow('owner/repo/branch')).toEqual(wf);
  });

  it('stores null workflow', () => {
    setCachedWorkflow('owner/repo/branch', null);
    expect(getCachedWorkflow('owner/repo/branch')).toBeNull();
  });
});

describe('configurable cache TTL', () => {
  const DEFAULT_TTL_MS = 60 * 60 * 1000;

  afterEach(() => {
    setCacheTtlMs(DEFAULT_TTL_MS);
  });

  it('expires entries once they exceed the configured TTL', async () => {
    setCacheTtlMs(0);
    setCachedCommits('owner/repo/branch', []);
    await new Promise((r) => setTimeout(r, 1));
    expect(getCachedCommits('owner/repo/branch')).toBeNull();
  });

  it('retains entries while within the configured TTL', () => {
    setCacheTtlMs(60_000);
    const info: CommitInfo = { message: 'm', author: 'a', date: '', avatarUrl: '' };
    setCachedCommitInfo('k', info);
    expect(getCachedCommitInfo('k')).toEqual(info);
  });
});

describe('cache isolation', () => {
  it('different caches do not interfere with each other', () => {
    setCachedCommits('k', []);
    setCachedCommitInfo('k', {
      message: 'test',
      author: 'bob',
      date: '',
      avatarUrl: '',
    });
    setCachedWorkflow('k', null);

    expect(getCachedCommits('k')).toEqual([]);
    expect(getCachedCommitInfo('k')).toEqual({
      message: 'test',
      author: 'bob',
      date: '',
      avatarUrl: '',
    });
    expect(getCachedWorkflow('k')).toBeNull();
  });
});
