import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getWorkflowDisplayStatus } from '@/services/github';

describe('getWorkflowDisplayStatus', () => {
  it('returns unknown for null', () => {
    expect(getWorkflowDisplayStatus(null)).toBe('unknown');
  });

  it('returns success for completed with success conclusion', () => {
    expect(
      getWorkflowDisplayStatus({
        status: 'completed',
        conclusion: 'success',
        name: 'CI',
        url: '',
      }),
    ).toBe('success');
  });

  it('returns failure for completed with failure conclusion', () => {
    expect(
      getWorkflowDisplayStatus({
        status: 'completed',
        conclusion: 'failure',
        name: 'CI',
        url: '',
      }),
    ).toBe('failure');
  });

  it('returns unknown for completed with cancelled conclusion', () => {
    expect(
      getWorkflowDisplayStatus({
        status: 'completed',
        conclusion: 'cancelled',
        name: 'CI',
        url: '',
      }),
    ).toBe('unknown');
  });

  it('returns unknown for completed with skipped conclusion', () => {
    expect(
      getWorkflowDisplayStatus({
        status: 'completed',
        conclusion: 'skipped',
        name: 'CI',
        url: '',
      }),
    ).toBe('unknown');
  });

  it('returns unknown for completed with neutral conclusion', () => {
    expect(
      getWorkflowDisplayStatus({
        status: 'completed',
        conclusion: 'neutral',
        name: 'CI',
        url: '',
      }),
    ).toBe('unknown');
  });

  it('returns in_progress for running workflow', () => {
    expect(
      getWorkflowDisplayStatus({
        status: 'in_progress',
        conclusion: null,
        name: 'CI',
        url: '',
      }),
    ).toBe('in_progress');
  });

  it('returns in_progress for queued workflow', () => {
    expect(
      getWorkflowDisplayStatus({
        status: 'queued',
        conclusion: null,
        name: 'CI',
        url: '',
      }),
    ).toBe('in_progress');
  });

  it('returns unknown for unexpected status', () => {
    expect(
      getWorkflowDisplayStatus({
        status: 'waiting',
        conclusion: null,
        name: 'CI',
        url: '',
      }),
    ).toBe('unknown');
  });
});

describe('fetchJSON retry behavior', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not retry on 4xx errors', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: () => Promise.resolve('rate limited'),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { fetchLatestCommit } = await import('@/services/github');
    await expect(fetchLatestCommit('owner', 'repo', 'main', 'token')).rejects.toThrow();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    vi.restoreAllMocks();
  });

  it('retries on 5xx errors and succeeds on second attempt', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('internal server error'),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              sha: 'abc',
              commit: {
                message: 'test',
                author: { name: 'dev', date: '2024-01-01' },
              },
              author: { login: 'dev' },
            },
          ]),
      });
    vi.stubGlobal('fetch', mockFetch);

    vi.useFakeTimers();
    const { fetchLatestCommit } = await import('@/services/github');
    const promise = fetchLatestCommit('owner', 'repo', 'main', 'token');

    await vi.advanceTimersByTimeAsync(2000);
    const result = await promise;

    expect(result).toBeDefined();
    expect(mockFetch).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
});
