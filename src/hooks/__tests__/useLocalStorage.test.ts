import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

beforeEach(() => {
  localStorage.clear();
});

describe('useLocalStorage', () => {
  it('returns default value when key is not set', () => {
    const { result } = renderHook(() => useLocalStorage('dashhub-test', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('persists value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('dashhub-test', 'initial'));
    act(() => {
      result.current[1]('updated');
    });
    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('dashhub-test')).toBe(JSON.stringify('updated'));
  });

  it('reads existing value from localStorage', () => {
    localStorage.setItem('dashhub-existing', JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('dashhub-existing', 'default'));
    expect(result.current[0]).toBe('stored');
  });

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorage<number[]>('dashhub-arr', []));
    act(() => {
      result.current[1]((prev) => [...prev, 1]);
    });
    act(() => {
      result.current[1]((prev) => [...prev, 2]);
    });
    expect(result.current[0]).toEqual([1, 2]);
  });
});