import { describe, it, expect } from 'vitest';
import type { ReactElement } from 'react';
import { makeStatusIcons } from '@/lib/status-icons';

describe('makeStatusIcons', () => {
  it('returns icons for all display statuses', () => {
    const icons = makeStatusIcons('sm');
    expect(icons).toHaveProperty('success');
    expect(icons).toHaveProperty('failure');
    expect(icons).toHaveProperty('in_progress');
    expect(icons).toHaveProperty('unknown');
  });

  it('returns sm-sized icons', () => {
    const icons = makeStatusIcons('sm');
    for (const key of ['success', 'failure', 'in_progress', 'unknown'] as const) {
      const jsx = icons[key] as ReactElement;
      const className = (jsx.props as Record<string, unknown>).className as string;
      expect(className).toContain('h-4 w-4');
    }
  });

  it('returns lg-sized icons', () => {
    const icons = makeStatusIcons('lg');
    for (const key of ['success', 'failure', 'in_progress', 'unknown'] as const) {
      const jsx = icons[key] as ReactElement;
      const className = (jsx.props as Record<string, unknown>).className as string;
      expect(className).toContain('h-5 w-5');
    }
  });
});