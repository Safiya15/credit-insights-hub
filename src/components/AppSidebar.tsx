import React from "react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  FileText,
  FilePlus,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/applications", label: "Applications", icon: FileText },
  { to: "/new-application", label: "New Application", icon: FilePlus },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin", label: "Admin", icon: Settings },
];

export const AppSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen flex flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-sidebar-primary" />
          <div>
            <h1 className="text-sm font-bold tracking-tight text-sidebar-foreground">Credit Risk AI</h1>
            <p className="text-[10px] text-sidebar-muted">Analyzer</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <RouterNavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </RouterNavLink>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center text-xs font-bold text-sidebar-primary-foreground">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user?.name}</p>
            <p className="text-[10px] text-sidebar-muted">{user?.role}</p>
          </div>
          <button onClick={logout} className="text-sidebar-muted hover:text-sidebar-foreground transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
