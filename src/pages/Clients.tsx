import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Plus,
  ChevronDown,
  Bookmark,
  Download,
} from "lucide-react";
import { useStore } from "../state/DataStore";
import { useAppState } from "../state/AppState";
import { Card } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Badge, HealthBadge } from "../components/ui/Badge";
import { fmtMoney, fmtDate, relativeTime } from "../lib/format";
import { teamById } from "../data/team";
import { STAGES } from "../data/types";
import type { OnboardingStage } from "../data/types";
import { InlineActions } from "../components/actions/InlineActions";
import {
  BlockerPills,
  DataIssuePills,
  FlagPills,
} from "../components/signals/SignalPills";
import { AILine } from "../components/ai/AIHint";

const savedViews = [
  { id: "all_active", label: "All active" },
  { id: "mine", label: "My clients" },
  { id: "at_risk", label: "At risk" },
  { id: "waiting_client", label: "Waiting on client" },
  { id: "ready_for_launch", label: "Ready for launch" },
  { id: "transitioned", label: "Transitioned" },
];

export function ClientsPage() {
  const store = useStore();
  const { role, currentUserId, openClient } = useAppState();
  const [view, setView] = useState("all_active");
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<OnboardingStage | "all">(
    "all",
  );

  const myClientFn = (c: ReturnType<typeof store.clients.find>) => {
    if (!c) return false;
    if (role === "onboarding") return c.ownerId === currentUserId;
    if (role === "implementation") return c.implementerId === currentUserId;
    if (role === "success") return c.csmId === currentUserId;
    if (role === "sales") return c.salesRepId === currentUserId;
    return true;
  };

  const filtered = useMemo(() => {
    return store.clients
      .filter((c) => {
        if (view === "all_active")
          return c.stage !== "transitioned";
        if (view === "mine") return myClientFn(c);
        if (view === "at_risk") return c.health === "at_risk" || c.health === "internal_blocked";
        if (view === "waiting_client") return c.health === "waiting_client";
        if (view === "ready_for_launch")
          return c.health === "ready_for_launch" || c.stage === "launch_prep";
        if (view === "transitioned")
          return c.stage === "transitioned" || c.stage === "live";
        return true;
      })
      .filter((c) => (stageFilter === "all" ? true : c.stage === stageFilter))
      .filter((c) => {
        if (!query) return true;
        return `${c.name} ${c.industry} ${c.id}`
          .toLowerCase()
          .includes(query.toLowerCase());
      })
      .sort((a, b) => b.contractValue - a.contractValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.clients, view, query, stageFilter, role, currentUserId]);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-ink-900 tracking-tight">
            Clients
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">
            All onboarding accounts with package, stage, owner, and health.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" type="button">
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button className="btn-primary" type="button">
            <Plus className="h-3.5 w-3.5" />
            Add client
          </button>
        </div>
      </div>

      <Card pad={false}>
        <div className="px-4 pt-3 pb-3 border-b border-ink-200 flex items-center gap-2 flex-wrap">
          {savedViews.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              type="button"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12.5px] font-medium ${
                view === v.id
                  ? "bg-ink-900 text-white"
                  : "bg-ink-100 text-ink-700 hover:bg-ink-200"
              }`}
            >
              {view === v.id && <Bookmark className="h-3 w-3" />}
              {v.label}
            </button>
          ))}
          <span className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search clients…"
                className="pl-8 pr-3 h-8 text-sm rounded-lg bg-white border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-400/40 w-56"
              />
            </div>
            <div className="relative">
              <select
                value={stageFilter}
                onChange={(e) =>
                  setStageFilter(e.target.value as OnboardingStage | "all")
                }
                className="appearance-none pl-3 pr-7 h-8 text-sm rounded-lg bg-white border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-400/40"
              >
                <option value="all">All stages</option>
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-3.5 w-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
            </div>
            <button className="btn-secondary" type="button">
              <Filter className="h-3.5 w-3.5" />
              More
            </button>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="table-head pl-4">Client</th>
                <th className="table-head">Plan</th>
                <th className="table-head">Stage</th>
                <th className="table-head">Health · signals</th>
                <th className="table-head">Owner</th>
                <th className="table-head text-right">Value</th>
                <th className="table-head">Go-live</th>
                <th className="table-head text-right">Done</th>
                <th className="table-head pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const owner = teamById[c.ownerId];
                const goLiveDays = Math.round(
                  (new Date(c.goLiveTarget).getTime() - Date.now()) / 86400000,
                );
                const overdue = goLiveDays < 0;
                return (
                  <tr
                    key={c.id}
                    onClick={() => openClient(c.id)}
                    className="border-b border-ink-100 last:border-0 hover:bg-ink-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="table-cell pl-4">
                      <div className="font-medium text-ink-900">{c.name}</div>
                      <div className="text-[11.5px] text-ink-400">
                        {c.industry} · {c.id}
                      </div>
                      {c.aiInsights[0] && (
                        <div className="mt-1">
                          <AILine weight={c.aiInsights[0].weight}>
                            {c.aiInsights[0].body}
                          </AILine>
                        </div>
                      )}
                    </td>
                    <td className="table-cell">
                      <Badge tone="brand">{c.plan}</Badge>
                    </td>
                    <td className="table-cell">
                      <Badge tone="neutral">
                        {STAGES.find((s) => s.id === c.stage)?.short}
                      </Badge>
                      <div className="text-[10.5px] text-ink-500 mt-0.5">
                        {c.daysInStage}d in stage
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-col gap-1">
                        <HealthBadge health={c.health} />
                        <BlockerPills client={c} max={1} size="xs" />
                        <DataIssuePills client={c} max={1} />
                        <FlagPills client={c} />
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <Avatar ownerId={owner?.id} size="xs" />
                        <span className="text-[12px]">
                          {owner?.name.split(" ")[0]}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell text-right font-semibold text-ink-900">
                      {fmtMoney(c.contractValue)}
                    </td>
                    <td className="table-cell">
                      <div
                        className={`text-[12px] ${overdue ? "text-danger-700 font-semibold" : "text-ink-700"}`}
                      >
                        {fmtDate(c.goLiveTarget)}
                      </div>
                      <div className="text-[10.5px] text-ink-400">
                        {relativeTime(c.goLiveTarget)}
                      </div>
                    </td>
                    <td className="table-cell text-right">
                      <div className="text-[12px] font-semibold text-ink-800">
                        {c.completionPct}%
                      </div>
                      <div className="text-[10px] text-ink-500">
                        {c.checklistComplete}/{c.checklistTotal}
                      </div>
                    </td>
                    <td
                      className="table-cell pr-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <InlineActions client={c} variant="compact" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-ink-500">
              No clients match the current filters.
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-ink-200 text-[11.5px] text-ink-500 flex items-center justify-between">
          <span>
            Showing{" "}
            <span className="font-semibold text-ink-700">{filtered.length}</span>{" "}
            of {store.clients.length} clients
          </span>
          <span>
            Total contract value:{" "}
            <span className="font-semibold text-ink-800">
              {fmtMoney(filtered.reduce((s, c) => s + c.contractValue, 0))}
            </span>
          </span>
        </div>
      </Card>
    </div>
  );
}
