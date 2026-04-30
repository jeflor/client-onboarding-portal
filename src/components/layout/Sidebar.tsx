import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ListChecks,
  CheckSquare,
  FileText,
  Stamp,
  Activity,
  Users2,
  Settings,
  Sparkles,
} from "lucide-react";
import { useAppState } from "../../state/AppState";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/queue", label: "Onboarding Queue", icon: ListChecks },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/approvals", label: "Approvals", icon: Stamp },
  { to: "/timeline", label: "Timeline", icon: Activity },
  { to: "/team", label: "Team", icon: Users2 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const { openAI } = useAppState();
  return (
    <aside className="w-60 shrink-0 hidden md:flex flex-col bg-ink-900 text-ink-100 shadow-rail relative">
      {/* Subtle teal glow at top — operations-room atmosphere */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-400/40 to-transparent" />

      <div className="px-4 py-4 flex items-center gap-2.5 border-b border-white/5">
        <div className="h-9 w-9 rounded-lg bg-brand-700 flex items-center justify-center ring-1 ring-brand-500/30">
          <svg viewBox="0 0 32 32" className="h-5 w-5">
            <path
              d="M9 16 L14 21 L23 11"
              stroke="#67e8f9"
              strokeWidth={2.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="9" cy="16" r="1.6" fill="#67e8f9" />
          </svg>
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-[13px] font-semibold text-white display tracking-tight">
            Northwind Onboarding
          </span>
          <span className="text-[10.5px] text-brand-300 uppercase tracking-[0.12em] font-semibold">
            Client Portal
          </span>
        </div>
      </div>

      {/* "Live ops" status strip */}
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-500 opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500" />
        </span>
        <span className="text-[10.5px] uppercase tracking-[0.12em] text-ink-400 font-semibold">
          Live · ops desk
        </span>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              isActive ? "nav-item-active" : "nav-item"
            }
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-3 pt-2">
        <button
          type="button"
          onClick={() => openAI(null)}
          className="w-full flex items-center gap-2.5 rounded-lg bg-gradient-to-br from-brand-700 to-brand-800 ring-1 ring-brand-500/30 px-3 py-2.5 text-left hover:from-brand-600 hover:to-brand-700 transition-all"
        >
          <span className="h-7 w-7 rounded-md bg-white/15 backdrop-blur flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[12px] font-semibold text-white display">
              Onboarding AI
            </span>
            <span className="text-[10.5px] text-brand-200">
              Risks · drafts · next moves
            </span>
          </span>
        </button>
      </div>
    </aside>
  );
}
