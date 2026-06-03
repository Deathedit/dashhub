import { useEffect, useMemo, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useBranchData } from '@/hooks/useBranchData';
import type { TrackedBranch, AnimatedBg } from '@/types';
import { AppCtx, type AppContext } from '@/app-context';
import { text } from '@/text';
import Sidebar from '@/components/Sidebar';
import Background from '@/components/Background';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import DashboardPage from '@/pages/DashboardPage';
import SettingsPage from '@/pages/SettingsPage';
import BranchPage from '@/pages/BranchPage';
import { GlassProvider } from '@/hooks/useGlass';
import { useGlassActive, cardClass } from '@/lib/glass';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { KeyRound } from 'lucide-react';

function TokenRequired() {
  const isGlass = useGlassActive();
  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-14 md:pt-0">
      <Card className={`mx-auto max-w-md ${cardClass(isGlass)}`}>
        <CardContent className="p-8 text-center">
          <KeyRound className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-bold">
            {text.app.tokenRequired.title}
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            {text.app.tokenRequired.description}
          </p>
          <Button render={<Link to="/settings" />} nativeButton={false}>
            <KeyRound className="h-4 w-4" />
            {text.app.tokenRequired.goToSettings}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  const [branches, setBranches] = useLocalStorage<TrackedBranch[]>(
    'dashhub-branches',
    [],
  );
  const [autoRefresh, setAutoRefresh] = useLocalStorage<boolean>(
    'dashhub-auto-refresh',
    false,
  );
  const [darkMode, setDarkMode] = useLocalStorage<boolean>(
    'dashhub-dark-mode',
    () => {
      if (typeof window === 'undefined') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    },
  );
  const [collapsed, setCollapsed] = useLocalStorage<boolean>(
    'dashhub-sidebar-collapsed',
    true,
  );
  const [animatedBg, setAnimatedBg] = useLocalStorage<AnimatedBg>(
    'dashhub-animated-bg',
    'none',
  );
  const [token, setToken] = useLocalStorage<string>('dashhub-github-token', '');

  const hasToken = token.trim().length > 0;
  const branchesForHook = useMemo(
    () => (hasToken ? branches : []),
    [hasToken, branches],
  );
  const { data, isRefreshing } = useBranchData(
    branchesForHook,
    autoRefresh ? 300000 : 0,
    token,
  );
  const isFetching =
    (data.length > 0 && data.some((d) => d.loading)) || isRefreshing;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const onToggleCollapse = useCallback(
    () => setCollapsed((c) => !c),
    [setCollapsed],
  );
  const onToggleAutoRefresh = useCallback(
    () => setAutoRefresh((a) => !a),
    [setAutoRefresh],
  );
  const onToggleDarkMode = useCallback(
    () => setDarkMode((d) => !d),
    [setDarkMode],
  );

  const value = useMemo<AppContext>(
    () => ({
      branches,
      setBranches,
      data,
      collapsed,
      onToggleCollapse,
      autoRefresh,
      onToggleAutoRefresh,
      darkMode,
      onToggleDarkMode,
      animatedBg,
      setAnimatedBg,
      token,
      setToken,
    }),
    [
      branches,
      setBranches,
      data,
      collapsed,
      onToggleCollapse,
      autoRefresh,
      onToggleAutoRefresh,
      darkMode,
      onToggleDarkMode,
      animatedBg,
      setAnimatedBg,
      token,
      setToken,
    ],
  );

  return (
    <BrowserRouter>
      <AppCtx.Provider value={value}>
        <GlassProvider>
          <div className="min-h-screen">
            <Background variant={darkMode ? animatedBg : 'none'} />
            <div
              className={`fixed inset-x-0 top-0 z-[60] h-1 bg-primary transition-opacity duration-300 ${
                isFetching ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="h-full w-1/3 animate-pulse rounded-r-full bg-primary/70" />
            </div>
            <Sidebar />
            <main
              className={`pt-14 transition-[margin] duration-300 md:pt-0 ${
                collapsed ? 'md:ml-20' : 'md:ml-72'
              }`}
            >
              {hasToken ? (
                <Routes>
                  <Route path="/" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
                  <Route path="/settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
                  <Route path="/:owner/:repo/*" element={<ErrorBoundary><BranchPage /></ErrorBoundary>} />
                </Routes>
              ) : (
                <Routes>
                  <Route path="/settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
                  <Route path="*" element={<ErrorBoundary><TokenRequired /></ErrorBoundary>} />
                </Routes>
              )}
            </main>
          </div>
        </GlassProvider>
      </AppCtx.Provider>
    </BrowserRouter>
  );
}
