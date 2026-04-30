import { useEffect, useMemo, useState } from "react";
import {
  X,
  StickyNote,
  CheckSquare,
  AlertOctagon,
  Search,
  ArrowRight,
  HandHeart,
  Stamp,
} from "lucide-react";
import { useAppState } from "../../state/AppState";
import { useStore } from "../../state/DataStore";
import { useToast } from "../../state/Toaster";
import { Avatar } from "../ui/Avatar";
import { fmtMoney } from "../../lib/format";
import type { BlockerKind } from "../../data/types";

type Mode = "note" | "client_task" | "internal_task" | "blocker" | "approval";

const tabs: {
  id: Mode;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  tone: string;
}[] = [
  { id: "note", label: "Note", Icon: StickyNote, tone: "text-ink-700" },
  { id: "client_task", label: "Client task", Icon: HandHeart, tone: "text-brand-700" },
  { id: "internal_task", label: "Internal task", Icon: CheckSquare, tone: "text-success-700" },
  { id: "blocker", label: "Blocker", Icon: AlertOctagon, tone: "text-warning-700" },
  { id: "approval", label: "Approval", Icon: Stamp, tone: "text-ink-700" },
];

const blockerKinds: { id: BlockerKind; label: string }[] = [
  { id: "awaiting_client_assets", label: "Awaiting client assets" },
  { id: "awaiting_dns", label: "Awaiting DNS access" },
  { id: "legal_review", label: "Legal review pending" },
  { id: "missing_decision_maker", label: "Missing decision-maker" },
  { id: "scope_exception", label: "Scope exception" },
  { id: "billing_setup_incomplete", label: "Billing setup incomplete" },
  { id: "tech_dependency", label: "Tech dependency" },
  { id: "client_unresponsive", label: "Client unresponsive" },
  { id: "exec_sponsor_changed", label: "Exec sponsor changed" },
  { id: "kickoff_reschedule", label: "Kickoff rescheduled" },
];

export function QuickLogModal() {
  const { quickLog, closeQuickLog, currentUserId } = useAppState();
  const store = useStore();
  const toast = useToast();

  const [mode, setMode] = useState<Mode>(quickLog.initialMode ?? "note");
  const [clientId, setClientId] = useState<string | null>(quickLog.clientId ?? null);
  const [query, setQuery] = useState("");

  // Form
  const [noteBody, setNoteBody] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDays, setTaskDueDays] = useState(1);
  const [taskPriority, setTaskPriority] = useState<"normal" | "high">("normal");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [blockerKind, setBlockerKind] = useState<BlockerKind>("awaiting_client_assets");
  const [blockerDetail, setBlockerDetail] = useState("");

  useEffect(() => {
    if (!quickLog.open) return;
    setMode(quickLog.initialMode ?? "note");
    setClientId(quickLog.clientId ?? null);
    setQuery("");
    setNoteBody("");
    setTaskTitle("");
    setTaskDueDays(1);
    setTaskPriority("normal");
    setTaskAssignee("");
    setBlockerKind("awaiting_client_assets");
    setBlockerDetail("");
  }, [quickLog.open, quickLog.initialMode, quickLog.clientId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeQuickLog();
    };
    if (quickLog.open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [quickLog.open, closeQuickLog]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return store.clients
      .filter((c) => c.stage !== "transitioned")
      .filter((c) =>
        q ? `${c.name} ${c.id} ${c.industry}`.toLowerCase().includes(q) : true,
      )
      .slice(0, 6);
  }, [query, store.clients]);

  const client = clientId ? store.clientById(clientId) : undefined;
  if (!quickLog.open) return null;

  const submit = () => {
    if (!client) return;
    if (mode === "note") {
      const body = noteBody.trim();
      if (!body) {
        toast.warning("Note can't be empty");
        return;
      }
      store.addNote({
        clientId: client.id,
        actorId: currentUserId,
        body,
      });
      toast.success(`Note saved · ${client.name}`);
    } else if (mode === "client_task" || mode === "internal_task") {
      const title = taskTitle.trim();
      if (!title) {
        toast.warning("Task title required");
        return;
      }
      store.addTask({
        clientId: client.id,
        actorId: currentUserId,
        title,
        kind: mode,
        dueInDays: taskDueDays,
        priority: taskPriority,
        assignedTo: mode === "client_task" ? taskAssignee || undefined : undefined,
      });
      toast.success(`Task created · due in ${taskDueDays}d`);
    } else if (mode === "blocker") {
      const label =
        blockerKinds.find((b) => b.id === blockerKind)?.label ?? "Blocker";
      store.setBlocker({
        clientId: client.id,
        actorId: currentUserId,
        kind: blockerKind,
        label,
        detail: blockerDetail.trim() || undefined,
      });
      toast.warning(`Blocker set · ${client.name}`);
    } else if (mode === "approval") {
      // Synthesize as an internal task for now
      store.addTask({
        clientId: client.id,
        actorId: currentUserId,
        title: `Approval needed: ${taskTitle.trim() || "review"}`,
        kind: "approval",
        dueInDays: taskDueDays,
        priority: "high",
      });
      toast.success("Approval task created");
    }
    closeQuickLog();
  };

  return (
    <>
      <div
        onClick={closeQuickLog}
        className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm z-50"
      />
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 pointer-events-none">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-pop border border-ink-200 pointer-events-auto overflow-hidden">
          <div className="px-3 pt-3 pb-2 border-b border-ink-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              {tabs.map(({ id, label, Icon, tone }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  className={`px-2.5 py-1.5 rounded-md text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors ${
                    mode === id
                      ? "bg-ink-900 text-white"
                      : `${tone} hover:bg-ink-100`
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={closeQuickLog}
              className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-ink-100 text-ink-500"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Client picker */}
          <div className="px-4 py-3 border-b border-ink-100">
            <div className="h-eyebrow mb-1.5">Client</div>
            {client ? (
              <button
                type="button"
                onClick={() => setClientId(null)}
                className="w-full flex items-center gap-2.5 p-2 rounded-md border border-ink-200 hover:border-brand-300 text-left"
              >
                <Avatar ownerId={client.ownerId} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-ink-900 truncate">
                    {client.name}
                  </div>
                  <div className="text-[11.5px] text-ink-500">
                    {fmtMoney(client.contractValue)} ·{" "}
                    {client.stage.replace("_", " ")}
                  </div>
                </div>
                <span className="text-[11px] text-brand-700 font-semibold">
                  Change
                </span>
              </button>
            ) : (
              <>
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by client, ID, or industry…"
                    className="w-full pl-8 pr-3 h-9 text-sm rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                  />
                </div>
                <ul className="mt-2 max-h-56 overflow-y-auto divide-y divide-ink-100 border border-ink-200 rounded-md">
                  {matches.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setClientId(c.id)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 hover:bg-brand-50/50 text-left"
                      >
                        <Avatar ownerId={c.ownerId} size="xs" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[12.5px] font-medium text-ink-900 truncate">
                            {c.name}{" "}
                            <span className="text-ink-400 font-normal">
                              · {c.industry}
                            </span>
                          </div>
                          <div className="text-[11px] text-ink-500">
                            {fmtMoney(c.contractValue)} ·{" "}
                            {c.stage.replace("_", " ")}
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-ink-400" />
                      </button>
                    </li>
                  ))}
                  {matches.length === 0 && (
                    <li className="px-3 py-4 text-[12px] text-ink-500 text-center">
                      No clients match
                    </li>
                  )}
                </ul>
              </>
            )}
          </div>

          {/* Mode forms */}
          <div className="px-4 py-3.5 space-y-3">
            {mode === "note" && (
              <div>
                <div className="h-eyebrow mb-1.5">Note</div>
                <textarea
                  autoFocus
                  rows={4}
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  placeholder="What did you learn? Decisions, blockers, signal — typos welcome."
                  className="w-full text-[13px] rounded-md border border-ink-200 px-2.5 py-2 resize-none"
                />
              </div>
            )}

            {(mode === "client_task" || mode === "internal_task") && (
              <>
                <div>
                  <div className="h-eyebrow mb-1.5">Task</div>
                  <input
                    autoFocus
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder={
                      mode === "client_task"
                        ? "What does the client need to do?"
                        : "What needs to happen internally?"
                    }
                    className="w-full h-9 text-sm rounded-md border border-ink-200 px-2.5"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="h-eyebrow mb-1.5">Due</div>
                    <select
                      value={taskDueDays}
                      onChange={(e) => setTaskDueDays(Number(e.target.value))}
                      className="w-full h-8 text-sm rounded-md border border-ink-200 px-2 bg-white"
                    >
                      <option value={0}>Today</option>
                      <option value={1}>Tomorrow</option>
                      <option value={3}>In 3 days</option>
                      <option value={7}>Next week</option>
                      <option value={14}>In 2 weeks</option>
                    </select>
                  </div>
                  <div>
                    <div className="h-eyebrow mb-1.5">Priority</div>
                    <div className="flex items-center bg-ink-100 p-0.5 rounded-md text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => setTaskPriority("normal")}
                        className={`flex-1 py-1 rounded ${
                          taskPriority === "normal"
                            ? "bg-white text-ink-900 shadow-card"
                            : "text-ink-500"
                        }`}
                      >
                        Normal
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaskPriority("high")}
                        className={`flex-1 py-1 rounded ${
                          taskPriority === "high"
                            ? "bg-white text-warning-700 shadow-card"
                            : "text-ink-500"
                        }`}
                      >
                        High
                      </button>
                    </div>
                  </div>
                  {mode === "client_task" && (
                    <div>
                      <div className="h-eyebrow mb-1.5">Assignee</div>
                      <input
                        value={taskAssignee}
                        onChange={(e) => setTaskAssignee(e.target.value)}
                        placeholder="Client name"
                        className="w-full h-8 text-sm rounded-md border border-ink-200 px-2"
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {mode === "blocker" && (
              <>
                <div>
                  <div className="h-eyebrow mb-1.5">Blocker type</div>
                  <select
                    value={blockerKind}
                    onChange={(e) =>
                      setBlockerKind(e.target.value as BlockerKind)
                    }
                    className="w-full h-9 text-sm rounded-md border border-ink-200 px-2 bg-white"
                  >
                    {blockerKinds.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="h-eyebrow mb-1.5">Detail</div>
                  <textarea
                    rows={3}
                    value={blockerDetail}
                    onChange={(e) => setBlockerDetail(e.target.value)}
                    placeholder="What specifically is blocked? Who needs to act?"
                    className="w-full text-[13px] rounded-md border border-ink-200 px-2.5 py-2 resize-none"
                  />
                </div>
              </>
            )}

            {mode === "approval" && (
              <>
                <div>
                  <div className="h-eyebrow mb-1.5">Approval description</div>
                  <input
                    autoFocus
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="What needs sign-off?"
                    className="w-full h-9 text-sm rounded-md border border-ink-200 px-2.5"
                  />
                </div>
                <div>
                  <div className="h-eyebrow mb-1.5">Due</div>
                  <select
                    value={taskDueDays}
                    onChange={(e) => setTaskDueDays(Number(e.target.value))}
                    className="w-full h-8 text-sm rounded-md border border-ink-200 px-2 bg-white"
                  >
                    <option value={1}>Tomorrow</option>
                    <option value={3}>In 3 days</option>
                    <option value={7}>Next week</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="px-4 py-3 border-t border-ink-100 bg-ink-50/40 flex items-center justify-between">
            <span className="text-[11px] text-ink-500">
              ⌘L opens this anywhere · ⏎ to save
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeQuickLog}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!client}
                className="btn-primary"
              >
                {mode === "note"
                  ? "Save note"
                  : mode === "blocker"
                    ? "Set blocker"
                    : mode === "approval"
                      ? "Create approval"
                      : "Create task"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
