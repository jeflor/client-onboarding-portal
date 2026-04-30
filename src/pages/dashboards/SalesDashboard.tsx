import { Sparkles, AlertTriangle, ChevronRight, MessageSquareWarning } from "lucide-react";
import { useStore } from "../../state/DataStore";
import { useAppState } from "../../state/AppState";
import { Kpi } from "../../components/dashboard/Kpi";
import { Card, CardHeader } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { HealthBadge, Badge } from "../../components/ui/Badge";
import { fmtMoney, relativeTime } from "../../lib/format";
import { teamById } from "../../data/team";
import { STAGES } from "../../data/types";
import { AILine } from "../../components/ai/AIHint";
import { HandoffTimeline } from "../../components/dashboard/HandoffTimeline";

export function SalesDashboard() {
  const store = useStore();
  const { currentUser, currentUserId, openClient, openAI } = useAppState();

  const myHandoffs = store.clients.filter(
    (c) => c.salesRepId === currentUserId,
  );
  const active = myHandoffs.filter(
    (c) => c.stage !== "live" && c.stage !== "transitioned",
  );
  const atRisk = active.filter(
    (c) => c.health === "at_risk" || c.health === "internal_blocked",
  );
  const allPromises = myHandoffs.flatMap((c) => c.promises);
  const openPromises = allPromises.filter(
    (p) => p.supported === "scope_exception" || p.supported === "unknown",
  );
  const launched = myHandoffs.filter((c) => c.goLiveActual);

  const sparkUp = [40, 42, 41, 48, 52, 50, 58].map((v) => ({ v }));
  const sparkFlat = [40, 41, 42, 41, 43, 42, 42].map((v) => ({ v }));

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.12em] text-brand-700 font-semibold mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 inline-block" />
            Operations desk · Sales handoff
          </div>
          <h1 className="text-3xl font-semibold text-ink-900 tracking-tight">
            Your handoffs in flight
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            Welcome back, {currentUser?.name.split(" ")[0]}.{" "}
            <span className="font-semibold text-ink-700">{active.length}</span>{" "}
            of your closed deals are still in onboarding ·{" "}
            <span className="font-semibold text-ink-700">
              {openPromises.length}
            </span>{" "}
            sales promises pending resolution
          </p>
          {atRisk.length > 0 && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-warning-700 bg-warning-50/60 ring-1 ring-warning-100 rounded-md px-2 py-0.5">
              <MessageSquareWarning className="h-3 w-3" />
              <span>
                <span className="font-semibold">
                  {atRisk.length} of your handoffs are at risk
                </span>{" "}
                — onboarding may need context from you to unblock.
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-primary"
            onClick={() => openAI(null)}
          >
            <Sparkles className="h-4 w-4" />
            Ask AI
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi
          label="My handoffs (active)"
          value={String(active.length)}
          sub={`${myHandoffs.length} total this quarter`}
          trend={{ delta: 14, label: "vs. last quarter" }}
          spark={sparkUp}
        />
        <Kpi
          label="At-risk handoffs"
          value={String(atRisk.length)}
          sub="Need your context"
          trend={{ delta: 1, label: "+1 vs. last week", good: "down" }}
          spark={sparkFlat}
          accent="#ef4444"
        />
        <Kpi
          label="Promises pending"
          value={String(openPromises.length)}
          sub="Scope exceptions / unknowns"
          trend={{ delta: 2, label: "vs. last week", good: "down" }}
          spark={sparkFlat}
          accent="#f97316"
        />
        <Kpi
          label="Avg close → launch"
          value={
            launched.length
              ? `${Math.round(
                  launched.reduce(
                    (s, c) =>
                      s +
                      (new Date(c.goLiveActual!).getTime() -
                        new Date(c.closedAt).getTime()) /
                        86400000,
                    0,
                  ) / launched.length,
                )}d`
              : "—"
          }
          sub="Your handoffs"
          trend={{ delta: 3.1, label: "vs. team avg", good: "down" }}
          spark={sparkFlat}
          accent="#0e8a99"
        />
      </div>

      {/* Promises table — what sales actually needs to track */}
      <Card>
        <CardHeader
          eyebrow="Sales promises in onboarding"
          title="Things you committed to that delivery is now executing on"
          description="Scope exceptions and unknowns need your input to resolve cleanly."
        />
        {allPromises.length === 0 ? (
          <div className="text-sm text-ink-500 py-6 text-center">
            No tracked promises across your handoffs. Clean handoffs.
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {allPromises.slice(0, 8).map((p) => {
              const c = myHandoffs.find((x) => x.promises.includes(p))!;
              const tone =
                p.supported === "yes"
                  ? "success"
                  : p.supported === "scope_exception"
                    ? "warning"
                    : p.supported === "no"
                      ? "danger"
                      : "neutral";
              return (
                <li
                  key={p.id}
                  className="py-3 flex items-start gap-3 hover:bg-ink-50/40 -mx-2 px-2 rounded-md cursor-pointer"
                  onClick={() => openClient(c.id)}
                >
                  <AlertTriangle
                    className={`h-4 w-4 mt-0.5 shrink-0 ${
                      p.supported === "yes"
                        ? "text-success-600"
                        : p.supported === "scope_exception"
                          ? "text-warning-600"
                          : "text-ink-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-medium text-ink-900">
                        {p.body}
                      </span>
                      <Badge tone={tone}>
                        {p.supported === "yes"
                          ? "Supported"
                          : p.supported === "scope_exception"
                            ? "Scope exception"
                            : p.supported === "no"
                              ? "Not supported"
                              : "Unknown"}
                      </Badge>
                    </div>
                    <div className="mt-0.5 text-[12px] text-ink-500">
                      {c.name} · raised {relativeTime(p.at)}
                    </div>
                    {p.resolution && (
                      <div className="mt-1 text-[11.5px] text-ink-600 italic">
                        Resolution: {p.resolution}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-ink-300 mt-1" />
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2" pad={false}>
          <div className="px-5 pt-5">
            <CardHeader
              eyebrow="Your handoffs"
              title={`${active.length} accounts in onboarding`}
              description="What's happening to deals you closed."
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-head pl-5">Client</th>
                  <th className="table-head">Stage</th>
                  <th className="table-head">Health</th>
                  <th className="table-head">Onboarding owner</th>
                  <th className="table-head text-right">Value</th>
                  <th className="table-head pr-5">Closed</th>
                </tr>
              </thead>
              <tbody>
                {active.slice(0, 8).map((c) => {
                  const owner = teamById[c.ownerId];
                  return (
                    <tr
                      key={c.id}
                      onClick={() => openClient(c.id)}
                      className="border-b border-ink-100 last:border-0 hover:bg-ink-50/40 cursor-pointer"
                    >
                      <td className="table-cell pl-5">
                        <div className="font-medium text-ink-900">{c.name}</div>
                        <div className="text-[11px] text-ink-400">
                          {c.industry} · {c.plan}
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
                        <Badge tone="neutral">
                          {STAGES.find((s) => s.id === c.stage)?.short}
                        </Badge>
                      </td>
                      <td className="table-cell">
                        <HealthBadge health={c.health} />
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1.5">
                          <Avatar ownerId={owner?.id} size="xs" />
                          <span className="text-[12px]">
                            {owner?.name.split(" ")[0]}
                          </span>
                        </div>
                      </td>
                      <td className="table-cell text-right font-medium text-ink-900">
                        {fmtMoney(c.contractValue)}
                      </td>
                      <td className="table-cell pr-5 text-[12px] text-ink-500">
                        {relativeTime(c.closedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <HandoffTimeline limit={8} />
      </div>
    </div>
  );
}
