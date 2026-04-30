import { Calendar, Filter, Sparkles } from "lucide-react";
import { useStore } from "../../state/DataStore";
import { useAppState } from "../../state/AppState";
import { Kpi } from "../../components/dashboard/Kpi";
import { HealthBoard } from "../../components/dashboard/HealthBoard";
import { PriorityQueue } from "../../components/dashboard/PriorityQueue";
import { AtRiskTable } from "../../components/dashboard/AtRiskTable";
import { HandoffTimeline } from "../../components/dashboard/HandoffTimeline";

export function OnboardingManagerDashboard() {
  const store = useStore();
  const { currentUser, openAI } = useAppState();
  const open = store.clients.filter(
    (c) => c.stage !== "live" && c.stage !== "transitioned",
  );
  const atRisk = open.filter(
    (c) => c.health === "at_risk" || c.health === "internal_blocked",
  );
  const totalAtRiskValue = atRisk.reduce((s, c) => s + c.contractValue, 0);
  const pendingClientTasks = store.tasks.filter(
    (t) =>
      t.kind === "client_task" && t.status !== "complete" && t.status !== "skipped",
  ).length;
  const internalBlockers = store.clients.flatMap((c) => c.blockers).length;
  const kickoffsThisWeek = store.activities.filter(
    (a) =>
      a.kind === "kickoff_scheduled" &&
      Math.abs(new Date(a.at).getTime() - Date.now()) < 7 * 86400000,
  ).length;
  // Avg time to launch — among recent transitioned/live
  const launched = store.clients.filter(
    (c) => c.goLiveActual,
  );
  const avgTtl = launched.length
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
  const sparkDown = [62, 58, 55, 50, 48, 44, 41].map((v) => ({ v }));
  const sparkFlat = [40, 41, 42, 41, 43, 42, 42].map((v) => ({ v }));
  const sparkSpike = [21, 24, 25, 28, 32, 35, 41].map((v) => ({ v }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.12em] text-brand-700 font-semibold mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 inline-block" />
            Operations desk · Onboarding Manager
          </div>
          <h1 className="text-3xl font-semibold text-ink-900 display tracking-tight">
            Queue control
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            Welcome back, {currentUser.name.split(" ")[0]}.{" "}
            <span className="font-semibold text-ink-700">{open.length}</span>{" "}
            active onboardings ·{" "}
            <span className="font-semibold text-ink-700">{atRisk.length}</span>{" "}
            at risk · {kickoffsThisWeek} kickoffs this week
          </p>
          {/* Ambient AI synthesis */}
          <div className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-warning-700 bg-warning-50/60 ring-1 ring-warning-100 rounded-md px-2 py-0.5">
            <Sparkles className="h-3 w-3" />
            <span>
              <span className="font-semibold">Forecast risk:</span> Aldridge
              ($128k) past go-live by 3d with sponsor ghosted; Helix ($84k)
              blocked on legal. ~$212k of bookings at risk this week.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" type="button">
            <Calendar className="h-4 w-4" />
            Last 30 days
          </button>
          <button className="btn-secondary" type="button">
            <Filter className="h-4 w-4" />
            Filters
          </button>
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

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <Kpi
          label="Active onboardings"
          value={String(open.length)}
          sub={`${atRisk.length} at risk`}
          trend={{ delta: 7.1, label: "vs. last 30 days" }}
          spark={sparkUp}
          accent="#0e8a99"
        />
        <Kpi
          label="At-risk clients"
          value={String(atRisk.length)}
          sub={`$${Math.round(totalAtRiskValue / 1000)}k contract value`}
          trend={{ delta: 1, label: "+1 vs. last week", good: "down" }}
          spark={sparkFlat}
          accent="#ef4444"
        />
        <Kpi
          label="Avg time to launch"
          value={`${avgTtl}d`}
          sub="Closed-won → live"
          trend={{ delta: 4.3, label: "vs. trailing 90d", good: "down" }}
          spark={sparkDown}
          accent="#0e8a99"
        />
        <Kpi
          label="Pending client tasks"
          value={String(pendingClientTasks)}
          sub="Awaiting client action"
          trend={{ delta: 2, label: "+2 vs. yesterday", good: "down" }}
          spark={sparkFlat}
          accent="#f97316"
        />
        <Kpi
          label="Internal blockers"
          value={String(internalBlockers)}
          sub="Across all accounts"
          trend={{ delta: 1, label: "vs. last week", good: "down" }}
          spark={sparkFlat}
          accent="#f59e0b"
        />
        <Kpi
          label="Kickoffs this week"
          value={String(kickoffsThisWeek)}
          sub="Within 7 days"
          trend={{ delta: 25, label: "vs. last week" }}
          spark={sparkSpike}
          accent="#10b981"
        />
      </div>

      <HealthBoard />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <AtRiskTable />
        </div>
        <PriorityQueue />
      </div>

      <HandoffTimeline />
    </div>
  );
}
