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
import type { Approval, ApprovalType, ApprovalStatus } from "../data/types";

const statusToneClass: Record<ApprovalStatus, string> = {
  pending: "text-ink-700 bg-ink-100 ring-ink-200",
  under_revision: "text-warning-700 bg-warning-50 ring-warning-100",
  awaiting_external: "text-warning-700 bg-warning-50 ring-warning-100",
  approved_verbal: "text-warning-700 bg-warning-50 ring-warning-200",
  approved: "text-success-700 bg-success-50 ring-success-100",
  conditionally_approved: "text-brand-700 bg-brand-50 ring-brand-200",
  rejected: "text-danger-700 bg-danger-50 ring-danger-100",
  needs_info: "text-warning-700 bg-warning-50 ring-warning-100",
  escalated: "text-danger-700 bg-danger-50 ring-danger-100",
  expired: "text-ink-500 bg-ink-100 ring-ink-200",
};

const statusLabel: Record<ApprovalStatus, string> = {
  pending: "Pending",
  under_revision: "Under revision",
  awaiting_external: "Awaiting external",
  approved_verbal: "Approved (verbal)",
  approved: "Approved",
  conditionally_approved: "Conditionally approved",
  rejected: "Rejected",
  needs_info: "Needs info",
  escalated: "Escalated",
  expired: "Expired",
};

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
  const [filter, setFilter] = useState<"pending" | "needs_attention" | "all">(
    "pending",
  );

  const clientsById = useMemo(
    () => Object.fromEntries(store.clients.map((c) => [c.id, c])),
    [store.clients],
  );

  const filtered = store.approvals
    .filter((a) => {
      if (filter === "all") return true;
      if (filter === "needs_attention")
        return (
          a.status === "approved_verbal" ||
          a.status === "escalated" ||
          a.status === "expired" ||
          a.status === "rejected"
        );
      // pending
      return (
        a.status !== "approved" &&
        a.status !== "rejected" &&
        a.status !== "expired"
      );
    })
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
          <h1 className="text-3xl font-semibold text-ink-900 tracking-tight">
            Approvals
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">
            Sign-offs that gate onboarding progress.{" "}
            <span className="font-semibold text-ink-700">
              {
                store.approvals.filter(
                  (a) =>
                    a.status !== "approved" &&
                    a.status !== "rejected" &&
                    a.status !== "expired",
                ).length
              }
            </span>{" "}
            in flight ·{" "}
            <span className="font-semibold text-warning-700">
              {
                store.approvals.filter(
                  (a) =>
                    a.status === "approved_verbal" ||
                    a.status === "escalated" ||
                    a.status === "expired",
                ).length
              }
            </span>{" "}
            need attention
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
        {(["pending", "needs_attention", "all"] as const).map((f) => (
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
            {f === "pending"
              ? "In flight"
              : f === "needs_attention"
                ? "Needs attention"
                : "All"}
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
                            <span
                              className={`inline-flex items-center px-1.5 py-0 rounded-md ring-1 ring-inset text-[10.5px] font-semibold ${statusToneClass[a.status]}`}
                            >
                              {statusLabel[a.status]}
                            </span>
                            {a.attempt && a.attempt > 1 && (
                              <Badge tone="warning">Attempt {a.attempt}</Badge>
                            )}
                            {(a.comments?.length ?? 0) > 0 && (
                              <span className="text-[10.5px] text-ink-400 inline-flex items-center gap-0.5">
                                <Stamp className="h-3 w-3" />
                                {a.comments!.length}
                              </span>
                            )}
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
