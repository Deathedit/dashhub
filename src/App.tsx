import { createContext, useContext, useEffect } from "react";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useBranchData } from "./hooks/useBranchData";
import type { TrackedBranch, AnimatedBg } from "./types";
import Sidebar from "./components/Sidebar";
import Background from "./components/Background";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import BranchPage from "./pages/BranchPage";
import { useGlass } from "./hooks/useGlass";
import { KeyRound } from "lucide-react";

type BranchDataItem = ReturnType<typeof useBranchData>["data"][number];

export type AppContext = {
  branches: TrackedBranch[];
  setBranches: (value: TrackedBranch[] | ((prev: TrackedBranch[]) => TrackedBranch[])) => void;
  data: BranchDataItem[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
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
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

function TokenRequired() {
  const glass = useGlass();
  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-14 md:pt-0">
      <div className={`mx-auto max-w-md rounded-lg border border-gray-200 p-8 text-center dark:border-gray-700 ${glass.card}`}>
        <KeyRound className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
        <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          GitHub Token Required
        </h2>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          A Personal Access Token is required to use DashHub. Add one in Settings to get started.
        </p>
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <KeyRound className="h-4 w-4" />
          Go to Settings
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  const [branches, setBranches] = useLocalStorage<TrackedBranch[]>("dashhub-branches", []);
  const [autoRefresh, setAutoRefresh] = useLocalStorage<boolean>("dashhub-auto-refresh", false);
  const [darkMode, setDarkMode] = useLocalStorage<boolean>("dashhub-dark-mode", () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [collapsed, setCollapsed] = useLocalStorage<boolean>("dashhub-sidebar-collapsed", true);
  const [animatedBg, setAnimatedBg] = useLocalStorage<AnimatedBg>("dashhub-animated-bg", "none");
  const [token, setToken] = useLocalStorage<string>("dashhub-github-token", "");

  const { data } = useBranchData(branches, autoRefresh ? 300000 : 0, token || "");
  const isFetching = data.length > 0 && data.some((d) => d.loading);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const value: AppContext = {
    branches,
    setBranches,
    data,
    collapsed,
    onToggleCollapse: () => setCollapsed((c) => !c),
    autoRefresh,
    onToggleAutoRefresh: () => setAutoRefresh((a) => !a),
    darkMode,
    onToggleDarkMode: () => setDarkMode((d) => !d),
    animatedBg,
    setAnimatedBg,
    token,
    setToken,
  };

  const hasToken = token.trim().length > 0;

  return (
    <HashRouter>
      <AppCtx.Provider value={value}>
        <div className="min-h-screen">
          <Background variant={animatedBg} />
          <div
            className={`fixed inset-x-0 top-0 z-[60] h-1 bg-blue-500 transition-opacity duration-300 ${
              isFetching ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="h-full w-1/3 animate-pulse rounded-r-full bg-blue-400" />
          </div>
          <Sidebar />
          <main
            className={`pt-14 transition-[margin] duration-300 md:pt-0 ${
              collapsed ? "md:ml-20" : "md:ml-72"
            }`}
          >
            {hasToken ? (
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/:owner/:repo/:branch" element={<BranchPage />} />
              </Routes>
            ) : (
              <Routes>
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<TokenRequired />} />
              </Routes>
            )}
          </main>
        </div>
      </AppCtx.Provider>
    </HashRouter>
  );
}