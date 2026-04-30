import { Card, CardHeader } from "../ui/Card";
import { useStore } from "../../state/DataStore";
import { useAppState } from "../../state/AppState";
import { fmtMoney, relativeTime, fmtDate } from "../../lib/format";
import { Avatar } from "../ui/Avatar";
import { HealthBadge, Badge } from "../ui/Badge";
import { BlockerPills } from "../signals/SignalPills";
import { AILine } from "../ai/AIHint";
import { InlineActions } from "../actions/InlineActions";
import { STAGES } from "../../data/types";
import type { Client } from "../../data/types";

export function AtRiskTable({
  filterFn,
}: {
  filterFn?: (c: Client) => boolean;
}) {
  const store = useStore();
  const { openClient } = useAppState();
  const pool = store.clients.filter(
    (c) =>
      (c.health === "at_risk" ||
        c.health === "internal_blocked" ||
        c.health === "waiting_client") &&
      c.stage !== "live" &&
      c.stage !== "transitioned",
  );
  const filtered = filterFn ? pool.filter(filterFn) : pool;
  const sorted = [...filtered].sort(
    (a, b) =>
      new Date(a.goLiveTarget).getTime() -
      new Date(b.goLiveTarget).getTime(),
  );

  return (
    <Card pad={false}>
      <div className="px-5 pt-5">
        <CardHeader
          eyebrow="At-risk onboardings"
          title="Likely to slip"
          description="Sorted by go-live target, soonest first. Act inline."
          right={
            <Badge tone="neutral">{filtered.length} accounts</Badge>
          }
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="table-head pl-5">Client</th>
              <th className="table-head">Owner</th>
              <th className="table-head text-right">Days</th>
              <th className="table-head">Stage</th>
              <th className="table-head">Health · blocker</th>
              <th className="table-head">Go-live</th>
              <th className="table-head pr-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 6).map((c) => {
              const goLiveDays = Math.round(
                (new Date(c.goLiveTarget).getTime() - Date.now()) / 86400000,
              );
              const overdue = goLiveDays < 0;
              const insight = c.aiInsights[0];
              return (
                <tr
                  key={c.id}
                  onClick={() => openClient(c.id)}
                  className="border-b border-ink-100 last:border-0 hover:bg-ink-50/40 cursor-pointer transition-colors group"
                >
                  <td className="table-cell pl-5">
                    <div className="font-medium text-ink-900">{c.name}</div>
                    <div className="text-[11.5px] text-ink-400">
                      {c.industry} · {fmtMoney(c.contractValue)} · {c.plan}
                    </div>
                    {insight && (
                      <div className="mt-1">
                        <AILine weight={insight.weight}>{insight.body}</AILine>
                      </div>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      <Avatar ownerId={c.ownerId} size="xs" />
                    </div>
                  </td>
                  <td className="table-cell text-right">
                    <span
                      className={`text-[12px] font-semibold ${
                        c.daysInStage >= 10
                          ? "text-danger-700"
                          : c.daysInStage >= 5
                            ? "text-warning-700"
                            : "text-ink-700"
                      }`}
                    >
                      {c.daysInStage}d
                    </span>
                  </td>
                  <td className="table-cell">
                    <Badge tone="neutral">
                      {STAGES.find((s) => s.id === c.stage)?.short}
                    </Badge>
                  </td>
                  <td className="table-cell">
                    <div className="flex flex-col gap-1">
                      <HealthBadge health={c.health} />
                      <BlockerPills client={c} max={1} size="xs" />
                    </div>
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
                  <td
                    className="table-cell pr-5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-end opacity-70 group-hover:opacity-100">
                      <InlineActions client={c} variant="compact" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="py-10 text-center text-sm text-ink-500">
            No at-risk onboardings right now. Healthy queue.
          </div>
        )}
      </div>
    </Card>
  );
}
