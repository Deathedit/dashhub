import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Settings, ChevronsLeft, ChevronsRight, Menu, X, GitBranch } from "lucide-react";
import { useApp } from "../App";

export default function Sidebar() {
  const { collapsed, onToggleCollapse } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className={`flex h-14 items-center gap-2.5 border-b border-gray-200 px-4 dark:border-gray-800 ${collapsed && !mobileOpen ? "justify-center" : ""}`}>
        <GitBranch className="h-6 w-6 shrink-0 text-blue-500" />
        {(!collapsed || mobileOpen) && <h1 className="text-lg font-bold text-gray-900 dark:text-white">DashHub</h1>}
        <button
          onClick={() => setMobileOpen(false)}
          className="ml-auto rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <NavLink
          to="/"
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            } ${collapsed && !mobileOpen ? "justify-center" : ""}`
          }
          title={collapsed && !mobileOpen ? "Dashboard" : undefined}
        >
          <LayoutDashboard className="h-5 w-5 shrink-0" />
          {((!collapsed) || mobileOpen) && "Dashboard"}
        </NavLink>
      </nav>

      <div className="border-t border-gray-200 px-2 py-2 dark:border-gray-800">
        <NavLink
          to="/settings"
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            } ${collapsed && !mobileOpen ? "justify-center" : ""}`
          }
          title={collapsed && !mobileOpen ? "Settings" : undefined}
        >
          <Settings className="h-5 w-5 shrink-0" />
          {((!collapsed) || mobileOpen) && "Settings"}
        </NavLink>
        <div className="hidden md:block">
          <button
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex w-full items-center justify-center rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">DashHub</span>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-xl transition-all duration-300 ease-in-out dark:bg-gray-900 ${
          mobileOpen
            ? "w-72 translate-x-0"
            : collapsed
              ? "w-20 -translate-x-0 md:translate-x-0"
              : "w-72 -translate-x-full md:translate-x-0"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}