import { Card, CardHeader } from "../ui/Card";
import { useStore } from "../../state/DataStore";
import { useAppState } from "../../state/AppState";
import { fmtMoney } from "../../lib/format";
import type { Health } from "../../data/types";
import { HEALTH_LABELS } from "../../data/types";
import { ChevronRight } from "lucide-react";

const order: Health[] = [
  "on_track",
  "waiting_client",
  "internal_blocked",
  "at_risk",
  "ready_for_launch",
];

const accent: Record<Health, { bar: string; bg: string; text: string }> = {
  on_track: {
    bar: "bg-success-500",
    bg: "bg-success-50/60",
    text: "text-success-700",
  },
  waiting_client: {
    bar: "bg-accent-500",
    bg: "bg-accent-50/60",
    text: "text-accent-700",
  },
  internal_blocked: {
    bar: "bg-warning-500",
    bg: "bg-warning-50/60",
    text: "text-warning-700",
  },
  at_risk: {
    bar: "bg-danger-500",
    bg: "bg-danger-50/60",
    text: "text-danger-700",
  },
  ready_for_launch: {
    bar: "bg-brand-500",
    bg: "bg-brand-50/60",
    text: "text-brand-700",
  },
};

export function HealthBoard() {
  const store = useStore();
  const { openClient } = useAppState();

  const open = store.clients.filter(
    (c) => c.stage !== "live" && c.stage !== "transitioned",
  );

  const groups = order.map((h) => {
    const items = open
      .filter((c) => c.health === h)
      .sort((a, b) => b.daysInOnboarding - a.daysInOnboarding);
    return {
      health: h,
      items,
      count: items.length,
      value: items.reduce((s, c) => s + c.contractValue, 0),
      avgAge: items.length
        ? Math.round(
            items.reduce((s, c) => s + c.daysInOnboarding, 0) / items.length,
          )
        : 0,
    };
  });

  return (
    <Card>
      <CardHeader
        eyebrow="Onboarding health board"
        title="All active clients by health state"
        description="Counts, value, and average days-in-onboarding per state. Click any client to drill in."
      />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {groups.map((g) => (
          <div
            key={g.health}
            className={`rounded-lg border border-ink-200 ${accent[g.health].bg} flex flex-col`}
          >
            <div className="px-3 pt-3 pb-2 border-b border-ink-200/60">
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${accent[g.health].bar}`}
                />
                <span className="text-[12px] font-semibold text-ink-800">
                  {HEALTH_LABELS[g.health]}
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-semibold text-ink-900">
                  {g.count}
                </span>
                <span className="text-[11px] text-ink-500">
                  · {fmtMoney(g.value)}
                </span>
              </div>
              <div className="text-[10.5px] text-ink-500">
                avg {g.avgAge}d in onboarding
              </div>
            </div>
            <ul className="flex-1 p-1.5 space-y-1 min-h-[80px]">
              {g.items.slice(0, 4).map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => openClient(c.id)}
                    className="w-full text-left px-2 py-1.5 rounded-md hover:bg-white border border-transparent hover:border-ink-200 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-medium text-ink-800 truncate">
                        {c.name}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-ink-500 flex items-center justify-between">
                      <span>
                        {c.daysInOnboarding}d ·{" "}
                        {fmtMoney(c.contractValue)}
                      </span>
                      <ChevronRight className="h-3 w-3 text-ink-300 group-hover:text-ink-500" />
                    </div>
                  </button>
                </li>
              ))}
              {g.items.length === 0 && (
                <li className="text-[11px] text-ink-400 italic px-2 py-3 text-center">
                  None
                </li>
              )}
              {g.items.length > 4 && (
                <li className="text-[10.5px] text-ink-500 italic px-2">
                  +{g.items.length - 4} more
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}
