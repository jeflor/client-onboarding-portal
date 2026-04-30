import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ListChecks,
  Plus,
  Search,
  Filter,
  HandHeart,
  Stamp,
  Wrench,
  Rocket,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { useStore } from "../state/DataStore";
import { useAppState } from "../state/AppState";
import { useToast } from "../state/Toaster";
import { teamById } from "../data/team";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { fmtDate, fmtMoney, relativeTime } from "../lib/format";
import type { TaskKind, Task } from "../data/types";

const groupIcon: Record<
  TaskKind,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  client_task: HandHeart,
  internal_task: ListChecks,
  approval: Stamp,
  dependency: Wrench,
  launch_prep: Rocket,
};

const groupLabel: Record<TaskKind, string> = {
  client_task: "Client tasks",
  internal_task: "Internal tasks",
  approval: "Approvals",
  dependency: "Dependencies",
  launch_prep: "Launch prep",
};

const kinds: TaskKind[] = [
  "client_task",
  "internal_task",
  "approval",
  "dependency",
  "launch_prep",
];

export function TasksPage() {
  const store = useStore();
  const { openClient, currentUserId } = useAppState();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"open" | "blocked" | "completed" | "all">("open");

  const clientsById = useMemo(
    () => Object.fromEntries(store.clients.map((c) => [c.id, c])),
    [store.clients],
  );

  const filtered = store.tasks
    .filter((t) => {
      if (filter === "open") return t.status === "open" || t.status === "in_progress";
      if (filter === "blocked") return t.status === "blocked";
      if (filter === "completed") return t.status === "complete";
      return true;
    })
    .filter((t) => {
      if (!query) return true;
      const c = clientsById[t.clientId];
      return `${t.title} ${c?.name ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase());
    })
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-ink-900 tracking-tight">
            Tasks
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">
            Operational work across clients — grouped by type.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks…"
              className="pl-8 pr-3 h-8 text-sm rounded-lg bg-white border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-400/40"
            />
          </div>
          <button className="btn-secondary" type="button">
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>
          <button className="btn-primary" type="button">
            <Plus className="h-3.5 w-3.5" />
            New task
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {(["open", "blocked", "completed", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded-md text-[12px] font-medium ${
              filter === f
                ? "bg-ink-900 text-white"
                : "bg-white border border-ink-200 text-ink-700 hover:bg-ink-50"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span
              className={`ml-1 text-[10px] ${filter === f ? "text-white/70" : "text-ink-400"}`}
            >
              ·{" "}
              {
                store.tasks.filter((t) => {
                  if (f === "open")
                    return t.status === "open" || t.status === "in_progress";
                  if (f === "blocked") return t.status === "blocked";
                  if (f === "completed") return t.status === "complete";
                  return true;
                }).length
              }
            </span>
          </button>
        ))}
      </div>

      <Card pad={false}>
        {kinds.map((kind) => {
          const items = filtered.filter((t) => t.kind === kind);
          if (items.length === 0) return null;
          const Icon = groupIcon[kind];
          return (
            <section key={kind} className="border-b border-ink-100 last:border-0">
              <div className="px-5 pt-4 pb-2 flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-ink-500" />
                <span className="text-[12px] font-semibold uppercase tracking-wider text-ink-500">
                  {groupLabel[kind]} ({items.length})
                </span>
              </div>
              <ul>
                {items.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    clientName={clientsById[t.clientId]?.name ?? ""}
                    clientValue={clientsById[t.clientId]?.contractValue ?? 0}
                    onToggle={() => {
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
                    onOpen={() => openClient(t.clientId)}
                  />
                ))}
              </ul>
            </section>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-ink-500">
            <CheckCircle2 className="h-8 w-8 mx-auto text-success-500 mb-2" />
            All clear.
          </div>
        )}
      </Card>
    </div>
  );
}

function TaskRow({
  task,
  clientName,
  clientValue,
  onToggle,
  onOpen,
}: {
  task: Task;
  clientName: string;
  clientValue: number;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const overdue =
    task.status !== "complete" && new Date(task.due).getTime() < Date.now();
  const owner = teamById[task.ownerId];
  const Icon =
    task.kind === "approval"
      ? Stamp
      : task.kind === "client_task"
        ? HandHeart
        : task.kind === "launch_prep"
          ? Rocket
          : task.kind === "dependency"
            ? Wrench
            : ListChecks;
  return (
    <li
      onClick={onOpen}
      className="flex items-start gap-3 px-5 py-3 hover:bg-ink-50/40 cursor-pointer border-t border-ink-100 first:border-t-0"
    >
      <input
        type="checkbox"
        checked={task.status === "complete"}
        onChange={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        onClick={(e) => e.stopPropagation()}
        className="mt-1.5 h-4 w-4 rounded border-ink-300 text-brand-600 cursor-pointer"
      />
      <span
        className={`mt-0.5 h-7 w-7 rounded-md flex items-center justify-center shrink-0 bg-ink-100 text-ink-700`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-[13.5px] font-medium ${
              task.status === "complete"
                ? "line-through text-ink-400"
                : "text-ink-900"
            }`}
          >
            {task.title}
          </span>
          {task.priority === "high" && (
            <Badge tone="warning">High priority</Badge>
          )}
          {task.status === "blocked" && (
            <Badge tone="danger">Blocked</Badge>
          )}
          {task.status === "in_progress" && (
            <Badge tone="brand">In progress</Badge>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-ink-500 flex-wrap">
          <span className="text-ink-700 font-semibold">{clientName}</span>
          <span>·</span>
          <span>{fmtMoney(clientValue)}</span>
          <span>·</span>
          <span
            className={
              overdue ? "text-danger-700 font-semibold" : "text-ink-500"
            }
          >
            Due {fmtDate(task.due)} ({relativeTime(task.due)})
          </span>
          {task.assignedTo && (
            <>
              <span>·</span>
              <span className="text-ink-600">→ {task.assignedTo}</span>
            </>
          )}
          {task.blocker && (
            <>
              <span>·</span>
              <span className="text-warning-700">⚠ {task.blocker}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-ink-500 shrink-0">
        <Avatar ownerId={owner?.id} size="xs" />
        {owner?.name.split(" ")[0]}
      </div>
    </li>
  );
}
