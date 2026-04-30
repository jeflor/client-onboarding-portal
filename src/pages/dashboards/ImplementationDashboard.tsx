import { Sparkles, Wrench, FileMinus, ChevronRight, AlertOctagon } from "lucide-react";
import { useStore } from "../../state/DataStore";
import { useAppState } from "../../state/AppState";
import { Kpi } from "../../components/dashboard/Kpi";
import { Card, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { fmtMoney, fmtDate } from "../../lib/format";
import { documentsByClient } from "../../data/documents";
import { STAGES } from "../../data/types";
import { AILine } from "../../components/ai/AIHint";

export function ImplementationDashboard() {
  const store = useStore();
  const { currentUser, currentUserId, openClient, openAI } = useAppState();

  const myClients = store.clients.filter(
    (c) => c.implementerId === currentUserId,
  );
  const inImpl = myClients.filter(
    (c) =>
      c.stage === "asset_collection" ||
      c.stage === "configuration" ||
      c.stage === "uat" ||
      c.stage === "launch_prep",
  );
  const awaitingAssets = myClients.filter(
    (c) => c.dataIssues.length > 0 || c.blockers.some((b) => b.kind === "awaiting_client_assets"),
  );
  const setupReady = myClients.filter(
    (c) => c.stage === "uat" || c.stage === "launch_prep",
  );
  const techDeps = store.clients.flatMap((c) =>
    c.blockers.filter((b) => b.kind === "tech_dependency" || b.kind === "scope_exception"),
  );

  // Missing technical inputs across my clients (as a list)
  const missingDocs = myClients
    .flatMap((c) =>
      documentsByClient(c.id)
        .filter((d) => d.required && d.status === "missing")
        .map((d) => ({ ...d, client: c })),
    )
    .slice(0, 8);

  const sparkUp = [40, 42, 41, 48, 52, 50, 58].map((v) => ({ v }));
  const sparkFlat = [40, 41, 42, 41, 43, 42, 42].map((v) => ({ v }));

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.12em] text-brand-700 font-semibold mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 inline-block" />
            Operations desk · Implementation
          </div>
          <h1 className="text-3xl font-semibold text-ink-900 tracking-tight">
            Implementation readiness
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            Welcome back, {currentUser?.name.split(" ")[0]}.{" "}
            <span className="font-semibold text-ink-700">{inImpl.length}</span>{" "}
            in active configuration ·{" "}
            <span className="font-semibold text-ink-700">{missingDocs.length}</span>{" "}
            missing technical inputs · {techDeps.length} unresolved tech dependencies
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-warning-700 bg-warning-50/60 ring-1 ring-warning-100 rounded-md px-2 py-0.5">
            <Sparkles className="h-3 w-3" />
            <span>
              <span className="font-semibold">Helix Robotics SSO blocked</span> on
              DPA legal review (7d) — dry-run can't proceed. Pacific Ridge
              custom routing scope still ambiguous.
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
          label="My configurations"
          value={String(myClients.length)}
          sub={`${inImpl.length} in active build`}
          spark={sparkUp}
        />
        <Kpi
          label="Awaiting client inputs"
          value={String(awaitingAssets.length)}
          sub="Assets / forms / access"
          trend={{ delta: 1, label: "+1 vs. yesterday", good: "down" }}
          spark={sparkFlat}
          accent="#f97316"
        />
        <Kpi
          label="Setup ready / UAT"
          value={String(setupReady.length)}
          sub="Late-stage healthy"
          trend={{ delta: 12, label: "vs. last week" }}
          spark={sparkUp}
          accent="#10b981"
        />
        <Kpi
          label="Tech dependencies"
          value={String(techDeps.length)}
          sub="Open across team"
          trend={{ delta: 1, label: "vs. last week", good: "down" }}
          spark={sparkFlat}
          accent="#f59e0b"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Missing technical inputs */}
        <Card>
          <CardHeader
            eyebrow="Missing technical inputs"
            title="Inputs you need from clients to proceed"
            description="Each row is a required document or asset that's not yet uploaded."
          />
          {missingDocs.length === 0 ? (
            <div className="text-sm text-ink-500 py-4">
              You're not waiting on anything. Healthy queue.
            </div>
          ) : (
            <ul className="space-y-1.5">
              {missingDocs.map((d) => (
                <li
                  key={d.id}
                  className="rounded-lg border border-ink-200 hover:border-warning-300 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => openClient(d.client.id)}
                    className="w-full text-left p-2.5 flex items-start gap-2.5"
                  >
                    <FileMinus className="h-3.5 w-3.5 text-warning-600 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-medium text-ink-900 truncate">
                        {d.name}
                      </div>
                      <div className="text-[11px] text-ink-500">
                        {d.client.name} · required ·{" "}
                        {d.note ?? "Not yet uploaded"}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-ink-300" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Configurations in flight */}
        <Card pad={false}>
          <div className="px-5 pt-5">
            <CardHeader
              eyebrow="Configurations in flight"
              title="Your active builds"
              description="What's on your bench right now."
            />
          </div>
          <ul className="divide-y divide-ink-100">
            {inImpl.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => openClient(c.id)}
                  className="w-full text-left px-5 py-3 hover:bg-ink-50/40 flex items-start gap-3"
                >
                  <Wrench className="h-4 w-4 text-brand-600 mt-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-semibold text-ink-900">
                        {c.name}
                      </span>
                      <Badge tone="neutral">
                        {STAGES.find((s) => s.id === c.stage)?.short}
                      </Badge>
                      <span className="text-[11px] text-ink-500">
                        {c.daysInStage}d in stage
                      </span>
                    </div>
                    <div className="text-[11.5px] text-ink-500 mt-0.5">
                      {c.recommendedAction}
                    </div>
                    {c.blockers.find(
                      (b) =>
                        b.kind === "tech_dependency" ||
                        b.kind === "scope_exception",
                    ) && (
                      <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-warning-700">
                        <AlertOctagon className="h-3 w-3" />
                        {
                          c.blockers.find(
                            (b) =>
                              b.kind === "tech_dependency" ||
                              b.kind === "scope_exception",
                          )!.label
                        }
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[12px] font-semibold text-ink-900">
                      {fmtMoney(c.contractValue)}
                    </div>
                    <div className="text-[10.5px] text-ink-500">
                      live {fmtDate(c.goLiveTarget)}
                    </div>
                  </div>
                </button>
              </li>
            ))}
            {inImpl.length === 0 && (
              <li className="px-5 py-6 text-center text-sm text-ink-500">
                No active builds.
              </li>
            )}
          </ul>
        </Card>
      </div>

      {/* Pre-launch checklist (synthesized) */}
      <Card>
        <CardHeader
          eyebrow="Pre-launch checklist"
          title="Cross-client readiness"
          description="Aggregate readiness on accounts approaching go-live."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {myClients
            .filter(
              (c) => c.stage === "uat" || c.stage === "launch_prep" || c.stage === "configuration",
            )
            .slice(0, 6)
            .map((c) => {
              const top = c.aiInsights[0];
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => openClient(c.id)}
                  className="text-left rounded-lg border border-ink-200 hover:border-brand-300 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-ink-900">
                      {c.name}
                    </span>
                    <Avatar ownerId={c.ownerId} size="xs" />
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        c.completionPct >= 85
                          ? "bg-success-500"
                          : c.completionPct >= 60
                            ? "bg-brand-500"
                            : "bg-warning-500"
                      }`}
                      style={{ width: `${c.completionPct}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px]">
                    <span className="text-ink-500">
                      {c.checklistComplete}/{c.checklistTotal} items
                    </span>
                    <span className="font-semibold text-ink-700">
                      {c.completionPct}%
                    </span>
                  </div>
                  {top && (
                    <div className="mt-2">
                      <AILine weight={top.weight}>{top.body}</AILine>
                    </div>
                  )}
                </button>
              );
            })}
        </div>
      </Card>
    </div>
  );
}
