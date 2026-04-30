import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type {
  Client,
  Task,
  Activity,
  InternalComment,
  Approval,
  ClientDocument,
  AuditEvent,
  OnboardingStage,
  Health,
  BlockerKind,
  TaskKind,
  ApprovalStatus,
  DocumentStatus,
} from "../data/types";
import { clients as seedClients } from "../data/clients";
import { tasks as seedTasks } from "../data/tasks";
import { approvals as seedApprovals } from "../data/approvals";
import { documents as seedDocuments } from "../data/documents";
import {
  activities as seedActivities,
  internalComments as seedComments,
} from "../data/activities";

let nextId = 9000;
const newId = (prefix: string) => `${prefix}-${++nextId}`;

type StoreValue = {
  clients: Client[];
  clientById: (id: string) => Client | undefined;
  tasks: Task[];
  approvals: Approval[];
  documents: ClientDocument[];
  activities: Activity[];
  internalComments: InternalComment[];
  audit: AuditEvent[];

  // Actions
  changeStage: (input: {
    clientId: string;
    actorId: string;
    to: OnboardingStage;
  }) => void;
  changeHealth: (input: {
    clientId: string;
    actorId: string;
    to: Health;
  }) => void;
  addNote: (input: { clientId: string; actorId: string; body: string }) => void;
  addInternalComment: (input: {
    clientId: string;
    authorId: string;
    body: string;
  }) => void;
  setBlocker: (input: {
    clientId: string;
    actorId: string;
    kind: BlockerKind;
    label: string;
    detail?: string;
  }) => void;
  clearBlocker: (input: {
    clientId: string;
    actorId: string;
    blockerId: string;
  }) => void;
  completeTask: (input: { taskId: string; actorId: string }) => void;
  uncompleteTask: (input: { taskId: string; actorId: string }) => void;
  addTask: (input: {
    clientId: string;
    actorId: string;
    title: string;
    kind: TaskKind;
    dueInDays: number;
    priority?: Task["priority"];
    assignedTo?: string;
  }) => void;
  setApproval: (input: { approvalId: string; status: ApprovalStatus; actorId: string }) => void;
  setDocStatus: (input: {
    docId: string;
    status: DocumentStatus;
    actorId: string;
  }) => void;
  pushGoLive: (input: { clientId: string; actorId: string; days: number }) => void;
  escalate: (input: { clientId: string; actorId: string; reason?: string }) => void;
  reassign: (input: { clientId: string; actorId: string; newOwnerId: string }) => void;
};

const Ctx = createContext<StoreValue | null>(null);

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(() =>
    seedClients.map((c) => ({ ...c, blockers: [...c.blockers] })),
  );
  const [tasks, setTasks] = useState<Task[]>(() => [...seedTasks]);
  const [approvals, setApprovals] = useState<Approval[]>(() => [
    ...seedApprovals,
  ]);
  const [documents, setDocuments] = useState<ClientDocument[]>(() => [
    ...seedDocuments,
  ]);
  const [activities, setActivities] = useState<Activity[]>(() => [
    ...seedActivities,
  ]);
  const [internalComments, setInternalComments] = useState<InternalComment[]>(
    () => [...seedComments],
  );
  const [audit, setAudit] = useState<AuditEvent[]>([]);

  const recordActivity = useCallback((a: Omit<Activity, "id">) => {
    setActivities((prev) => [{ id: newId("ac"), ...a }, ...prev]);
  }, []);

  const recordAudit = useCallback(
    (actor: string, action: string, clientId?: string) => {
      setAudit((prev) => [
        {
          id: newId("au"),
          at: new Date().toISOString(),
          actor,
          action,
          clientId,
        },
        ...prev,
      ]);
    },
    [],
  );

  const updateClient = useCallback(
    (clientId: string, patch: (c: Client) => Client) => {
      setClients((prev) => prev.map((c) => (c.id === clientId ? patch(c) : c)));
    },
    [],
  );

  const changeStage: StoreValue["changeStage"] = useCallback(
    ({ clientId, actorId, to }) => {
      const at = new Date().toISOString();
      updateClient(clientId, (c) => ({
        ...c,
        stage: to,
        stageHistory: [
          ...c.stageHistory,
          { stage: to, enteredAt: at, by: actorId },
        ],
        daysInStage: 0,
        // bump completion when moving forward
        completionPct: Math.min(100, c.completionPct + 5),
        // when going live or transitioning, freeze health
        health: to === "live" || to === "transitioned" ? "ready_for_launch" : c.health,
      }));
      recordActivity({
        clientId,
        kind: "stage_change",
        ownerId: actorId,
        at,
        summary: `Stage → ${to.replace("_", " ")}`,
      });
      recordAudit(actorId, `Stage → ${to}`, clientId);
    },
    [updateClient, recordActivity, recordAudit],
  );

  const changeHealth: StoreValue["changeHealth"] = useCallback(
    ({ clientId, actorId, to }) => {
      updateClient(clientId, (c) => ({ ...c, health: to }));
      recordActivity({
        clientId,
        kind: "internal_note",
        ownerId: actorId,
        at: new Date().toISOString(),
        summary: `Health changed → ${to.replace("_", " ")}`,
      });
      recordAudit(actorId, `Health → ${to}`, clientId);
    },
    [updateClient, recordActivity, recordAudit],
  );

  const addNote: StoreValue["addNote"] = useCallback(
    ({ clientId, actorId, body }) => {
      const at = new Date().toISOString();
      recordActivity({
        clientId,
        kind: "internal_note",
        ownerId: actorId,
        at,
        summary: `Note: ${body.slice(0, 80)}${body.length > 80 ? "…" : ""}`,
        detail: body.length > 80 ? body : undefined,
      });
      recordAudit(actorId, "Added note", clientId);
    },
    [recordActivity, recordAudit],
  );

  const addInternalComment: StoreValue["addInternalComment"] = useCallback(
    ({ clientId, authorId, body }) => {
      setInternalComments((prev) => [
        {
          id: newId("ic"),
          clientId,
          authorId,
          body,
          at: new Date().toISOString(),
        },
        ...prev,
      ]);
      recordAudit(authorId, "Posted internal comment", clientId);
    },
    [recordAudit],
  );

  const setBlocker: StoreValue["setBlocker"] = useCallback(
    ({ clientId, actorId, kind, label, detail }) => {
      const id = newId("bl");
      const since = new Date().toISOString();
      updateClient(clientId, (c) => ({
        ...c,
        blockers: [
          ...c.blockers,
          { id, kind, label, since, setBy: actorId, detail },
        ],
      }));
      recordActivity({
        clientId,
        kind: "blocker_set",
        ownerId: actorId,
        at: since,
        summary: `Blocker set · ${label}`,
        detail,
      });
      recordAudit(actorId, `Blocker: ${label}`, clientId);
    },
    [updateClient, recordActivity, recordAudit],
  );

  const clearBlocker: StoreValue["clearBlocker"] = useCallback(
    ({ clientId, actorId, blockerId }) => {
      let cleared: string | undefined;
      updateClient(clientId, (c) => {
        const b = c.blockers.find((x) => x.id === blockerId);
        cleared = b?.label;
        return { ...c, blockers: c.blockers.filter((x) => x.id !== blockerId) };
      });
      recordActivity({
        clientId,
        kind: "blocker_cleared",
        ownerId: actorId,
        at: new Date().toISOString(),
        summary: `Blocker cleared · ${cleared ?? blockerId}`,
      });
      recordAudit(actorId, `Cleared blocker: ${cleared ?? blockerId}`, clientId);
    },
    [updateClient, recordActivity, recordAudit],
  );

  const completeTask: StoreValue["completeTask"] = useCallback(
    ({ taskId, actorId }) => {
      let clientId: string | undefined;
      let title: string | undefined;
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            clientId = t.clientId;
            title = t.title;
            return { ...t, status: "complete" };
          }
          return t;
        }),
      );
      if (clientId && title) {
        recordActivity({
          clientId,
          kind: "task_completed",
          ownerId: actorId,
          at: new Date().toISOString(),
          summary: `Task done: ${title}`,
        });
        // bump completion pct
        updateClient(clientId, (c) => ({
          ...c,
          checklistComplete: Math.min(c.checklistTotal, c.checklistComplete + 1),
          completionPct: Math.min(
            100,
            Math.round(((c.checklistComplete + 1) / c.checklistTotal) * 100),
          ),
        }));
        recordAudit(actorId, `Completed: ${title}`, clientId);
      }
    },
    [recordActivity, updateClient, recordAudit],
  );

  const uncompleteTask: StoreValue["uncompleteTask"] = useCallback(
    ({ taskId, actorId }) => {
      let clientId: string | undefined;
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            clientId = t.clientId;
            return { ...t, status: "open" };
          }
          return t;
        }),
      );
      if (clientId) recordAudit(actorId, "Reopened task", clientId);
    },
    [recordAudit],
  );

  const addTask: StoreValue["addTask"] = useCallback(
    ({
      clientId,
      actorId,
      title,
      kind,
      dueInDays,
      priority = "normal",
      assignedTo,
    }) => {
      const due = new Date(Date.now() + dueInDays * 86400000).toISOString();
      setTasks((prev) => [
        {
          id: newId("t"),
          clientId,
          ownerId: actorId,
          assignedTo,
          title,
          kind,
          due,
          status: "open",
          priority,
        },
        ...prev,
      ]);
      updateClient(clientId, (c) => ({
        ...c,
        checklistTotal: c.checklistTotal + 1,
      }));
      recordAudit(actorId, `Created task: ${title}`, clientId);
    },
    [updateClient, recordAudit],
  );

  const setApproval: StoreValue["setApproval"] = useCallback(
    ({ approvalId, status, actorId }) => {
      let clientId: string | undefined;
      let title: string | undefined;
      setApprovals((prev) =>
        prev.map((a) => {
          if (a.id === approvalId) {
            clientId = a.clientId;
            title = a.title;
            return { ...a, status };
          }
          return a;
        }),
      );
      if (clientId && title) {
        recordActivity({
          clientId,
          kind: status === "approved" ? "approval_granted" : "approval_requested",
          ownerId: actorId,
          at: new Date().toISOString(),
          summary: `Approval ${status} · ${title}`,
        });
        recordAudit(actorId, `Approval ${status}: ${title}`, clientId);
      }
    },
    [recordActivity, recordAudit],
  );

  const setDocStatus: StoreValue["setDocStatus"] = useCallback(
    ({ docId, status, actorId }) => {
      let clientId: string | undefined;
      let name: string | undefined;
      setDocuments((prev) =>
        prev.map((d) => {
          if (d.id === docId) {
            clientId = d.clientId;
            name = d.name;
            return { ...d, status };
          }
          return d;
        }),
      );
      if (clientId && name)
        recordAudit(actorId, `Doc ${status}: ${name}`, clientId);
    },
    [recordAudit],
  );

  const pushGoLive: StoreValue["pushGoLive"] = useCallback(
    ({ clientId, actorId, days }) => {
      let oldDate: string | undefined;
      let newDate: string | undefined;
      updateClient(clientId, (c) => {
        oldDate = c.goLiveTarget;
        newDate = new Date(
          new Date(c.goLiveTarget).getTime() + days * 86400000,
        ).toISOString();
        return {
          ...c,
          goLiveTarget: newDate,
          manualOverrides: [
            ...c.manualOverrides,
            {
              id: newId("mo"),
              field: "go_live_target",
              oldValue: new Date(oldDate).toLocaleDateString(),
              newValue: new Date(newDate).toLocaleDateString(),
              by: actorId,
              at: new Date().toISOString(),
              note: `Pushed ${days >= 0 ? "+" : ""}${days}d`,
            },
          ],
        };
      });
      recordActivity({
        clientId,
        kind: "internal_note",
        ownerId: actorId,
        at: new Date().toISOString(),
        summary: `Go-live pushed ${days >= 0 ? "+" : ""}${days}d`,
      });
      recordAudit(actorId, `Go-live ${days >= 0 ? "+" : ""}${days}d`, clientId);
    },
    [updateClient, recordActivity, recordAudit],
  );

  const escalate: StoreValue["escalate"] = useCallback(
    ({ clientId, actorId, reason }) => {
      recordActivity({
        clientId,
        kind: "internal_note",
        ownerId: actorId,
        at: new Date().toISOString(),
        summary: `Escalated to manager${reason ? ` · ${reason}` : ""}`,
      });
      recordAudit(actorId, "Escalated", clientId);
    },
    [recordActivity, recordAudit],
  );

  const reassign: StoreValue["reassign"] = useCallback(
    ({ clientId, actorId, newOwnerId }) => {
      let oldOwner: string | undefined;
      updateClient(clientId, (c) => {
        oldOwner = c.ownerId;
        return {
          ...c,
          ownerId: newOwnerId,
          manualOverrides: [
            ...c.manualOverrides,
            {
              id: newId("mo"),
              field: "owner",
              oldValue: oldOwner,
              newValue: newOwnerId,
              by: actorId,
              at: new Date().toISOString(),
            },
          ],
        };
      });
      recordAudit(actorId, "Reassigned client", clientId);
    },
    [updateClient, recordAudit],
  );

  const clientById = useCallback(
    (id: string) => clients.find((c) => c.id === id),
    [clients],
  );

  const value = useMemo<StoreValue>(
    () => ({
      clients,
      clientById,
      tasks,
      approvals,
      documents,
      activities,
      internalComments,
      audit,
      changeStage,
      changeHealth,
      addNote,
      addInternalComment,
      setBlocker,
      clearBlocker,
      completeTask,
      uncompleteTask,
      addTask,
      setApproval,
      setDocStatus,
      pushGoLive,
      escalate,
      reassign,
    }),
    [
      clients,
      clientById,
      tasks,
      approvals,
      documents,
      activities,
      internalComments,
      audit,
      changeStage,
      changeHealth,
      addNote,
      addInternalComment,
      setBlocker,
      clearBlocker,
      completeTask,
      uncompleteTask,
      addTask,
      setApproval,
      setDocStatus,
      pushGoLive,
      escalate,
      reassign,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside DataStoreProvider");
  return ctx;
}
