import { Filter, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { useStore } from "../state/DataStore";
import { useAppState } from "../state/AppState";
import { ACTIVE_STAGES, STAGES } from "../data/types";
import type { OnboardingStage } from "../data/types";
import { Avatar } from "../components/ui/Avatar";
import { HealthBadge } from "../components/ui/Badge";
import { fmtMoney, fmtDate, relativeTime } from "../lib/format";
import {
  BlockerPills,
  DataIssuePills,
} from "../components/signals/SignalPills";
import { AILine } from "../components/ai/AIHint";
import { InlineActions } from "../components/actions/InlineActions";

const stageColor: Record<OnboardingStage, string> = {
  handoff: "bg-ink-300",
  kickoff_scheduled: "bg-brand-300",
  discovery: "bg-brand-400",
  asset_collection: "bg-accent-500",
  configuration: "bg-brand-500",
  uat: "bg-brand-600",
  launch_prep: "bg-brand-700",
  live: "bg-success-500",
  transitioned: "bg-success-600",
};

export function QueuePage() {
  const store = useStore();
  const { openClient } = useAppState();
  const [query, setQuery] = useState("");

  const visible = store.clients.filter(
    (c) =>
      ACTIVE_STAGES.includes(c.stage) &&
      (!query ||
        `${c.name} ${c.industry}`.toLowerCase().includes(query.toLowerCase())),
  );

  const byStage = (stage: OnboardingStage) =>
    visible
      .filter((c) => c.stage === stage)
      .sort((a, b) => b.daysInStage - a.daysInStage);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-ink-900 tracking-tight">
            Onboarding queue
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">
            {visible.length} active accounts ·{" "}
            {fmtMoney(visible.reduce((s, c) => s + c.contractValue, 0))} in flight
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search accounts…"
              className="pl-8 pr-3 h-8 text-sm rounded-lg bg-white border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-400/40"
            />
          </div>
          <button className="btn-secondary" type="button">
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>
        </div>
      </div>

      <div className="grid grid-flow-col auto-cols-[300px] gap-3 overflow-x-auto pb-4 -mx-4 sm:-mx-6 px-4 sm:px-6">
        {ACTIVE_STAGES.map((stageId) => {
          const items = byStage(stageId);
          const total = items.reduce((s, c) => s + c.contractValue, 0);
          const stageLabel = STAGES.find((s) => s.id === stageId)?.label ?? stageId;
          return (
            <div
              key={stageId}
              className="flex flex-col bg-ink-100/60 rounded-xl border border-ink-200/60"
            >
              <div className="px-3 pt-3 pb-2.5 border-b border-ink-200/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${stageColor[stageId]}`}
                    />
                    <span className="text-[12.5px] font-semibold text-ink-800">
                      {stageLabel}
                    </span>
                    <span className="text-[11px] text-ink-400 bg-white border border-ink-200 rounded px-1.5">
                      {items.length}
                    </span>
                  </div>
                </div>
                <div className="mt-1 text-[11px] text-ink-500">
                  {fmtMoney(total)}
                </div>
              </div>
              <div className="flex-1 p-2 space-y-2 min-h-[120px]">
                {items.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => openClient(c.id)}
                    className="bg-white border border-ink-200 rounded-lg p-3 hover:border-brand-300 hover:shadow-card transition-all group cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-ink-900 truncate">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-ink-500">
                          {c.industry} · {c.plan}
                        </div>
                      </div>
                      <Avatar ownerId={c.ownerId} size="xs" />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-ink-900">
                        {fmtMoney(c.contractValue)}
                      </span>
                      <HealthBadge health={c.health} />
                    </div>
                    {/* Friction signals row */}
                    <div className="mt-2 flex items-center gap-1 flex-wrap">
                      <BlockerPills client={c} max={1} size="xs" />
                      <DataIssuePills client={c} max={1} />
                    </div>
                    {/* Days in stage + checklist progress */}
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span
                        className={
                          c.daysInStage >= 10
                            ? "text-warning-700 font-semibold"
                            : "text-ink-500"
                        }
                      >
                        {c.daysInStage}d in stage
                      </span>
                      <span className="text-ink-500">
                        {c.completionPct}% · {c.checklistComplete}/
                        {c.checklistTotal}
                      </span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="mt-1 h-1 rounded-full bg-ink-100 overflow-hidden">
                      <div
                        className={`h-full ${
                          c.completionPct >= 85
                            ? "bg-success-500"
                            : c.completionPct >= 60
                              ? "bg-brand-500"
                              : "bg-warning-500"
                        }`}
                        style={{ width: `${c.completionPct}%` }}
                      />
                    </div>
                    {c.aiInsights[0] && (
                      <div className="mt-2">
                        <AILine weight={c.aiInsights[0].weight}>
                          {c.aiInsights[0].body}
                        </AILine>
                      </div>
                    )}
                    <div className="mt-2 pt-2 border-t border-ink-100 flex items-center justify-between">
                      <span className="text-[11px] text-ink-500 inline-flex items-center gap-1 truncate flex-1 min-w-0">
                        <Sparkles className="h-3 w-3 text-brand-600" />
                        <span className="truncate">{c.recommendedAction}</span>
                      </span>
                      <div
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <InlineActions client={c} variant="compact" />
                      </div>
                    </div>
                    <div className="mt-2 text-[10.5px] text-ink-400">
                      Live target {fmtDate(c.goLiveTarget)} ·{" "}
                      {relativeTime(c.goLiveTarget)}
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="text-[11px] text-ink-400 italic px-2 py-6 text-center border border-dashed border-ink-200 rounded-lg">
                    No accounts in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
