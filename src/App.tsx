import { createContext, useContext, useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useBranchData } from "./hooks/useBranchData";
import type { TrackedBranch } from "./types";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import BranchPage from "./pages/BranchPage";

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
  token: string;
  setToken: (value: string | ((prev: string) => string)) => void;
};

export const AppCtx = createContext<AppContext | null>(null);

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export default function App() {
  const [branches, setBranches] = useLocalStorage<TrackedBranch[]>("dashhub-branches", []);
  const [autoRefresh, setAutoRefresh] = useLocalStorage<boolean>("dashhub-auto-refresh", false);
  const [darkMode, setDarkMode] = useLocalStorage<boolean>("dashhub-dark-mode", () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [collapsed, setCollapsed] = useLocalStorage<boolean>("dashhub-sidebar-collapsed", true);
  const [token, setToken] = useLocalStorage<string>("dashhub-github-token", "");

  const { data } = useBranchData(branches, autoRefresh ? 60000 : 0, token || undefined);

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
    token,
    setToken,
  };

  return (
    <HashRouter>
      <AppCtx.Provider value={value}>
        <div className="min-h-screen">
          <Sidebar />
          <main
            className={`pt-14 transition-[margin] duration-300 md:pt-0 ${
              collapsed ? "md:ml-20" : "md:ml-72"
            }`}
          >
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/:owner/:repo/:branch" element={<BranchPage />} />
            </Routes>
          </main>
        </div>
      </AppCtx.Provider>
    </HashRouter>
  );
}