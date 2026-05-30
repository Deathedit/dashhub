import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Settings, ChevronsLeft, ChevronsRight, Menu, X, GitBranch } from "lucide-react";
import { useApp } from "@/App";
import { useGlassActive, sidebarClass } from "@/hooks/useGlass";
import { text } from "@/text";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Sidebar() {
  const { collapsed, onToggleCollapse } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isGlass = useGlassActive();

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className={`flex h-14 items-center gap-2.5 border-b border-border px-4 ${collapsed && !mobileOpen ? "justify-center" : ""}`}>
        <GitBranch className="h-6 w-6 shrink-0 text-primary" />
        {(!collapsed || mobileOpen) && <h1 className="text-lg font-bold">{text.app.name}</h1>}
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setMobileOpen(false)}
          className="ml-auto md:hidden"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <NavLink
          to="/"
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            } ${collapsed && !mobileOpen ? "justify-center" : ""}`
          }
          title={collapsed && !mobileOpen ? text.nav.dashboard : undefined}
        >
          <LayoutDashboard className="h-5 w-5 shrink-0" />
          {((!collapsed) || mobileOpen) && text.nav.dashboard}
        </NavLink>
      </nav>

      <Separator />

      <div className="px-2 py-2">
        <NavLink
          to="/settings"
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            } ${collapsed && !mobileOpen ? "justify-center" : ""}`
          }
          title={collapsed && !mobileOpen ? text.nav.settings : undefined}
        >
          <Settings className="h-5 w-5 shrink-0" />
          {((!collapsed) || mobileOpen) && text.nav.settings}
        </NavLink>
        <div className="hidden md:block">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            title={collapsed ? text.nav.expandSidebar : text.nav.collapseSidebar}
            className="w-full"
          >
            {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-bg px-4 md:hidden">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="text-sm font-semibold">{text.app.name}</span>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 shadow-xl transition-all duration-300 ease-in-out ${sidebarClass(isGlass)} ${
          mobileOpen ? "w-72" : collapsed ? "w-20" : "w-72"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}