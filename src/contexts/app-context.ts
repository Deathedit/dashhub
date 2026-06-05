import { createContext, useContext } from 'react';
import type { TrackedBranch, AnimatedBg, BranchData } from '@/types';

export type AppContext = {
  branches: TrackedBranch[];
  setBranches: (value: TrackedBranch[] | ((prev: TrackedBranch[]) => TrackedBranch[])) => void;
  data: BranchData[];
  refreshTick: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  refreshInterval: number;
  setRefreshInterval: (value: number | ((prev: number) => number)) => void;
  cacheTtl: number;
  setCacheTtl: (value: number | ((prev: number) => number)) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  animatedBg: AnimatedBg;
  setAnimatedBg: (value: AnimatedBg | ((prev: AnimatedBg) => AnimatedBg)) => void;
  token: string;
  setToken: (value: string | ((prev: string) => string)) => void;
};

export const AppCtx = createContext<AppContext | null>(null);

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
