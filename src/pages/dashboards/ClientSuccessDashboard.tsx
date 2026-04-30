import { Sparkles, HeartHandshake, Rocket, ChevronRight, TrendingUp } from "lucide-react";
import { useStore } from "../../state/DataStore";
import { useAppState } from "../../state/AppState";
import { Kpi } from "../../components/dashboard/Kpi";
import { Card, CardHeader } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { Badge, HealthBadge } from "../../components/ui/Badge";
import { fmtMoney, relativeTime, fmtDate } from "../../lib/format";
import { teamById } from "../../data/team";
import { STAGES } from "../../data/types";
import { AILine } from "../../components/ai/AIHint";

export function ClientSuccessDashboard() {
  const store = useStore();
  const { currentUser, currentUserId, openClient, openAI } = useAppState();

  const myClients = store.clients.filter((c) => c.csmId === currentUserId);
  const readyForHandoff = myClients.filter(
    (c) => c.stage === "live" || c.health === "ready_for_launch",
  );
  const inProgress = myClients.filter(
    (c) => c.stage !== "live" && c.stage !== "transitioned",
  );
  const transitioned = myClients.filter((c) => c.stage === "transitioned");
  const launched = myClients.filter((c) => c.goLiveActual);
  const avgTtv = launched.length
    ? Math.round(
        launched.reduce(
          (s, c) =>
            s +
            (new Date(c.goLiveActual!).getTime() -
              new Date(c.closedAt).getTime()) /
              86400000,
          0,
        ) / launched.length,
      )
    : 0;

  const sparkUp = [40, 42, 41, 48, 52, 50, 58].map((v) => ({ v }));
  const sparkFlat = [40, 41, 42, 41, 43, 42, 42].map((v) => ({ v }));

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-[12px] text-ink-500">
            Welcome back, {currentUser.name.split(" ")[0]} · CSM view
          </div>
          <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">
            Client success readiness
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">
            <span className="font-semibold text-ink-700">{inProgress.length}</span>{" "}
            in onboarding ·{" "}
            <span className="font-semibold text-ink-700">
              {readyForHandoff.length}
            </span>{" "}
            ready for transition · avg time-to-value{" "}
            <span className="font-semibold text-ink-700">{avgTtv}d</span>
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-brand-700 bg-brand-50/50 ring-1 ring-brand-100 rounded-md px-2 py-0.5">
            <Sparkles className="h-3 w-3" />
            <span>
              <span className="font-semibold">Solene Beauty's holiday season</span>{" "}
              starts in 5 weeks — schedule playbook walkthrough before then.
            </span>
          </div>
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
          label="My portfolio"
          value={String(myClients.length)}
          sub={`${transitioned.length} steady-state`}
          spark={sparkUp}
        />
        <Kpi
          label="Ready for handoff"
          value={String(readyForHandoff.length)}
          sub="Approaching transition"
          trend={{ delta: 1, label: "+1 vs. last week" }}
          spark={sparkUp}
          accent="#10b981"
        />
        <Kpi
          label="Avg time-to-value"
          value={`${avgTtv}d`}
          sub="Closed → live"
          trend={{ delta: 4, label: "vs. trailing 90d", good: "down" }}
          spark={sparkFlat}
          accent="#0e8a99"
        />
        <Kpi
          label="Transitioned (30d)"
          value={String(transitioned.length)}
          sub="Now in steady state"
          trend={{ delta: 50, label: "vs. last month" }}
          spark={sparkUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Ready-for-transition */}
        <Card pad={false}>
          <div className="px-5 pt-5">
            <CardHeader
              eyebrow="Ready for transition"
              title="Accounts approaching CSM handoff"
              description="Plan adoption playbook + 30-60-90 day check-ins now."
            />
          </div>
          {readyForHandoff.length === 0 ? (
            <div className="px-5 py-6 text-sm text-ink-500">
              Nothing in transition queue yet.
            </div>
          ) : (
            <ul className="divide-y divide-ink-100">
              {readyForHandoff.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => openClient(c.id)}
                    className="w-full text-left px-5 py-3 hover:bg-ink-50/40 flex items-start gap-3"
                  >
                    <Rocket className="h-4 w-4 text-brand-600 mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-semibold text-ink-900">
                          {c.name}
                        </span>
                        <Badge tone="neutral">
                          {STAGES.find((s) => s.id === c.stage)?.short}
                        </Badge>
                        <HealthBadge health={c.health} />
                      </div>
                      <div className="text-[11.5px] text-ink-500 mt-0.5">
                        {c.recommendedAction}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[12px] font-semibold text-ink-900">
                        {fmtMoney(c.contractValue)}
                      </div>
                      <div className="text-[10.5px] text-ink-500">
                        {c.goLiveActual
                          ? `Live ${relativeTime(c.goLiveActual)}`
                          : `Live ${fmtDate(c.goLiveTarget)}`}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-ink-300 mt-1" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Adoption health board (synthesized) */}
        <Card>
          <CardHeader
            eyebrow="Adoption health · post-launch"
            title="Steady-state portfolio at a glance"
          />
          {transitioned.length + launched.length === 0 ? (
            <div className="text-sm text-ink-500 py-6">
              No live accounts in your portfolio yet.
            </div>
          ) : (
            <ul className="space-y-3">
              {[...launched, ...transitioned].slice(0, 5).map((c) => {
                const score = 65 + Math.round(Math.random() * 30); // mock
                return (
                  <li
                    key={c.id}
                    className="flex items-center gap-3 hover:bg-ink-50/40 -mx-2 px-2 py-1.5 rounded-md cursor-pointer"
                    onClick={() => openClient(c.id)}
                  >
                    <Avatar ownerId={c.ownerId} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold text-ink-900 truncate">
                          {c.name}
                        </span>
                        <span
                          className={`text-[11px] font-semibold ${
                            score >= 80
                              ? "text-success-700"
                              : score >= 60
                                ? "text-brand-700"
                                : "text-warning-700"
                          }`}
                        >
                          {score} adoption
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            score >= 80
                              ? "bg-success-500"
                              : score >= 60
                                ? "bg-brand-500"
                                : "bg-warning-500"
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <div className="mt-0.5 text-[10.5px] text-ink-500 inline-flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {c.industry} ·{" "}
                        {c.goLiveActual
                          ? `live ${relativeTime(c.goLiveActual)}`
                          : "approaching launch"}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* In-progress watch (you'll inherit these) */}
      <Card pad={false}>
        <div className="px-5 pt-5">
          <CardHeader
            eyebrow="On deck (in onboarding)"
            title="Clients you'll inherit when they launch"
            description="Get ahead of context — these become your portfolio."
          />
        </div>
        <ul className="divide-y divide-ink-100">
          {inProgress.slice(0, 6).map((c) => {
            const owner = teamById[c.ownerId];
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => openClient(c.id)}
                  className="w-full text-left px-5 py-3 hover:bg-ink-50/40 flex items-center gap-3"
                >
                  <HeartHandshake className="h-4 w-4 text-brand-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-semibold text-ink-900">
                        {c.name}
                      </span>
                      <Badge tone="neutral">
                        {STAGES.find((s) => s.id === c.stage)?.short}
                      </Badge>
                      <HealthBadge health={c.health} />
                    </div>
                    {c.aiInsights[0] && (
                      <div className="mt-1">
                        <AILine weight={c.aiInsights[0].weight}>
                          {c.aiInsights[0].body}
                        </AILine>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Avatar ownerId={owner?.id} size="xs" />
                    <span className="text-[11px] text-ink-500">
                      {owner?.name.split(" ")[0]}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
