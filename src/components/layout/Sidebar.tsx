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
    <aside className="w-60 shrink-0 border-r border-ink-200 bg-ink-50 hidden md:flex flex-col">
      <div className="px-4 py-4 flex items-center gap-2 border-b border-ink-200">
        <div className="h-8 w-8 rounded-lg bg-brand-800 flex items-center justify-center">
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
        <div className="flex flex-col leading-tight">
          <span className="text-[13px] font-semibold text-ink-900">
            Northwind Onboarding
          </span>
          <span className="text-[11px] text-ink-400">Client Portal</span>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
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

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => openAI(null)}
          className="w-full flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2.5 text-left hover:bg-brand-100 transition-colors"
        >
          <span className="h-7 w-7 rounded-md bg-brand-700 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[12px] font-semibold text-brand-700">
              Onboarding AI
            </span>
            <span className="text-[11px] text-brand-700/70">
              Risks, drafts, next moves
            </span>
          </span>
        </button>
      </div>
    </aside>
  );
}
