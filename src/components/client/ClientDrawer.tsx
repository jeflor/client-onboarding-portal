import { useEffect, useState } from "react";
import {
  X,
  Building2,
  Briefcase,
  Mail,
  Calendar,
  Sparkles,
  CheckSquare,
  Plus,
  AlertOctagon,
  Paperclip,
  MessageSquare,
  ScrollText,
  AtSign,
  Pin,
  History,
  CheckCircle2,
  CircleHelp,
  Stamp,
  Users,
  Wrench,
  Rocket,
  ShieldAlert,
  ChevronDown,
  ArrowRight,
  HandHeart,
  Phone,
  ExternalLink,
} from "lucide-react";
import { useAppState } from "../../state/AppState";
import { useStore } from "../../state/DataStore";
import { useToast } from "../../state/Toaster";
import { teamById } from "../../data/team";
import { tasksByClient } from "../../data/tasks";
import { approvalsByClient } from "../../data/approvals";
import { documentsByClient } from "../../data/documents";
import { STAGES } from "../../data/types";
import type {
  Client,
  OnboardingStage,
  ApprovalStatus,
  DocumentStatus,
  CrossFunctionalConflict,
  ReconciliationItem,
  AIDetection,
} from "../../data/types";
import { Avatar } from "../ui/Avatar";
import { Badge, HealthBadge } from "../ui/Badge";
import {
  DataIssuePills,
  FlagPills,
  EscalationPill,
} from "../signals/SignalPills";
import { AIHint } from "../ai/AIHint";
import type { TeamMember } from "../../data/types";
import { fmtDate, fmtMoneyFull, relativeTime } from "../../lib/format";
import {
  conflictsByClient,
  reconciliationByClient,
  aiDetectionsByClient,
} from "../../data/mess";
import { roleLabel } from "../../data/team";
import { Search, Swords } from "lucide-react";

type Tab =
  | "overview"
  | "checklist"
  | "stakeholders"
  | "promises"
  | "conflicts"
  | "blockers"
  | "tasks"
  | "approvals"
  | "documents"
  | "internal"
  | "history";

const stageOrder = STAGES;

export function ClientDrawer() {
  const { openClientId, closeClient, openAI, openQuickLog, currentUserId } =
    useAppState();
  const store = useStore();
  const toast = useToast();
  const client = openClientId ? store.clientById(openClientId) : null;

  const [tab, setTab] = useState<Tab>("overview");
  const [stageMenuOpen, setStageMenuOpen] = useState(false);

  useEffect(() => {
    setTab("overview");
    setStageMenuOpen(false);
  }, [openClientId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeClient();
    };
    if (openClientId) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openClientId, closeClient]);

  if (!client) return null;

  const owner = teamById[client.ownerId];
  const implementer = client.implementerId
    ? teamById[client.implementerId]
    : null;
  const csm = client.csmId ? teamById[client.csmId] : null;
  const salesRep = teamById[client.salesRepId];
  const stageIdx = stageOrder.findIndex((s) => s.id === client.stage);
  const myTasks = tasksByClient(client.id);
  const myApprovals = approvalsByClient(client.id);
  const myDocs = documentsByClient(client.id);
  const myComments = store.internalComments.filter(
    (c) => c.clientId === client.id,
  );
  const myActivities = store.activities
    .filter((a) => a.clientId === client.id)
    .sort((a, b) => (a.at < b.at ? 1 : -1));
  const conflicts = conflictsByClient[client.id] ?? [];
  const openConflicts = conflicts.filter(
    (c) => c.status === "open" || c.status === "in_discussion",
  );
  const recon = reconciliationByClient[client.id] ?? [];
  const openRecon = recon.filter((r) => r.status === "open");
  const aiDetections = aiDetectionsByClient[client.id] ?? [];

  const openTasks = myTasks.filter(
    (t) => t.status !== "complete" && t.status !== "skipped",
  );
  const openApprovals = myApprovals.filter((a) => a.status === "pending" || a.status === "needs_info");
  const missingDocs = myDocs.filter(
    (d) => d.required && d.status !== "approved",
  );

  const moveStage = (to: OnboardingStage) => {
    store.changeStage({ clientId: client.id, actorId: currentUserId, to });
    toast.success(`Stage → ${to.replace("_", " ")} · ${client.name}`);
    setStageMenuOpen(false);
  };

  const goLiveDays = Math.round(
    (new Date(client.goLiveTarget).getTime() - Date.now()) / 86400000,
  );

  return (
    <>
      <div
        onClick={closeClient}
        className="fixed inset-0 bg-ink-900/30 backdrop-blur-sm z-40"
      />
      <aside className="fixed top-0 right-0 h-screen w-full sm:w-[700px] bg-white shadow-drawer z-50 flex flex-col">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-ink-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge tone="neutral">{client.id}</Badge>
              <HealthBadge health={client.health} />
              <Badge tone="brand">{client.plan}</Badge>
              {client.flags.includes("client_ghosted") && (
                <span className="badge-danger">Client ghosted</span>
              )}
              {client.flags.includes("scope_promise_unresolved") && (
                <span className="badge-danger">Scope promise open</span>
              )}
              {client.flags.includes("kickoff_rescheduled_2x") && (
                <span className="badge-warning">Kickoff resched 2×</span>
              )}
              {store.activities.some(
                (a) =>
                  a.clientId === client.id &&
                  a.kind === "internal_note" &&
                  a.summary.includes("Escalated"),
              ) && <EscalationPill />}
            </div>
            <button
              onClick={closeClient}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-ink-100 text-ink-500"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex items-start gap-3">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: "#155e69" }}
            >
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-ink-900 truncate">
                {client.name}
              </h2>
              <div className="text-sm text-ink-500 truncate">
                {client.industry} ·{" "}
                <span className="text-ink-700">{client.plan}</span> · contract{" "}
                <span className="text-ink-700">
                  {fmtMoneyFull(client.contractValue)}
                </span>
              </div>
              <div className="mt-1 text-[12px] text-ink-400 flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Avatar ownerId={owner?.id} size="xs" />
                  Owner: {owner?.name.split(" ")[0]}
                </span>
                {implementer && (
                  <span className="inline-flex items-center gap-1">
                    <Wrench className="h-3 w-3" />
                    {implementer.name.split(" ")[0]}
                  </span>
                )}
                {csm && (
                  <span className="inline-flex items-center gap-1">
                    <HandHeart className="h-3 w-3" />
                    {csm.name.split(" ")[0]}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px] text-ink-400">Go-live target</div>
              <div
                className={`text-base font-semibold ${
                  goLiveDays < 0
                    ? "text-danger-700"
                    : goLiveDays <= 7
                      ? "text-warning-700"
                      : "text-ink-900"
                }`}
              >
                {fmtDate(client.goLiveTarget)}
              </div>
              <div className="text-[11px] text-ink-500">
                {goLiveDays < 0
                  ? `${Math.abs(goLiveDays)}d past`
                  : `in ${goLiveDays}d`}
              </div>
            </div>
          </div>

          {/* Stage progress */}
          <div className="mt-4">
            <div className="flex items-center gap-1">
              {stageOrder.slice(0, 8).map((s, i) => {
                const passed = i <= stageIdx;
                const current = i === stageIdx;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => moveStage(s.id)}
                    className="flex-1 flex flex-col items-center gap-1 group"
                    title={`Move to ${s.label}`}
                  >
                    <div
                      className={`h-1.5 w-full rounded-full transition-colors ${
                        passed ? "bg-brand-500" : "bg-ink-100"
                      } ${current ? "ring-2 ring-brand-200 ring-offset-1" : ""} group-hover:bg-brand-400`}
                    />
                    <span
                      className={`text-[9.5px] ${
                        passed
                          ? "text-ink-700 font-semibold"
                          : "text-ink-400"
                      }`}
                    >
                      {s.short}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="px-5 py-3 border-b border-ink-200 bg-ink-50/40 flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => openQuickLog({ clientId: client.id, initialMode: "client_task" })}
            className="btn-primary"
          >
            <CheckSquare className="h-3.5 w-3.5" />
            Client task
          </button>
          <button
            type="button"
            onClick={() => openQuickLog({ clientId: client.id, initialMode: "internal_task" })}
            className="btn-secondary"
          >
            <CheckSquare className="h-3.5 w-3.5" />
            Internal task
          </button>
          <button
            type="button"
            onClick={() => openQuickLog({ clientId: client.id, initialMode: "note" })}
            className="btn-secondary"
          >
            <ScrollText className="h-3.5 w-3.5" />
            Note
          </button>
          <button
            type="button"
            onClick={() =>
              openQuickLog({ clientId: client.id, initialMode: "blocker" })
            }
            className="btn-secondary text-warning-700 border-warning-200"
          >
            <AlertOctagon className="h-3.5 w-3.5" />
            Block
          </button>
          <button
            type="button"
            onClick={() => {
              store.pushGoLive({
                clientId: client.id,
                actorId: currentUserId,
                days: 7,
              });
              toast.warning(`Go-live pushed +7d · ${client.name}`);
            }}
            className="btn-secondary"
          >
            <Calendar className="h-3.5 w-3.5" />
            +7d
          </button>
          <button
            type="button"
            onClick={() => {
              store.escalate({
                clientId: client.id,
                actorId: currentUserId,
                reason: client.recommendedAction,
              });
              toast.success("Escalated to manager");
            }}
            className="btn-secondary text-danger-700 border-danger-200"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Escalate
          </button>
          <div className="ml-auto relative">
            <button
              type="button"
              onClick={() => setStageMenuOpen((v) => !v)}
              className="btn-secondary"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              Move stage
              <ChevronDown className="h-3 w-3 -mr-0.5" />
            </button>
            {stageMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-ink-200 rounded-lg shadow-pop z-30 py-1">
                {stageOrder.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => moveStage(s.id)}
                    className={`w-full text-left px-3 py-1.5 text-[12.5px] hover:bg-ink-50 ${
                      s.id === client.stage
                        ? "text-brand-700 font-semibold"
                        : "text-ink-700"
                    }`}
                  >
                    {s.label}
                    {s.id === client.stage && " · current"}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => openAI(client.id)}
            className="btn-primary bg-brand-700"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI
          </button>
        </div>

        {/* Active blockers banner */}
        {client.blockers.length > 0 && (
          <div className="px-5 py-2.5 bg-warning-50 border-b border-warning-100">
            <div className="flex items-start gap-2">
              <AlertOctagon className="h-4 w-4 text-warning-700 mt-0.5 shrink-0" />
              <div className="flex-1 text-[12.5px] text-warning-800">
                <span className="font-semibold">
                  Active {client.blockers.length === 1 ? "blocker" : "blockers"}:
                </span>{" "}
                {client.blockers.map((b, i) => (
                  <span key={b.id}>
                    {i > 0 && " · "}
                    <span className="font-semibold">{b.label}</span>{" "}
                    <span className="text-warning-700/80">
                      ({relativeTime(b.since)})
                    </span>
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setTab("blockers")}
                className="text-[11px] font-semibold text-warning-700 hover:underline"
              >
                Review
              </button>
            </div>
          </div>
        )}

        {/* Data issues banner */}
        {client.dataIssues.length > 0 && (
          <div className="px-5 py-2 bg-ink-50/80 border-b border-ink-100 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
              Data issues:
            </span>
            <DataIssuePills client={client} max={5} />
          </div>
        )}

        {/* Cross-functional tension banner */}
        {openConflicts.length > 0 && (
          <div className="px-5 py-2.5 bg-danger-50/60 border-b border-danger-100">
            <div className="flex items-start gap-2">
              <Swords className="h-4 w-4 text-danger-700 mt-0.5 shrink-0" />
              <div className="flex-1 text-[12.5px] text-danger-800">
                <span className="font-semibold">
                  Cross-functional tension:
                </span>{" "}
                {openConflicts.slice(0, 2).map((c, i) => (
                  <span key={c.id}>
                    {i > 0 && " · "}
                    <span className="font-semibold">{c.title}</span>{" "}
                    <span className="text-danger-700/80">
                      ({c.between.map((b) => roleLabel[b]).join(" ↔ ")})
                    </span>
                  </span>
                ))}
                {openConflicts.length > 2 &&
                  ` · +${openConflicts.length - 2} more`}
              </div>
              <button
                type="button"
                onClick={() => setTab("conflicts")}
                className="text-[11px] font-semibold text-danger-700 hover:underline"
              >
                Resolve
              </button>
            </div>
          </div>
        )}

        {/* "Client says they sent X" reconciliation banner */}
        {openRecon.length > 0 && (
          <div className="px-5 py-2 bg-warning-50/40 border-b border-warning-100 flex items-center gap-2 flex-wrap">
            <Search className="h-3.5 w-3.5 text-warning-600 shrink-0" />
            <span className="text-[11.5px] text-warning-800">
              <span className="font-semibold">
                {openRecon.length} reconciliation
                {openRecon.length === 1 ? "" : "s"} open:
              </span>{" "}
              client says they sent {openRecon[0].what}
              {openRecon.length > 1 && ` + ${openRecon.length - 1} more`}
            </span>
            <button
              type="button"
              onClick={() => setTab("conflicts")}
              className="ml-auto text-[11px] font-semibold text-warning-700 hover:underline"
            >
              Reconcile
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="px-5 border-b border-ink-200 overflow-x-auto">
          <div className="flex gap-1 -mb-px whitespace-nowrap">
            <TabBtn id="overview" tab={tab} onClick={() => setTab("overview")}>
              Overview
            </TabBtn>
            <TabBtn id="checklist" tab={tab} onClick={() => setTab("checklist")}>
              Checklist
              <span className="ml-1 text-[10px] text-ink-400 font-semibold">
                {client.checklistComplete}/{client.checklistTotal}
              </span>
            </TabBtn>
            <TabBtn id="stakeholders" tab={tab} onClick={() => setTab("stakeholders")}>
              Stakeholders
              <span className="ml-1 text-[10px] text-ink-400 font-semibold">
                {client.stakeholders.length}
              </span>
            </TabBtn>
            <TabBtn id="promises" tab={tab} onClick={() => setTab("promises")}>
              Sales handoff
              {client.promises.length > 0 && (
                <span className="ml-1 text-[10px] text-ink-400 font-semibold">
                  {client.promises.length}
                </span>
              )}
            </TabBtn>
            <TabBtn id="conflicts" tab={tab} onClick={() => setTab("conflicts")}>
              Cross-fn
              {openConflicts.length + openRecon.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center text-[10px] bg-danger-100 text-danger-700 rounded-full px-1.5 font-semibold">
                  {openConflicts.length + openRecon.length}
                </span>
              )}
            </TabBtn>
            <TabBtn id="blockers" tab={tab} onClick={() => setTab("blockers")}>
              Blockers
              {client.blockers.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center text-[10px] bg-warning-100 text-warning-700 rounded-full px-1.5">
                  {client.blockers.length}
                </span>
              )}
            </TabBtn>
            <TabBtn id="tasks" tab={tab} onClick={() => setTab("tasks")}>
              Tasks
              <span className="ml-1 text-[10px] text-ink-400 font-semibold">
                {openTasks.length}
              </span>
            </TabBtn>
            <TabBtn id="approvals" tab={tab} onClick={() => setTab("approvals")}>
              Approvals
              {openApprovals.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center text-[10px] bg-brand-100 text-brand-700 rounded-full px-1.5">
                  {openApprovals.length}
                </span>
              )}
            </TabBtn>
            <TabBtn id="documents" tab={tab} onClick={() => setTab("documents")}>
              Documents
              {missingDocs.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center text-[10px] bg-warning-100 text-warning-700 rounded-full px-1.5">
                  {missingDocs.length}!
                </span>
              )}
            </TabBtn>
            <TabBtn id="internal" tab={tab} onClick={() => setTab("internal")}>
              Internal
              {myComments.length > 0 && (
                <span className="ml-1 text-[10px] text-ink-400 font-semibold">
                  {myComments.length}
                </span>
              )}
            </TabBtn>
            <TabBtn id="history" tab={tab} onClick={() => setTab("history")}>
              History
            </TabBtn>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {tab === "overview" && (
            <OverviewTab client={client} aiDetections={aiDetections} />
          )}
          {tab === "checklist" && <ChecklistTab client={client} />}
          {tab === "stakeholders" && <StakeholdersTab client={client} />}
          {tab === "promises" && (
            <PromisesTab
              client={client}
              salesRep={salesRep}
              aiDetections={aiDetections}
            />
          )}
          {tab === "conflicts" && (
            <ConflictsTab
              client={client}
              conflicts={conflicts}
              recon={recon}
            />
          )}
          {tab === "blockers" && (
            <BlockersTab client={client} aiDetections={aiDetections} />
          )}
          {tab === "tasks" && <TasksTab client={client} aiDetections={aiDetections} />}
          {tab === "approvals" && (
            <ApprovalsTab client={client} aiDetections={aiDetections} />
          )}
          {tab === "documents" && (
            <DocumentsTab client={client} aiDetections={aiDetections} />
          )}
          {tab === "internal" && <InternalTab client={client} />}
          {tab === "history" && <HistoryTab client={client} activities={myActivities} />}
        </div>
      </aside>
    </>
  );
}

function TabBtn({
  id,
  tab,
  onClick,
  children,
}: {
  id: Tab;
  tab: Tab;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`px-3 py-2 text-[12.5px] font-medium border-b-2 inline-flex items-center ${
        tab === id
          ? "border-brand-600 text-ink-900"
          : "border-transparent text-ink-500 hover:text-ink-800"
      }`}
    >
      {children}
    </button>
  );
}

function Section({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="h-eyebrow">{title}</div>
        {right}
      </div>
      {children}
    </div>
  );
}

function OverviewTab({
  client,
  aiDetections,
}: {
  client: Client;
  aiDetections: AIDetection[];
}) {
  const { openAI, currentUserId } = useAppState();
  const store = useStore();
  const toast = useToast();
  const [draftNote, setDraftNote] = useState("");
  const lastOverride = client.manualOverrides[client.manualOverrides.length - 1];
  const overviewInsights = aiDetections.filter(
    (d) => d.surface === "tab_overview" || d.surface === "global",
  );

  return (
    <div className="p-5 space-y-5">
      {/* AI summary + insights */}
      <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-brand-700" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">
            AI onboarding summary
          </span>
        </div>
        <p className="text-[13.5px] text-ink-800 leading-relaxed">
          {client.aiSummary}
        </p>
        {client.aiInsights.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {client.aiInsights.map((i) => (
              <li key={i.id} className="flex items-start gap-2">
                <span
                  className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                    i.weight === "high"
                      ? "bg-warning-500"
                      : i.weight === "medium"
                        ? "bg-brand-500"
                        : "bg-ink-300"
                  }`}
                />
                <span className="text-[12.5px] text-ink-800">{i.body}</span>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={() => openAI(client.id)}
          className="mt-3 text-[11px] font-semibold text-brand-700 hover:underline"
        >
          Open full assistant →
        </button>
      </div>

      {/* AI detections — operational intelligence layer */}
      {overviewInsights.length > 0 && (
        <AIDetectionStrip detections={overviewInsights} />
      )}

      {/* Pinned note */}
      {client.pinnedNote && (
        <div className="rounded-lg border border-warning-200 bg-warning-50/40 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Pin className="h-3.5 w-3.5 text-warning-700" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-warning-700">
              Pinned by{" "}
              {client.pinnedNoteBy
                ? teamById[client.pinnedNoteBy]?.name.split(" ")[0]
                : "owner"}
            </span>
            {client.pinnedNoteAt && (
              <span className="text-[10px] text-ink-400">
                · {relativeTime(client.pinnedNoteAt)}
              </span>
            )}
          </div>
          <p className="text-[12.5px] text-ink-800 italic leading-relaxed">
            "{client.pinnedNote}"
          </p>
        </div>
      )}

      {/* Recommended action */}
      <Section title="Recommended next action">
        <div className="rounded-lg border border-ink-200 bg-ink-50/60 p-3 flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 text-warning-600 mt-0.5" />
          <div className="text-[12.5px] text-ink-700">
            <span className="font-semibold text-ink-900">
              {client.reasonSurfaced}.
            </span>{" "}
            <span className="text-brand-700 font-semibold">
              {client.recommendedAction}
            </span>
          </div>
        </div>
      </Section>

      <div className="grid grid-cols-2 gap-5">
        <Section title="Contract">
          <Row icon={Briefcase} label="Plan" value={client.plan} />
          <Row
            icon={Building2}
            label="Industry"
            value={client.industry}
          />
          <Row
            icon={Calendar}
            label="Closed-won"
            value={`${fmtDate(client.closedAt)} (${relativeTime(client.closedAt)})`}
          />
          <Row
            icon={Calendar}
            label="Go-live target"
            value={fmtDate(client.goLiveTarget)}
            warn={
              new Date(client.goLiveTarget).getTime() < Date.now() &&
              !client.goLiveActual
            }
          />
          {client.goLiveActual && (
            <Row
              icon={Rocket}
              label="Live since"
              value={`${fmtDate(client.goLiveActual)} (${relativeTime(client.goLiveActual)})`}
            />
          )}
          {client.legacyId && (
            <div className="text-[11px] text-ink-400 font-mono mt-2">
              Migrated · legacy ID: {client.legacyId}
            </div>
          )}
        </Section>
        <Section title="Team">
          <Row
            icon={Briefcase}
            label="Sales rep"
            value={teamById[client.salesRepId]?.name ?? "—"}
          />
          <Row icon={HandHeart} label="Onboarding owner" value={teamById[client.ownerId]?.name ?? "—"} />
          {client.implementerId && (
            <Row
              icon={Wrench}
              label="Implementation"
              value={teamById[client.implementerId]?.name ?? "—"}
            />
          )}
          {client.csmId && (
            <Row
              icon={HandHeart}
              label="CSM (post-launch)"
              value={teamById[client.csmId]?.name ?? "—"}
            />
          )}
        </Section>
      </div>

      {/* Progress + scoring */}
      <Section title="Onboarding progress">
        <div className="grid grid-cols-3 gap-3">
          <Stat
            label="Completion"
            value={`${client.completionPct}%`}
            sub={`${client.checklistComplete}/${client.checklistTotal} items`}
            accent={
              client.completionPct >= 80
                ? "success"
                : client.completionPct >= 50
                  ? "neutral"
                  : "warning"
            }
          />
          <Stat
            label="Days in stage"
            value={`${client.daysInStage}d`}
            sub={`${client.daysInOnboarding}d total`}
            accent={
              client.daysInStage >= 12
                ? "danger"
                : client.daysInStage >= 7
                  ? "warning"
                  : "neutral"
            }
          />
          <Stat
            label="Health"
            value={client.health.replace("_", " ")}
            sub={
              client.health === "at_risk"
                ? "Action needed"
                : client.health === "ready_for_launch"
                  ? "Approaching launch"
                  : "Standard cadence"
            }
            accent={
              client.health === "at_risk"
                ? "danger"
                : client.health === "internal_blocked"
                  ? "warning"
                  : client.health === "ready_for_launch"
                    ? "success"
                    : "neutral"
            }
            override={!!lastOverride}
          />
        </div>
        {lastOverride && (
          <div className="mt-3 text-[11.5px] text-ink-500 inline-flex items-center gap-1.5">
            <History className="h-3 w-3 text-ink-400" />
            Last override:{" "}
            <span className="font-semibold text-ink-800">
              {lastOverride.field.replace("_", " ")} {lastOverride.oldValue} → {lastOverride.newValue}
            </span>{" "}
            by {teamById[lastOverride.by]?.name.split(" ")[0]} ·{" "}
            {relativeTime(lastOverride.at)}
            {lastOverride.note && ` · ${lastOverride.note}`}
          </div>
        )}
      </Section>

      {/* Flags */}
      {client.flags.length > 0 && (
        <Section title="Flags">
          <FlagPills client={client} />
        </Section>
      )}

      {/* Notes — sloppy + quick-add */}
      <Section title="Notes">
        <p className="text-[13px] text-ink-700 leading-relaxed mb-3">
          {client.notes}
        </p>
        <AIHint weight="medium">
          The pinned note above (and any sloppy field notes) often contain the
          highest-leverage context. Read those before responding.
        </AIHint>
        <div className="mt-3 rounded-md border border-ink-200 p-2 bg-ink-50/40">
          <textarea
            rows={2}
            value={draftNote}
            onChange={(e) => setDraftNote(e.target.value)}
            placeholder="Add a quick note (typos welcome)…"
            className="w-full text-[12.5px] resize-none focus:outline-none bg-transparent"
          />
          <div className="flex items-center justify-end">
            <button
              type="button"
              disabled={!draftNote.trim()}
              onClick={() => {
                store.addNote({
                  clientId: client.id,
                  actorId: currentUserId,
                  body: draftNote.trim(),
                });
                toast.success("Note saved");
                setDraftNote("");
              }}
              className="btn-primary text-[11.5px] py-1 px-2"
            >
              Save note
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}

function ChecklistTab({ client }: { client: Client }) {
  // Synthesized playbook checklist with realistic items + status
  const items = [
    { name: "Welcome email sent", group: "Kickoff", done: true },
    { name: "Kickoff scheduled", group: "Kickoff", done: client.stage !== "handoff" },
    {
      name: "Sales handoff doc reviewed",
      group: "Kickoff",
      done: client.stage !== "handoff",
    },
    {
      name: "Stakeholders mapped",
      group: "Discovery",
      done: client.stakeholders.length > 0,
    },
    {
      name: "Discovery call held",
      group: "Discovery",
      done:
        client.stage !== "handoff" && client.stage !== "kickoff_scheduled",
    },
    {
      name: "Requirements doc complete",
      group: "Discovery",
      done:
        client.stage === "configuration" ||
        client.stage === "uat" ||
        client.stage === "launch_prep" ||
        client.stage === "live" ||
        client.stage === "transitioned",
    },
    {
      name: "MSA signed",
      group: "Legal & Billing",
      done: true,
    },
    {
      name: "DPA signed",
      group: "Legal & Billing",
      done: !client.dataIssues.includes("missing_dpa"),
    },
    {
      name: "W-9 collected",
      group: "Legal & Billing",
      done: !client.dataIssues.includes("missing_w9"),
    },
    {
      name: "Billing contact + PO",
      group: "Legal & Billing",
      done: !client.dataIssues.includes("incomplete_billing"),
    },
    {
      name: "Brand assets received",
      group: "Asset Collection",
      done:
        !client.blockers.some((b) => b.kind === "awaiting_client_assets"),
    },
    {
      name: "Intake form complete",
      group: "Asset Collection",
      done: !client.dataIssues.includes("missing_intake_form"),
    },
    {
      name: "Sample data uploaded",
      group: "Asset Collection",
      done: client.checklistComplete >= 12,
    },
    {
      name: "DNS / domain access",
      group: "Configuration",
      done: !client.blockers.some((b) => b.kind === "awaiting_dns"),
    },
    {
      name: "SSO / identity provisioned",
      group: "Configuration",
      done: !client.blockers.some((b) => b.kind === "tech_dependency"),
    },
    {
      name: "Custom configuration applied",
      group: "Configuration",
      done: client.stage === "uat" || client.stage === "launch_prep" || client.stage === "live" || client.stage === "transitioned",
    },
    {
      name: "Implementation QA pass",
      group: "Configuration",
      done: client.stage === "launch_prep" || client.stage === "live" || client.stage === "transitioned",
    },
    {
      name: "Client UAT pass",
      group: "UAT",
      done: client.stage === "launch_prep" || client.stage === "live" || client.stage === "transitioned",
    },
    {
      name: "UAT sign-off form signed",
      group: "UAT",
      done: client.stage === "launch_prep" || client.stage === "live" || client.stage === "transitioned",
    },
    {
      name: "Launch comms drafted",
      group: "Launch Prep",
      done: client.stage === "live" || client.stage === "transitioned",
    },
    {
      name: "Go-live date confirmed in writing",
      group: "Launch Prep",
      done: client.stage === "live" || client.stage === "transitioned",
    },
    {
      name: "CSM intro call scheduled",
      group: "Launch Prep",
      done: client.stage === "live" || client.stage === "transitioned",
    },
  ];

  const groups = Array.from(new Set(items.map((i) => i.group)));

  return (
    <div className="p-5 space-y-4">
      <div className="text-[12px] text-ink-500">
        <span className="font-semibold text-ink-800">
          {items.filter((i) => i.done).length}/{items.length}
        </span>{" "}
        items complete · synthesized from playbook + current stage
      </div>
      {groups.map((g) => {
        const groupItems = items.filter((i) => i.group === g);
        const done = groupItems.filter((i) => i.done).length;
        return (
          <div key={g}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="h-eyebrow">{g}</div>
              <span className="text-[11px] text-ink-500 font-semibold">
                {done}/{groupItems.length}
              </span>
            </div>
            <ul className="space-y-1">
              {groupItems.map((i) => (
                <li
                  key={i.name}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md border border-ink-200 bg-white"
                >
                  <span
                    className={`h-4 w-4 rounded inline-flex items-center justify-center ${
                      i.done
                        ? "bg-success-500 text-white"
                        : "border border-ink-300"
                    }`}
                  >
                    {i.done && <CheckCircle2 className="h-2.5 w-2.5" />}
                  </span>
                  <span
                    className={`text-[12.5px] ${
                      i.done
                        ? "text-ink-400 line-through"
                        : "text-ink-800"
                    }`}
                  >
                    {i.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function StakeholdersTab({ client }: { client: Client }) {
  if (client.stakeholders.length === 0) {
    return (
      <div className="p-5">
        <EmptyState
          title="No stakeholders mapped"
          body="Identify project lead, executive sponsor, and any blockers — clients with mapped stakeholders launch 1.7× faster."
        />
      </div>
    );
  }
  return (
    <div className="p-5 space-y-3">
      <div className="text-[12px] text-ink-500">
        {client.stakeholders.length} stakeholders ·{" "}
        {client.stakeholders.filter((s) => s.role === "Champion" || s.role === "Project Lead").length}{" "}
        active leads
      </div>
      <ul className="space-y-2">
        {client.stakeholders.map((s) => (
          <li
            key={s.id}
            className="rounded-lg border border-ink-200 p-3 flex items-start gap-3"
          >
            <span
              className={`mt-1 h-2 w-2 rounded-full ${
                s.status === "engaged"
                  ? "bg-success-500"
                  : s.status === "warm"
                    ? "bg-warning-500"
                    : s.status === "blocking"
                      ? "bg-danger-500"
                      : s.status === "cold"
                        ? "bg-ink-400"
                        : "bg-ink-300"
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13.5px] font-semibold text-ink-900">
                  {s.name}
                </span>
                <span className="text-[12px] text-ink-500">{s.title}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[11.5px]">
                <Badge
                  tone={
                    s.role === "Champion" || s.role === "Project Lead"
                      ? "success"
                      : s.role === "Legal" || s.role === "Procurement"
                        ? "warning"
                        : "neutral"
                  }
                >
                  {s.role}
                </Badge>
                <span className="text-ink-500">
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      s.status === "engaged"
                        ? "text-success-700"
                        : s.status === "warm"
                          ? "text-warning-700"
                          : s.status === "blocking"
                            ? "text-danger-700"
                            : "text-ink-700"
                    }`}
                  >
                    {s.status}
                  </span>
                </span>
                {s.lastContactAt && (
                  <span className="text-ink-400">
                    · last contact {relativeTime(s.lastContactAt)}
                  </span>
                )}
              </div>
              {s.email && (
                <div className="mt-1 text-[11px] text-ink-500 inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span className="font-mono">{s.email}</span>
                </div>
              )}
              {s.notes && (
                <p className="mt-1 text-[11.5px] text-ink-600 italic">
                  {s.notes}
                </p>
              )}
            </div>
            <button
              type="button"
              className="text-[11px] text-brand-700 font-semibold hover:underline shrink-0"
            >
              <Phone className="h-3 w-3 inline mr-1" />
              Reach
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="btn-secondary">
        <Plus className="h-3.5 w-3.5" />
        Add stakeholder
      </button>
    </div>
  );
}

function PromisesTab({
  client,
  salesRep,
  aiDetections,
}: {
  client: Client;
  salesRep: TeamMember | undefined;
  aiDetections: AIDetection[];
}) {
  const handoffInsights = aiDetections.filter(
    (d) => d.surface === "tab_handoff",
  );
  if (client.promises.length === 0) {
    return (
      <div className="p-5 space-y-4">
        {handoffInsights.length > 0 && (
          <AIDetectionStrip detections={handoffInsights} />
        )}
        <EmptyState
          title="No promises tracked"
          body="When sales hands off a deal, promises made during the sales cycle should be logged here so onboarding can deliver against them."
        />
        <div>
          <div className="h-eyebrow mb-2">Sales handoff</div>
          <Row
            icon={HandHeart}
            label="Sold by"
            value={salesRep?.name ?? "—"}
          />
          <Row
            icon={Calendar}
            label="Closed"
            value={`${fmtDate(client.closedAt)} (${relativeTime(client.closedAt)})`}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="p-5 space-y-4">
      {handoffInsights.length > 0 && (
        <AIDetectionStrip detections={handoffInsights} />
      )}
      {/* Sales handoff context */}
      <Section title="Sales handoff">
        <div className="rounded-lg border border-ink-200 bg-ink-50/40 p-3 space-y-1">
          <Row
            icon={HandHeart}
            label="Sold by"
            value={salesRep?.name ?? "—"}
          />
          <Row
            icon={Calendar}
            label="Closed"
            value={`${fmtDate(client.closedAt)} (${relativeTime(client.closedAt)})`}
          />
          <Row
            icon={Briefcase}
            label="Deal value"
            value={fmtMoneyFull(client.contractValue)}
          />
        </div>
      </Section>

      {/* Promises */}
      <Section
        title={`Promises made during sales (${client.promises.length})`}
        right={
          <span className="text-[11px] text-ink-500">
            What sales committed to that delivery is now executing
          </span>
        }
      >
        <ul className="space-y-2">
          {client.promises.map((p) => {
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
                className="rounded-lg border border-ink-200 p-3"
              >
                <div className="flex items-start gap-2.5">
                  <CircleHelp
                    className={`h-4 w-4 mt-0.5 ${
                      p.supported === "yes"
                        ? "text-success-600"
                        : p.supported === "scope_exception"
                          ? "text-warning-600"
                          : p.supported === "no"
                            ? "text-danger-600"
                            : "text-ink-400"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-semibold text-ink-900">
                        "{p.body}"
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
                    <div className="mt-0.5 text-[11.5px] text-ink-500">
                      Raised by {teamById[p.raisedBy]?.name.split(" ")[0] ?? "sales"} ·{" "}
                      {relativeTime(p.at)}
                    </div>
                    {p.resolution && (
                      <div className="mt-1.5 text-[12px] text-ink-700 bg-ink-50 rounded-md px-2 py-1.5">
                        <span className="font-semibold">Resolution:</span>{" "}
                        {p.resolution}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Section>
    </div>
  );
}

function BlockersTab({
  client,
  aiDetections,
}: {
  client: Client;
  aiDetections: AIDetection[];
}) {
  const { currentUserId } = useAppState();
  const store = useStore();
  const toast = useToast();
  const blockerInsights = aiDetections.filter(
    (d) => d.surface === "tab_blockers",
  );
  if (client.blockers.length === 0 && client.dataIssues.length === 0) {
    return (
      <div className="p-5 space-y-4">
        {blockerInsights.length > 0 && (
          <AIDetectionStrip detections={blockerInsights} />
        )}
        <EmptyState
          title="No active blockers"
          body="Flag friction here as it appears — legal review, missing assets, scope ambiguity, etc."
        />
      </div>
    );
  }
  return (
    <div className="p-5 space-y-4">
      {blockerInsights.length > 0 && (
        <AIDetectionStrip detections={blockerInsights} />
      )}
      {client.blockers.length > 0 && (
        <Section title="Active blockers">
          <ul className="space-y-2">
            {client.blockers.map((b) => (
              <li
                key={b.id}
                className="rounded-lg border border-warning-200 bg-warning-50/40 p-3 flex items-start gap-3"
              >
                <AlertOctagon className="h-4 w-4 text-warning-700 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-ink-900">
                    {b.label}
                  </div>
                  {b.detail && (
                    <p className="text-[12px] text-ink-700 mt-0.5">
                      {b.detail}
                    </p>
                  )}
                  <div className="mt-1 text-[11px] text-ink-500">
                    Set by {teamById[b.setBy]?.name.split(" ")[0]} ·{" "}
                    {relativeTime(b.since)}
                    {b.unblocksAt && (
                      <>
                        {" "}
                        · expected unblock{" "}
                        <span className="font-semibold text-ink-700">
                          {relativeTime(b.unblocksAt)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    store.clearBlocker({
                      clientId: client.id,
                      actorId: currentUserId,
                      blockerId: b.id,
                    });
                    toast.success("Blocker cleared");
                  }}
                  className="text-[11px] font-semibold text-success-700 hover:underline shrink-0"
                >
                  Clear
                </button>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {client.dataIssues.length > 0 && (
        <Section title="Data hygiene">
          <DataIssuePills client={client} max={10} />
        </Section>
      )}
    </div>
  );
}

function TasksTab({
  client,
  aiDetections,
}: {
  client: Client;
  aiDetections: AIDetection[];
}) {
  const { currentUserId, openQuickLog } = useAppState();
  const store = useStore();
  const toast = useToast();
  const myTasks = tasksByClient(client.id);
  const taskInsights = aiDetections.filter((d) => d.surface === "tab_tasks");

  if (myTasks.length === 0) {
    return (
      <div className="p-5 space-y-4">
        {taskInsights.length > 0 && (
          <AIDetectionStrip detections={taskInsights} />
        )}
        <EmptyState
          title="No tasks for this client"
          body="Create client-side or internal tasks here."
        />
      </div>
    );
  }

  const groups: Record<string, typeof myTasks> = {
    "Client tasks": myTasks.filter((t) => t.kind === "client_task"),
    "Internal tasks": myTasks.filter((t) => t.kind === "internal_task"),
    "Approvals": myTasks.filter((t) => t.kind === "approval"),
    "Dependencies": myTasks.filter((t) => t.kind === "dependency"),
    "Launch prep": myTasks.filter((t) => t.kind === "launch_prep"),
  };

  return (
    <div className="p-5 space-y-4">
      {taskInsights.length > 0 && (
        <AIDetectionStrip detections={taskInsights} />
      )}
      {Object.entries(groups).map(([label, items]) => {
        if (items.length === 0) return null;
        return (
          <div key={label}>
            <div className="h-eyebrow mb-2">{label} ({items.length})</div>
            <ul className="space-y-1.5">
              {items.map((t) => {
                const overdue =
                  t.status !== "complete" &&
                  new Date(t.due).getTime() < Date.now();
                return (
                  <li
                    key={t.id}
                    className="flex items-start gap-2.5 rounded-md border border-ink-200 p-2.5"
                  >
                    <input
                      type="checkbox"
                      checked={t.status === "complete"}
                      onChange={() => {
                        if (t.status === "complete") {
                          store.uncompleteTask({
                            taskId: t.id,
                            actorId: currentUserId,
                          });
                        } else {
                          store.completeTask({
                            taskId: t.id,
                            actorId: currentUserId,
                          });
                          toast.success(`Done: ${t.title}`);
                        }
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[13px] font-medium ${
                            t.status === "complete"
                              ? "line-through text-ink-400"
                              : "text-ink-900"
                          }`}
                        >
                          {t.title}
                        </span>
                        {t.priority === "high" && (
                          <Badge tone="warning">High</Badge>
                        )}
                        {t.status === "blocked" && (
                          <Badge tone="danger">Blocked</Badge>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] flex-wrap">
                        <span
                          className={
                            overdue
                              ? "text-danger-700 font-semibold"
                              : "text-ink-500"
                          }
                        >
                          Due {relativeTime(t.due)}
                        </span>
                        {t.assignedTo && (
                          <>
                            <span className="text-ink-300">·</span>
                            <span className="text-ink-600">
                              Assigned: {t.assignedTo}
                            </span>
                          </>
                        )}
                        {t.blocker && (
                          <>
                            <span className="text-ink-300">·</span>
                            <span className="text-warning-700">
                              {t.blocker}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => openQuickLog({ clientId: client.id, initialMode: "client_task" })}
        className="btn-secondary"
      >
        <Plus className="h-3.5 w-3.5" />
        New task
      </button>
    </div>
  );
}

function ApprovalsTab({
  client,
  aiDetections,
}: {
  client: Client;
  aiDetections: AIDetection[];
}) {
  const { currentUserId } = useAppState();
  const store = useStore();
  const toast = useToast();
  const my = approvalsByClient(client.id);
  const approvalInsights = aiDetections.filter(
    (d) => d.surface === "tab_approvals",
  );

  if (my.length === 0) {
    return (
      <div className="p-5 space-y-4">
        {approvalInsights.length > 0 && (
          <AIDetectionStrip detections={approvalInsights} />
        )}
        <EmptyState
          title="No approvals tracked"
          body="When you need legal, billing, scope, or client signoff — request it here."
        />
      </div>
    );
  }
  return (
    <div className="p-5 space-y-3">
      {approvalInsights.length > 0 && (
        <AIDetectionStrip detections={approvalInsights} />
      )}
      <ul className="space-y-2.5">
        {my.map((a) => (
          <ApprovalRow
            key={a.id}
            approval={a}
            onApprove={() => {
              store.setApproval({
                approvalId: a.id,
                status: "approved",
                actorId: currentUserId,
              });
              toast.success(`Approved · ${a.title}`);
            }}
            onNeedsInfo={() => {
              store.setApproval({
                approvalId: a.id,
                status: "needs_info",
                actorId: currentUserId,
              });
              toast.info("Marked needs info");
            }}
          />
        ))}
      </ul>
    </div>
  );
}

function ApprovalRow({
  approval: a,
  onApprove,
  onNeedsInfo,
}: {
  approval: ReturnType<typeof approvalsByClient>[number];
  onApprove: () => void;
  onNeedsInfo: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const toneFor: Record<
    ApprovalStatus,
    { label: string; cls: string }
  > = {
    pending: {
      label: "Pending",
      cls: "text-ink-700 bg-ink-100 ring-ink-200",
    },
    under_revision: {
      label: "Under revision",
      cls: "text-warning-700 bg-warning-50 ring-warning-100",
    },
    awaiting_external: {
      label: "Awaiting external",
      cls: "text-warning-700 bg-warning-50 ring-warning-100",
    },
    approved_verbal: {
      label: "Approved (verbal only)",
      cls: "text-warning-700 bg-warning-50 ring-warning-200",
    },
    approved: {
      label: "Approved",
      cls: "text-success-700 bg-success-50 ring-success-100",
    },
    conditionally_approved: {
      label: "Conditionally approved",
      cls: "text-brand-700 bg-brand-50 ring-brand-200",
    },
    rejected: {
      label: "Rejected",
      cls: "text-danger-700 bg-danger-50 ring-danger-100",
    },
    needs_info: {
      label: "Needs info",
      cls: "text-warning-700 bg-warning-50 ring-warning-100",
    },
    escalated: {
      label: "Escalated",
      cls: "text-danger-700 bg-danger-50 ring-danger-100",
    },
    expired: {
      label: "Expired",
      cls: "text-ink-500 bg-ink-100 ring-ink-200",
    },
  };
  const tone = toneFor[a.status];
  const aging = Math.round(
    (Date.now() - new Date(a.requestedAt).getTime()) / 86400000,
  );
  const slaBreach = a.slaHours && aging * 24 > a.slaHours;
  const hasThread = (a.comments?.length ?? 0) > 0;
  return (
    <li className="rounded-lg border border-ink-200 bg-white">
      <div className="p-3 flex items-start gap-3">
        <Stamp className="h-4 w-4 text-ink-500 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-semibold text-ink-900">
              {a.title}
            </span>
            <span
              className={`inline-flex items-center px-1.5 py-0 rounded-md ring-1 ring-inset text-[10.5px] font-semibold ${tone.cls}`}
            >
              {tone.label}
            </span>
            <Badge tone="neutral">{a.type.replace("_", " ")}</Badge>
            {a.attempt && a.attempt > 1 && (
              <Badge tone="warning">Attempt {a.attempt}</Badge>
            )}
          </div>
          <div className="mt-0.5 text-[11.5px] text-ink-500">
            Approver:{" "}
            <span className="text-ink-700">{a.approverName}</span>
            {a.approverIsClient && (
              <span className="ml-1 text-[10px] uppercase text-warning-700 font-semibold">
                client-side
              </span>
            )}
            {a.blockingTeam && (
              <span className="ml-1 text-ink-400">· {a.blockingTeam}</span>
            )}
          </div>
          {a.detail && (
            <p className="mt-1 text-[12px] text-ink-700">{a.detail}</p>
          )}
          {a.conditions && a.conditions.length > 0 && (
            <ul className="mt-2 space-y-0.5 rounded-md bg-brand-50/40 border border-brand-100 p-2">
              <li className="text-[10.5px] uppercase tracking-wider font-semibold text-brand-700 mb-0.5">
                Conditions
              </li>
              {a.conditions.map((c, i) => (
                <li
                  key={i}
                  className="text-[12px] text-ink-700 inline-flex items-start gap-1.5"
                >
                  <CheckCircle2 className="h-3 w-3 text-brand-600 mt-0.5 shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          )}
          {a.status === "approved_verbal" && (
            <p className="mt-1 text-[11.5px] text-warning-700">
              ⚠ Verbal only — get this in writing before launch
            </p>
          )}
          {a.riskIfDelayed && (
            <p className="mt-1 text-[11.5px] text-warning-700">
              ⚠ Risk if delayed: {a.riskIfDelayed}
            </p>
          )}
          <div className="mt-1.5 flex items-center gap-2 text-[11px]">
            <span className={slaBreach ? "text-danger-700 font-semibold" : "text-ink-400"}>
              {aging}d aging
              {a.slaHours && ` · SLA ${Math.round(a.slaHours / 24)}d`}
              {slaBreach && " · BREACH"}
            </span>
            {hasThread && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="text-[11px] text-brand-700 font-semibold hover:underline inline-flex items-center gap-0.5"
              >
                {expanded ? "Hide" : "Show"} {a.comments!.length} comment
                {a.comments!.length === 1 ? "" : "s"}
              </button>
            )}
          </div>
        </div>
        {a.status !== "approved" &&
          a.status !== "rejected" &&
          a.status !== "expired" && (
            <div className="flex flex-col gap-1 shrink-0">
              <button
                type="button"
                onClick={onApprove}
                className="btn-primary text-[10.5px] py-0.5 px-2"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={onNeedsInfo}
                className="text-[10.5px] text-ink-500 hover:underline"
              >
                Needs info
              </button>
            </div>
          )}
      </div>
      {expanded && hasThread && (
        <div className="border-t border-ink-100 bg-ink-50/30 px-3 py-2.5">
          <ul className="space-y-2">
            {a.comments!.map((c) => {
              const author = c.authorIsClient ? null : teamById[c.authorId];
              const kindLabel: Record<
                NonNullable<typeof c.kind>,
                { label: string; cls: string }
              > = {
                request: { label: "Request", cls: "text-ink-600 bg-ink-100" },
                revision: {
                  label: "Revision asked",
                  cls: "text-warning-700 bg-warning-50",
                },
                approval: {
                  label: "Approval",
                  cls: "text-success-700 bg-success-50",
                },
                rejection: {
                  label: "Rejection",
                  cls: "text-danger-700 bg-danger-50",
                },
                context: { label: "Context", cls: "text-ink-500 bg-ink-100" },
              };
              return (
                <li
                  key={c.id}
                  className="rounded-md bg-white border border-ink-200 p-2.5"
                >
                  <div className="flex items-center gap-1.5 text-[10.5px] mb-1">
                    <span className="font-semibold text-ink-700">
                      {c.authorIsClient
                        ? `${a.approverName.split(" ")[0]} · client`
                        : (author?.name ?? "Internal")}
                    </span>
                    {c.kind && (
                      <span
                        className={`px-1 py-0 rounded text-[9.5px] uppercase tracking-wider font-bold ${kindLabel[c.kind].cls}`}
                      >
                        {kindLabel[c.kind].label}
                      </span>
                    )}
                    <span className="text-ink-400">
                      · {relativeTime(c.at)}
                    </span>
                  </div>
                  <p className="text-[12px] text-ink-800 leading-relaxed">
                    {c.body}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </li>
  );
}

function DocumentsTab({
  client,
  aiDetections,
}: {
  client: Client;
  aiDetections: AIDetection[];
}) {
  const { currentUserId } = useAppState();
  const store = useStore();
  const toast = useToast();
  const docs = documentsByClient(client.id);
  const docInsights = aiDetections.filter(
    (d) => d.surface === "tab_documents",
  );

  if (docs.length === 0) {
    return (
      <div className="p-5 space-y-4">
        {docInsights.length > 0 && (
          <AIDetectionStrip detections={docInsights} />
        )}
        <EmptyState
          title="No documents yet"
          body="Drop in contracts, intake forms, kickoff docs, and assets — they'll appear here."
        />
      </div>
    );
  }
  return (
    <div className="p-5 space-y-3">
      {docInsights.length > 0 && (
        <AIDetectionStrip detections={docInsights} />
      )}
      <ul className="space-y-1.5">
        {docs.map((d) => (
          <DocRow
            key={d.id}
            doc={d}
            onApprove={() => {
              store.setDocStatus({
                docId: d.id,
                status: "approved",
                actorId: currentUserId,
              });
              toast.success(`Approved · ${d.name}`);
            }}
          />
        ))}
      </ul>
    </div>
  );
}

function DocRow({
  doc: d,
  onApprove,
}: {
  doc: ReturnType<typeof documentsByClient>[number];
  onApprove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const statusTone: Record<DocumentStatus, { label: string; cls: string; icon: string }> = {
    missing: {
      label: "Missing",
      cls: "text-warning-700 bg-warning-50 ring-warning-100",
      icon: "bg-warning-50 text-warning-600",
    },
    pending_review: {
      label: "Pending review",
      cls: "text-brand-700 bg-brand-50 ring-brand-100",
      icon: "bg-brand-50 text-brand-600",
    },
    revision_requested: {
      label: "Revision requested",
      cls: "text-warning-700 bg-warning-50 ring-warning-100",
      icon: "bg-warning-50 text-warning-600",
    },
    wrong_version: {
      label: "Wrong version",
      cls: "text-warning-700 bg-warning-50 ring-warning-200",
      icon: "bg-warning-50 text-warning-600",
    },
    wrong_format: {
      label: "Wrong format",
      cls: "text-warning-700 bg-warning-50 ring-warning-200",
      icon: "bg-warning-50 text-warning-600",
    },
    low_quality: {
      label: "Low quality",
      cls: "text-warning-700 bg-warning-50 ring-warning-200",
      icon: "bg-warning-50 text-warning-600",
    },
    duplicate: {
      label: "Possible duplicate",
      cls: "text-ink-700 bg-ink-100 ring-ink-200",
      icon: "bg-ink-100 text-ink-600",
    },
    client_says_sent: {
      label: "Client says sent",
      cls: "text-warning-700 bg-warning-50 ring-warning-100",
      icon: "bg-warning-50 text-warning-600",
    },
    credentials_insecure: {
      label: "Insecure",
      cls: "text-danger-700 bg-danger-50 ring-danger-100",
      icon: "bg-danger-50 text-danger-600",
    },
    approved: {
      label: "Approved",
      cls: "text-success-700 bg-success-50 ring-success-100",
      icon: "bg-success-50 text-success-600",
    },
    expired: {
      label: "Expired",
      cls: "text-danger-700 bg-danger-50 ring-danger-100",
      icon: "bg-danger-50 text-danger-600",
    },
  };
  const tone = statusTone[d.status];
  const hasVersions = (d.versions?.length ?? 0) > 1;
  return (
    <li className="rounded-lg border border-ink-200 bg-white">
      <div className="flex items-start gap-3 px-3 py-2.5">
        <span
          className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${tone.icon}`}
        >
          <Paperclip className="h-3.5 w-3.5" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-semibold text-ink-900 truncate">
              {d.name}
            </span>
            <span
              className={`inline-flex items-center px-1.5 py-0 rounded-md ring-1 ring-inset text-[10.5px] font-semibold ${tone.cls}`}
            >
              {tone.label}
            </span>
            {d.required && (
              <span className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold">
                required
              </span>
            )}
            {d.uploadedByClient && (
              <span className="text-[10px] uppercase tracking-wider text-brand-700 font-semibold">
                client upload
              </span>
            )}
          </div>
          <div className="text-[11px] text-ink-500">
            {d.kind} ·{" "}
            {d.size ? `${d.size} · ` : ""}
            {d.uploadedBy
              ? `uploaded by ${teamById[d.uploadedBy]?.name.split(" ")[0]}`
              : d.expectedBy
                ? `expected ${relativeTime(d.expectedBy)}`
                : "no upload"}
            {d.at ? ` · ${relativeTime(d.at)}` : ""}
          </div>
          {d.flaggedReason && (
            <p className="mt-1 text-[11.5px] text-warning-700 italic">
              ⚠ {d.flaggedReason}
            </p>
          )}
          {d.revisionNotes && (
            <p className="mt-1 text-[11.5px] text-warning-700 italic">
              Revision: {d.revisionNotes}
            </p>
          )}
          {d.note && (
            <p className="mt-1 text-[11.5px] text-ink-500 italic">{d.note}</p>
          )}
          {hasVersions && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-[11px] text-brand-700 font-semibold hover:underline"
            >
              {expanded ? "Hide" : "Show"} {d.versions!.length} versions
            </button>
          )}
        </div>
        {d.status === "pending_review" && (
          <button
            type="button"
            onClick={onApprove}
            className="btn-primary text-[10.5px] py-0.5 px-2 shrink-0"
          >
            Approve
          </button>
        )}
        {(d.status === "missing" || d.status === "client_says_sent") && (
          <button
            type="button"
            className="text-[11px] text-brand-700 font-semibold hover:underline shrink-0"
          >
            Re-request
          </button>
        )}
        {d.status === "revision_requested" && (
          <button
            type="button"
            className="text-[11px] text-warning-700 font-semibold hover:underline shrink-0"
          >
            Send v2
          </button>
        )}
        {d.status === "credentials_insecure" && (
          <button
            type="button"
            className="text-[11px] text-danger-700 font-semibold hover:underline shrink-0"
          >
            Secure resend
          </button>
        )}
        {d.status === "duplicate" && (
          <button
            type="button"
            className="text-[11px] text-ink-700 font-semibold hover:underline shrink-0"
          >
            Reconcile
          </button>
        )}
        {d.status === "approved" && (
          <button className="text-ink-400 hover:text-ink-700 shrink-0">
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {expanded && hasVersions && (
        <div className="border-t border-ink-100 bg-ink-50/30 px-3 py-2.5">
          <ul className="space-y-1">
            {d.versions!.map((v) => (
              <li
                key={v.id}
                className="flex items-start gap-2.5 text-[12px] text-ink-700 px-2 py-1 rounded-md hover:bg-white"
              >
                <span
                  className={`mt-0.5 h-1.5 w-1.5 rounded-full ${v.current ? "bg-success-500" : "bg-ink-300"}`}
                />
                <div className="flex-1">
                  <div className="font-medium">
                    {v.versionLabel}{" "}
                    {v.current && (
                      <span className="text-[10px] uppercase tracking-wider text-success-700 font-bold ml-1">
                        current
                      </span>
                    )}
                  </div>
                  <div className="text-[10.5px] text-ink-500">
                    {v.uploadedBy
                      ? `${teamById[v.uploadedBy]?.name.split(" ")[0]} · `
                      : ""}
                    {relativeTime(v.at)}
                    {v.size && ` · ${v.size}`}
                    {v.note && ` · ${v.note}`}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

function InternalTab({ client }: { client: Client }) {
  const { currentUserId } = useAppState();
  const store = useStore();
  const [draft, setDraft] = useState("");
  const comments = store.internalComments
    .filter((c) => c.clientId === client.id)
    .sort((a, b) => (a.at < b.at ? 1 : -1));
  return (
    <div className="p-5 space-y-3">
      <div className="text-[12px] text-ink-500 inline-flex items-center gap-1.5">
        <MessageSquare className="h-3 w-3" />
        Internal-only · not visible to the client
      </div>
      {comments.length === 0 && (
        <EmptyState
          title="No internal comments"
          body="Use this for team coordination — @mentions, deal context for handoffs, manager notes."
        />
      )}
      <ul className="space-y-3">
        {comments.map((c) => {
          const author = teamById[c.authorId];
          return (
            <li key={c.id} className="flex items-start gap-2.5">
              <Avatar ownerId={author?.id} size="sm" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[12.5px] font-semibold text-ink-900">
                    {author?.name ?? "Unknown"}
                  </span>
                  <span className="text-[11px] text-ink-400">
                    · {relativeTime(c.at)}
                  </span>
                </div>
                <p className="mt-0.5 text-[13px] text-ink-700 leading-relaxed">
                  {c.body.split(/(@\w+)/g).map((part, i) =>
                    part.startsWith("@") ? (
                      <span
                        key={i}
                        className="text-brand-700 font-semibold"
                      >
                        {part}
                      </span>
                    ) : (
                      <span key={i}>{part}</span>
                    ),
                  )}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="rounded-lg border border-ink-200 p-2 mt-3">
        <div className="flex items-center gap-1.5 text-[11px] text-ink-500 mb-1.5">
          <AtSign className="h-3 w-3" />
          @mention a teammate (e.g. @avery, @jordan)
        </div>
        <textarea
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Internal note for the team…"
          className="w-full text-[12.5px] resize-none focus:outline-none"
        />
        <div className="flex items-center justify-end">
          <button
            type="button"
            disabled={!draft.trim()}
            onClick={() => {
              store.addInternalComment({
                clientId: client.id,
                authorId: currentUserId,
                body: draft.trim(),
              });
              setDraft("");
            }}
            className="btn-primary text-[11.5px] py-1"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryTab({
  client,
  activities,
}: {
  client: Client;
  activities: ReturnType<typeof useStore>["activities"];
}) {
  return (
    <div className="p-5 space-y-5">
      {/* Stage progression */}
      {client.stageHistory.length > 0 && (
        <Section title="Stage progression">
          <ol className="space-y-1">
            {client.stageHistory.map((h, i) => {
              const next = client.stageHistory[i + 1];
              const inStageDays = next
                ? Math.floor(
                    (new Date(next.enteredAt).getTime() -
                      new Date(h.enteredAt).getTime()) /
                      86400000,
                  )
                : Math.floor(
                    (Date.now() - new Date(h.enteredAt).getTime()) / 86400000,
                  );
              return (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-md border border-ink-200 bg-white px-3 py-2"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-medium text-ink-900">
                      {STAGES.find((s) => s.id === h.stage)?.label}
                    </div>
                    <div className="text-[11px] text-ink-500">
                      Entered {fmtDate(h.enteredAt)} ·{" "}
                      {teamById[h.by]?.name.split(" ")[0] ?? h.by}
                      {h.note && ` · ${h.note}`}
                    </div>
                  </div>
                  <span className="text-[11.5px] font-semibold text-ink-700 shrink-0">
                    {inStageDays}d
                  </span>
                </li>
              );
            })}
          </ol>
        </Section>
      )}

      {/* Manual overrides */}
      {client.manualOverrides.length > 0 && (
        <Section title={`Manual overrides (${client.manualOverrides.length})`}>
          <ul className="space-y-1.5">
            {client.manualOverrides.map((o) => (
              <li
                key={o.id}
                className="flex items-start gap-2 rounded-md border border-ink-200 bg-warning-50/30 px-3 py-2"
              >
                <History className="h-3.5 w-3.5 text-warning-600 mt-0.5" />
                <div className="flex-1 min-w-0 text-[12px]">
                  <div className="text-ink-800">
                    <span className="font-semibold capitalize">
                      {o.field.replace("_", " ")}
                    </span>
                    : <span className="text-ink-500">{o.oldValue}</span> →{" "}
                    <span className="font-semibold text-ink-900">
                      {o.newValue}
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-500">
                    {teamById[o.by]?.name.split(" ")[0]} ·{" "}
                    {relativeTime(o.at)}
                    {o.note && ` · ${o.note}`}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title={`Activity log (${activities.length})`}>
        <ol className="space-y-3.5 relative">
          {activities.map((a) => (
            <li
              key={a.id}
              className="relative pl-6 border-l-2 border-ink-100 ml-2 pb-2"
            >
              <span className="absolute -left-[7px] top-0 h-3 w-3 rounded-full bg-brand-500 ring-4 ring-white" />
              <div className="text-[13px] font-medium text-ink-900">
                {a.summary}
              </div>
              {a.detail && (
                <p className="text-[12px] text-ink-500 mt-0.5">{a.detail}</p>
              )}
              <div className="mt-1 text-[11px] text-ink-400 flex items-center gap-1.5">
                <Avatar ownerId={a.ownerId} size="xs" />
                <span className="font-medium text-ink-600">
                  {teamById[a.ownerId]?.name}
                </span>
                <span>·</span>
                <span>{relativeTime(a.at)}</span>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <div className="pt-3 border-t border-ink-100 text-[11px] text-ink-400 flex items-center gap-1.5">
        <Users className="h-3 w-3" />
        Audit trail · {activities.length} events · created{" "}
        {fmtDate(client.closedAt)}
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  warn,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5 text-[12.5px] py-1">
      <Icon
        className={`h-3.5 w-3.5 mt-0.5 ${warn ? "text-warning-600" : "text-ink-400"}`}
      />
      <div className="flex-1 min-w-0">
        <div
          className={`text-[11px] leading-tight ${warn ? "text-warning-700" : "text-ink-400"}`}
        >
          {label}
        </div>
        <div
          className={`${warn ? "text-warning-800" : "text-ink-800"} truncate`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
  override,
}: {
  label: string;
  value: string;
  sub: string;
  accent: "neutral" | "warning" | "danger" | "success";
  override?: boolean;
}) {
  const accentClass: Record<typeof accent, string> = {
    neutral: "bg-ink-50 text-ink-800",
    warning: "bg-warning-50 text-warning-700",
    danger: "bg-danger-50 text-danger-700",
    success: "bg-success-50 text-success-700",
  } as const;
  return (
    <div className="rounded-lg border border-ink-200 p-3 bg-white relative">
      <div className="h-eyebrow flex items-center gap-1">
        {label}
        {override && (
          <span
            title="Manually overridden"
            className="text-[9px] uppercase tracking-wider font-bold text-warning-600 bg-warning-50 px-1 rounded"
          >
            ovr
          </span>
        )}
      </div>
      <div
        className={`mt-1 inline-flex items-baseline gap-1 px-1.5 rounded ${accentClass[accent]}`}
      >
        <span className="text-base font-semibold capitalize">{value}</span>
      </div>
      <div className="text-[11px] text-ink-500 mt-1">{sub}</div>
    </div>
  );
}

function AIDetectionStrip({ detections }: { detections: AIDetection[] }) {
  if (detections.length === 0) return null;
  return (
    <div className="rounded-lg border border-brand-200 bg-gradient-to-br from-brand-50/50 to-white p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="h-5 w-5 rounded-md bg-brand-700 flex items-center justify-center">
          <Sparkles className="h-3 w-3 text-white" />
        </span>
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-brand-700">
          AI caught {detections.length}{" "}
          {detections.length === 1 ? "thing" : "things"}
        </span>
      </div>
      <ul className="space-y-1.5">
        {detections.map((d) => (
          <li key={d.id} className="flex items-start gap-2">
            <span
              className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                d.weight === "high"
                  ? "bg-warning-500"
                  : d.weight === "medium"
                    ? "bg-brand-500"
                    : "bg-ink-300"
              }`}
            />
            <span className="text-[12.5px] text-ink-800 leading-relaxed">
              {d.body}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConflictsTab({
  client,
  conflicts,
  recon,
}: {
  client: Client;
  conflicts: CrossFunctionalConflict[];
  recon: ReconciliationItem[];
}) {
  const { openAI } = useAppState();
  if (conflicts.length === 0 && recon.length === 0) {
    return (
      <div className="p-5">
        <EmptyState
          title="No cross-functional tension"
          body="When sales, implementation, CSM, or onboarding disagree on scope / timing / responsibility, log it here so it doesn't surface as a launch surprise."
        />
      </div>
    );
  }
  const open = conflicts.filter(
    (c) => c.status === "open" || c.status === "in_discussion",
  );
  const resolved = conflicts.filter(
    (c) => c.status === "resolved" || c.status === "parked",
  );
  const openRecon = recon.filter((r) => r.status === "open");
  const closedRecon = recon.filter((r) => r.status !== "open");

  return (
    <div className="p-5 space-y-5">
      <AIHint weight="high">
        Cross-functional tension is the highest-leverage thing to surface
        early. Most launch surprises trace back to one of these going
        un-resolved before go-live.
      </AIHint>

      {/* Open conflicts */}
      {open.length > 0 && (
        <Section title={`Open conflicts (${open.length})`}>
          <ul className="space-y-2.5">
            {open.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-danger-200 bg-danger-50/30 p-3"
              >
                <div className="flex items-start gap-2.5">
                  <Swords className="h-4 w-4 text-danger-700 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-semibold text-ink-900">
                        {c.title}
                      </span>
                      <Badge
                        tone={c.status === "in_discussion" ? "warning" : "danger"}
                      >
                        {c.status === "in_discussion" ? "In discussion" : "Open"}
                      </Badge>
                    </div>
                    <div className="mt-1 text-[11px] text-ink-500 inline-flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-ink-700">
                        {c.between.map((b) => roleLabel[b]).join(" ↔ ")}
                      </span>
                      <span>·</span>
                      <span>raised {relativeTime(c.at)}</span>
                      <span>·</span>
                      <span>
                        by {teamById[c.raisedBy]?.name.split(" ")[0]}
                      </span>
                    </div>
                    <p className="mt-2 text-[12.5px] text-ink-800 leading-relaxed">
                      {c.detail}
                    </p>
                    {c.resolution && (
                      <p className="mt-1 text-[11.5px] text-ink-700 italic">
                        Resolution path: {c.resolution}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openAI(client.id)}
                        className="text-[11px] font-semibold text-brand-700 hover:underline inline-flex items-center gap-1"
                      >
                        <Sparkles className="h-3 w-3" />
                        AI: draft a resolution proposal
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Reconciliation: client says they sent X */}
      {openRecon.length > 0 && (
        <Section
          title={`"Client says they sent" reconciliation (${openRecon.length})`}
          right={
            <span className="text-[11px] text-ink-500">
              The most awkward category of friction
            </span>
          }
        >
          <ul className="space-y-2">
            {openRecon.map((r) => (
              <li
                key={r.id}
                className="rounded-lg border border-warning-200 bg-warning-50/30 p-3"
              >
                <div className="flex items-start gap-2.5">
                  <Search className="h-4 w-4 text-warning-700 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-ink-900">
                      {r.what}
                    </div>
                    <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                      <div className="rounded-md bg-white border border-ink-200 p-2">
                        <div className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold mb-0.5">
                          Client claim
                        </div>
                        <div className="text-ink-800 italic">
                          "{r.clientClaim}"
                        </div>
                      </div>
                      <div className="rounded-md bg-white border border-ink-200 p-2">
                        <div className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold mb-0.5">
                          Our reality
                        </div>
                        <div className="text-ink-800">{r.ourReality}</div>
                      </div>
                    </div>
                    <div className="mt-1.5 text-[11px] text-ink-500">
                      Raised {relativeTime(r.raisedAt)}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        className="text-[11px] font-semibold text-success-700 hover:underline"
                      >
                        Mark found
                      </button>
                      <span className="text-ink-300">·</span>
                      <button
                        type="button"
                        className="text-[11px] font-semibold text-brand-700 hover:underline"
                      >
                        Resend ask
                      </button>
                      <span className="text-ink-300">·</span>
                      <button
                        type="button"
                        className="text-[11px] font-semibold text-ink-500 hover:underline"
                      >
                        Defer
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Resolved (collapsed feel) */}
      {(resolved.length > 0 || closedRecon.length > 0) && (
        <Section title={`Resolved (${resolved.length + closedRecon.length})`}>
          <ul className="space-y-1.5">
            {resolved.map((c) => (
              <li
                key={c.id}
                className="flex items-start gap-2 px-2.5 py-1.5 text-[12px] text-ink-600 bg-ink-50/40 rounded-md"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-success-600 mt-0.5" />
                <div>
                  <span className="font-medium">{c.title}</span>
                  {c.resolution && (
                    <span className="text-ink-500 italic">
                      {" "}
                      · {c.resolution}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="text-center py-10 px-6 border border-dashed border-ink-200 rounded-xl">
      <div className="text-sm font-semibold text-ink-700">{title}</div>
      <div className="text-[12px] text-ink-500 mt-1">{body}</div>
    </div>
  );
}
