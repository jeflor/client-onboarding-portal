import {
  Search,
  Bell,
  Plus,
  Sparkles,
  ChevronDown,
  Headset,
  Briefcase,
  Wrench,
  HeartHandshake,
} from "lucide-react";
import { useAppState } from "../../state/AppState";
import { Avatar } from "../ui/Avatar";
import { roleLabel } from "../../data/team";
import type { Role } from "../../data/types";

const roleIcon: Record<
  Role,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  sales: Briefcase,
  onboarding: Headset,
  implementation: Wrench,
  success: HeartHandshake,
};

export function TopNav() {
  const { role, setRole, currentUser, openAI, openQuickLog } = useAppState();
  return (
    <header className="h-14 bg-white sticky top-0 z-30 flex items-center px-4 gap-3 relative">
      {/* Brand accent line — narrow teal underline below the bar */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-brand-300/50 via-brand-500/30 to-transparent" />
      <div className="absolute bottom-px inset-x-0 h-px bg-ink-200" />

      <div className="md:hidden flex items-center gap-2 mr-2">
        <div className="h-7 w-7 rounded-md bg-ink-900 flex items-center justify-center">
          <svg viewBox="0 0 32 32" className="h-4 w-4">
            <path
              d="M9 16 L14 21 L23 11"
              stroke="#67e8f9"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        <span className="text-sm font-semibold text-ink-900 display">
          Onboarding
        </span>
      </div>

      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            placeholder="Search clients, tasks, documents…"
            className="w-full pl-9 pr-16 h-9 rounded-lg bg-ink-50 border border-ink-200 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-300 focus:bg-white"
          />
          <kbd className="hidden sm:inline-flex absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-ink-400 border border-ink-200 rounded px-1.5 py-0.5 bg-white">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Role switcher — pill style, distinct from the sales app's tab style */}
        <div className="hidden md:flex items-center bg-ink-100 p-0.5 rounded-full text-xs font-medium ring-1 ring-ink-200">
          {(["sales", "onboarding", "implementation", "success"] as Role[]).map(
            (r) => {
              const Icon = roleIcon[r];
              const active = role === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  title={roleLabel[r]}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all ${
                    active
                      ? "bg-ink-900 text-white shadow-sm"
                      : "text-ink-500 hover:text-ink-800"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">
                    {r === "onboarding"
                      ? "Onboarding"
                      : r === "success"
                        ? "CSM"
                        : r === "implementation"
                          ? "Impl"
                          : "Sales"}
                  </span>
                </button>
              );
            },
          )}
        </div>

        <button
          type="button"
          onClick={() => openAI(null)}
          className="hidden md:inline-flex btn-secondary"
          title="Open AI assistant"
        >
          <Sparkles className="h-4 w-4 text-brand-600" />
          AI
        </button>

        <button
          type="button"
          className="btn-primary hidden sm:inline-flex"
          onClick={() => openQuickLog()}
        >
          <Plus className="h-4 w-4" />
          Quick log
        </button>

        <button
          type="button"
          className="relative h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-ink-100 text-ink-600"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white" />
        </button>

        <button
          type="button"
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-ink-100"
        >
          <Avatar ownerId={currentUser?.id} size="sm" />
          <span className="hidden lg:flex flex-col items-start leading-tight">
            <span className="text-xs font-semibold text-ink-800">
              {currentUser?.name}
            </span>
            <span className="text-[10px] text-ink-400">{roleLabel[role]}</span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
        </button>
      </div>
    </header>
  );
}
