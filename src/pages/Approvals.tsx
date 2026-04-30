import { useMemo, useState } from "react";
import { Stamp, ScrollText, Receipt, AlertTriangle, Wrench, ShieldCheck, Filter, Search } from "lucide-react";
import { useStore } from "../state/DataStore";
import { useAppState } from "../state/AppState";
import { useToast } from "../state/Toaster";
import { teamById } from "../data/team";
import { Card, CardHeader } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { fmtMoney } from "../lib/format";
import type { Approval, ApprovalType } from "../data/types";

const typeIcon: Record<ApprovalType, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  legal: ScrollText,
  billing: Receipt,
  scope_exception: AlertTriangle,
  implementation_signoff: Wrench,
  client_approval: Stamp,
  security_review: ShieldCheck,
};

const typeLabel: Record<ApprovalType, string> = {
  legal: "Legal",
  billing: "Billing",
  scope_exception: "Scope exception",
  implementation_signoff: "Implementation sign-off",
  client_approval: "Client approval",
  security_review: "Security review",
};

export function ApprovalsPage() {
  const store = useStore();
  const { openClient, currentUserId } = useAppState();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"pending" | "all">("pending");

  const clientsById = useMemo(
    () => Object.fromEntries(store.clients.map((c) => [c.id, c])),
    [store.clients],
  );

  const filtered = store.approvals
    .filter((a) =>
      filter === "pending"
        ? a.status === "pending" || a.status === "needs_info"
        : true,
    )
    .filter((a) =>
      query
        ? `${a.title} ${clientsById[a.clientId]?.name ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase())
        : true,
    )
    .sort(
      (a, b) =>
        new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime(),
    );

  const grouped: Record<ApprovalType, Approval[]> = {
    legal: [],
    billing: [],
    scope_exception: [],
    implementation_signoff: [],
    client_approval: [],
    security_review: [],
  };
  for (const a of filtered) grouped[a.type].push(a);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">
            Approvals
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">
            Sign-offs that gate onboarding progress.{" "}
            <span className="font-semibold text-ink-700">
              {store.approvals.filter((a) => a.status === "pending" || a.status === "needs_info").length}
            </span>{" "}
            pending across the team.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search approvals…"
              className="pl-8 pr-3 h-8 text-sm rounded-lg bg-white border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-400/40"
            />
          </div>
          <button className="btn-secondary" type="button">
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {(["pending", "all"] as const).map((f) => (
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
            {f === "pending" ? "Pending only" : "All"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {(Object.keys(grouped) as ApprovalType[]).map((type) => {
          const items = grouped[type];
          if (items.length === 0) return null;
          const Icon = typeIcon[type];
          return (
            <Card key={type}>
              <CardHeader
                eyebrow={typeLabel[type]}
                title={`${items.length} ${items.length === 1 ? "approval" : "approvals"}`}
                right={<Icon className="h-4 w-4 text-ink-400" />}
              />
              <ul className="space-y-2">
                {items.map((a) => {
                  const client = clientsById[a.clientId];
                  const owner = teamById[a.ownerId];
                  const aging = Math.round(
                    (Date.now() - new Date(a.requestedAt).getTime()) / 86400000,
                  );
                  return (
                    <li
                      key={a.id}
                      className="rounded-lg border border-ink-200 p-3 hover:border-brand-300 transition-colors cursor-pointer"
                      onClick={() => openClient(a.clientId)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13px] font-semibold text-ink-900">
                              {a.title}
                            </span>
                            <Badge
                              tone={
                                a.status === "approved"
                                  ? "success"
                                  : a.status === "needs_info"
                                    ? "warning"
                                    : a.status === "rejected"
                                      ? "danger"
                                      : "neutral"
                              }
                            >
                              {a.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="text-[11.5px] text-ink-500 mt-0.5">
                            {client?.name} · {fmtMoney(client?.contractValue ?? 0)} ·{" "}
                            <span
                              className={
                                aging >= 7
                                  ? "text-warning-700 font-semibold"
                                  : "text-ink-500"
                              }
                            >
                              {aging}d aging
                            </span>
                          </div>
                          <div className="text-[11px] text-ink-500 mt-0.5">
                            Approver: {a.approverName}
                            {a.approverIsClient && (
                              <span className="ml-1 text-warning-700 font-semibold">
                                · client-side
                              </span>
                            )}
                          </div>
                          {a.riskIfDelayed && (
                            <div className="mt-1 text-[11px] text-warning-700">
                              ⚠ {a.riskIfDelayed}
                            </div>
                          )}
                        </div>
                        <Avatar ownerId={owner?.id} size="xs" />
                      </div>
                      {(a.status === "pending" || a.status === "needs_info") && (
                        <div
                          className="mt-2 flex items-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              store.setApproval({
                                approvalId: a.id,
                                status: "approved",
                                actorId: currentUserId,
                              });
                              toast.success(`Approved · ${a.title}`);
                            }}
                            className="btn-primary text-[11px] py-1 px-2"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              store.setApproval({
                                approvalId: a.id,
                                status: "needs_info",
                                actorId: currentUserId,
                              });
                              toast.info("Marked needs info");
                            }}
                            className="btn-secondary text-[11px] py-1 px-2"
                          >
                            Needs info
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
