import { 
  LayoutDashboard, 
  Calendar, 
  Search, 
  BarChart3, 
  Settings, 
  LogOut,
  Sparkles,
  Newspaper
} from "lucide-react";
import { User } from "../types";

export type ActiveTab = "dashboard" | "calendar" | "veille" | "analytics" | "settings";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: User;
  onLogout: () => void;
  postsCount: number;
}

export default function Sidebar({ activeTab, setActiveTab, user, onLogout, postsCount }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "calendar", label: "Calendrier", icon: Calendar },
    { id: "veille", label: "Veille X", icon: Search, badge: "Nouveau" },
    { id: "analytics", label: "Statistiques", icon: BarChart3 },
    { id: "settings", label: "Paramètres", icon: Settings },
  ] as const;

  return (
    <aside id="app-sidebar" className="w-64 bg-[#F5F2EB] text-[#131211] flex flex-col justify-between shrink-0 h-screen border-r border-[#E3DEC3]/40 font-sans">
      <div id="sidebar-top-section" className="flex flex-col">
        {/* Brand Banner */}
        <div id="sidebar-brand" className="p-6 border-b border-[#E3DEC3]/30">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-[#DD7E5C]" />
            <h1 className="font-serif italic text-2xl font-light tracking-tight text-[#131211]">Gazette</h1>
          </div>
          <p className="text-[9px] tracking-[0.25em] uppercase text-gray-500 mt-1.5 font-mono font-bold">
            Édition Quotidienne
          </p>
        </div>

        {/* Navigation Items */}
        <nav id="sidebar-nav" className="p-3 space-y-1.5 mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                id={`sidebar-link-${item.id}`}
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all group cursor-pointer ${
                  isActive 
                    ? "bg-[#FAF8F5] text-[#DD7E5C] border border-[#E3DEC3]/30 shadow-2xs font-bold" 
                    : "text-gray-600 hover:text-[#131211] hover:bg-[#FAF8F5]/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4.5 w-4.5 transition-colors ${
                    isActive ? "text-[#DD7E5C]" : "text-gray-400 group-hover:text-gray-700"
                  }`} />
                  <span>{item.label}</span>
                </div>
                {item.id === "veille" && (
                  <span className="bg-[#E3DEC3]/40 text-amber-800 text-[8px] font-mono uppercase px-1.5 py-0.5 rounded tracking-wide font-black">
                    Live
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Elegant, Micro Workspace Meta Stamp */}
      <div id="sidebar-workspace-info" className="mx-4 my-2 p-4 bg-[#FAF8F5]/80 rounded-xl border border-[#E3DEC3]/50 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-gray-400 font-mono tracking-wider">GAZETTE WORKSPACE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <div className="text-2xl font-serif italic text-[#131211] font-light">{postsCount}</div>
          <p className="text-[9px] text-gray-500 font-mono">publications suivies</p>
        </div>
      </div>

      {/* User Info Block */}
      <div id="sidebar-user-block" className="p-4 border-t border-[#E3DEC3]/30 bg-[#FAF8F5]/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            id="sidebar-user-avatar"
            className="w-8 h-8 rounded-full bg-[#DD7E5C] text-[#FAF8F5] flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs select-none border border-[#E3DEC3]/30"
          >
            {user.name ? user.name.trim().split(/\s+/).map(n => n[0]).join("").slice(0, 2).toUpperCase() : "GA"}
          </div>
          <div className="min-w-0 flex flex-col">
            <h4 className="text-xs font-bold text-[#131211] truncate">{user.name}</h4>
            <p className="text-[9px] text-gray-500 truncate font-mono font-medium">{user.role}</p>
          </div>
        </div>
        <button
          id="sidebar-logout-btn"
          onClick={onLogout}
          title="Se déconnecter"
          className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/5 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
