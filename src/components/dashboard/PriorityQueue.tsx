import { ChevronRight, Wand2 } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { useStore } from "../../state/DataStore";
import { useAppState } from "../../state/AppState";
import { useToast } from "../../state/Toaster";
import { fmtMoney } from "../../lib/format";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { BlockerPills } from "../signals/SignalPills";
import { AILine } from "../ai/AIHint";
import { InlineActions } from "../actions/InlineActions";
import { STAGES } from "../../data/types";
import type { Client } from "../../data/types";

function urgency(c: Client): number {
  let s = 0;
  if (c.health === "at_risk") s += 50;
  if (c.health === "internal_blocked") s += 35;
  if (c.health === "waiting_client") s += 25;
  if (c.health === "ready_for_launch") s += 20;
  s += Math.min(30, c.daysInStage * 2);
  s += Math.round(c.contractValue / 8000);
  if (c.flags.includes("client_ghosted")) s += 15;
  if (c.flags.includes("scope_promise_unresolved")) s += 12;
  return Math.min(100, s);
}

export function PriorityQueue({ filterFn }: { filterFn?: (c: Client) => boolean }) {
  const store = useStore();
  const { openClient } = useAppState();
  const toast = useToast();
  const { currentUserId } = useAppState();

  const pool = store.clients.filter(
    (c) => c.stage !== "live" && c.stage !== "transitioned",
  );
  const filtered = filterFn ? pool.filter(filterFn) : pool;
  const ranked = [...filtered]
    .sort((a, b) => urgency(b) - urgency(a))
    .slice(0, 6);

  return (
    <Card>
      <CardHeader
        eyebrow="Priority action queue"
        title="What needs attention now"
        description="Ranked by health, days-in-stage, and contract value."
        right={
          <button className="btn-ghost text-[12px]" type="button">
            View all
          </button>
        }
      />
      <ul className="divide-y divide-ink-100 -mx-1">
        {ranked.map((c) => {
          const u = urgency(c);
          const topInsight = c.aiInsights[0];
          return (
            <li
              key={c.id}
              className="px-1 py-2.5 hover:bg-ink-50/60 rounded-md group cursor-pointer"
              onClick={() => openClient(c.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center pt-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-1.5 rounded ${
                      u >= 80
                        ? "bg-danger-50 text-danger-700"
                        : u >= 60
                          ? "bg-warning-50 text-warning-700"
                          : "bg-ink-100 text-ink-600"
                    }`}
                  >
                    {u}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-ink-900 truncate">
                      {c.name}
                    </span>
                    <Badge tone="neutral">
                      {STAGES.find((s) => s.id === c.stage)?.short}
                    </Badge>
                    <span className="text-[11px] text-ink-400">
                      {c.daysInStage}d in stage
                    </span>
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-ink-700 font-medium">
                    {c.recommendedAction}
                  </div>
                  {c.blockers.length > 0 && (
                    <div className="mt-1.5">
                      <BlockerPills client={c} max={2} />
                    </div>
                  )}
                  {topInsight && (
                    <div className="mt-1">
                      <AILine weight={topInsight.weight}>
                        {topInsight.body}
                      </AILine>
                    </div>
                  )}
                  <div className="mt-1 text-[11px] text-ink-400">
                    {c.reasonSurfaced}
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                  <div className="text-[13px] font-semibold text-ink-900">
                    {fmtMoney(c.contractValue)}
                  </div>
                  <Avatar ownerId={c.ownerId} size="xs" />
                  <ChevronRight className="h-4 w-4 text-ink-300 mt-1" />
                </div>
              </div>

              <div className="mt-2 ml-7 flex items-center justify-between">
                <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                  <InlineActions client={c} variant="compact" />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    store.addNote({
                      clientId: c.id,
                      actorId: currentUserId,
                      body: `Followed up on: ${c.recommendedAction}`,
                    });
                    toast.success(
                      `Logged follow-up · ${c.name}`,
                      { label: "Open", onClick: () => openClient(c.id) },
                    );
                  }}
                  className="text-[11px] font-semibold text-brand-700 inline-flex items-center gap-1 hover:underline"
                >
                  <Wand2 className="h-3 w-3" />
                  Do recommended action
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
