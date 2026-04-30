import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  FileText,
  Paperclip,
  ExternalLink,
  Plus,
} from "lucide-react";
import { useStore } from "../state/DataStore";
import { useAppState } from "../state/AppState";
import { useToast } from "../state/Toaster";
import { teamById } from "../data/team";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { fmtMoney, relativeTime } from "../lib/format";
import type { DocumentStatus, DocumentKind } from "../data/types";

const statusTone: Record<DocumentStatus, string> = {
  missing: "text-warning-700 bg-warning-50 ring-warning-100",
  pending_review: "text-brand-700 bg-brand-50 ring-brand-100",
  approved: "text-success-700 bg-success-50 ring-success-100",
  expired: "text-danger-700 bg-danger-50 ring-danger-100",
};

const kindLabel: Record<DocumentKind, string> = {
  contract: "Contract",
  kickoff_doc: "Kickoff doc",
  intake_form: "Intake form",
  asset: "Asset",
  implementation_doc: "Implementation",
  approval: "Approval",
  signed_form: "Signed form",
  w9: "W-9",
  dpa: "DPA",
  msa: "MSA",
};

export function DocumentsPage() {
  const store = useStore();
  const { openClient, currentUserId } = useAppState();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "all">(
    "all",
  );

  const clientsById = useMemo(
    () => Object.fromEntries(store.clients.map((c) => [c.id, c])),
    [store.clients],
  );

  const filtered = store.documents
    .filter((d) =>
      statusFilter === "all" ? true : d.status === statusFilter,
    )
    .filter((d) =>
      query
        ? `${d.name} ${clientsById[d.clientId]?.name ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase())
        : true,
    )
    .sort((a, b) => {
      // Missing first, then pending_review, then expired, then approved
      const order: DocumentStatus[] = [
        "missing",
        "pending_review",
        "expired",
        "approved",
      ];
      return order.indexOf(a.status) - order.indexOf(b.status);
    });

  const counts = {
    missing: store.documents.filter((d) => d.status === "missing").length,
    pending_review: store.documents.filter((d) => d.status === "pending_review").length,
    approved: store.documents.filter((d) => d.status === "approved").length,
    expired: store.documents.filter((d) => d.status === "expired").length,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-ink-900 tracking-tight">
            Documents
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">
            Centralized onboarding documents · contracts, intake forms,
            signed assets, and implementation docs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents…"
              className="pl-8 pr-3 h-8 text-sm rounded-lg bg-white border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-400/40"
            />
          </div>
          <button className="btn-secondary" type="button">
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>
          <button className="btn-primary" type="button">
            <Plus className="h-3.5 w-3.5" />
            Upload
          </button>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(
          [
            { id: "missing", label: "Missing", count: counts.missing, tone: "text-warning-700 bg-warning-50/70" },
            { id: "pending_review", label: "Pending review", count: counts.pending_review, tone: "text-brand-700 bg-brand-50/70" },
            { id: "approved", label: "Approved", count: counts.approved, tone: "text-success-700 bg-success-50/70" },
            { id: "expired", label: "Expired", count: counts.expired, tone: "text-danger-700 bg-danger-50/70" },
          ] as const
        ).map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() =>
              setStatusFilter((c) =>
                c === s.id ? "all" : (s.id as DocumentStatus),
              )
            }
            className={`text-left rounded-lg border border-ink-200 p-3 hover:border-brand-300 transition-colors ${
              statusFilter === s.id ? "ring-2 ring-brand-300" : ""
            }`}
          >
            <div className="h-eyebrow">{s.label}</div>
            <div
              className={`mt-1 inline-flex items-baseline gap-1 px-1.5 rounded ${s.tone}`}
            >
              <span className="text-base font-semibold">{s.count}</span>
            </div>
          </button>
        ))}
      </div>

      <Card pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="table-head pl-5">Document</th>
                <th className="table-head">Client</th>
                <th className="table-head">Type</th>
                <th className="table-head">Status</th>
                <th className="table-head">Uploaded by</th>
                <th className="table-head">Modified</th>
                <th className="table-head pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const c = clientsById[d.clientId];
                const uploader = d.uploadedBy
                  ? teamById[d.uploadedBy]
                  : null;
                return (
                  <tr
                    key={d.id}
                    onClick={() => openClient(d.clientId)}
                    className="border-b border-ink-100 last:border-0 hover:bg-ink-50/40 cursor-pointer"
                  >
                    <td className="table-cell pl-5">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-3.5 w-3.5 text-ink-400" />
                        <span className="font-medium text-ink-900">
                          {d.name}
                        </span>
                        {d.required && (
                          <span className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold">
                            req
                          </span>
                        )}
                      </div>
                      {d.note && (
                        <div className="mt-0.5 text-[11px] text-ink-500 italic">
                          {d.note}
                        </div>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="text-[12.5px] font-medium text-ink-800">
                        {c?.name}
                      </div>
                      <div className="text-[10.5px] text-ink-400">
                        {fmtMoney(c?.contractValue ?? 0)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <Badge tone="neutral">{kindLabel[d.kind]}</Badge>
                    </td>
                    <td className="table-cell">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded-md ring-1 ring-inset text-[11px] font-semibold ${statusTone[d.status]}`}
                      >
                        {d.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="table-cell text-[12px]">
                      {uploader ? uploader.name.split(" ")[0] : "—"}
                    </td>
                    <td className="table-cell text-[12px] text-ink-500">
                      {d.at ? relativeTime(d.at) : "—"}
                    </td>
                    <td
                      className="table-cell pr-5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {d.status === "pending_review" && (
                        <button
                          type="button"
                          onClick={() => {
                            store.setDocStatus({
                              docId: d.id,
                              status: "approved",
                              actorId: currentUserId,
                            });
                            toast.success("Approved");
                          }}
                          className="btn-primary text-[11px] py-1"
                        >
                          Approve
                        </button>
                      )}
                      {d.status === "missing" && (
                        <button
                          type="button"
                          className="text-[11px] text-brand-700 font-semibold hover:underline"
                        >
                          Request
                        </button>
                      )}
                      {d.status === "approved" && (
                        <button className="text-ink-400 hover:text-ink-700">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {d.status === "expired" && (
                        <button
                          type="button"
                          className="text-[11px] text-danger-700 font-semibold hover:underline"
                        >
                          Re-request
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-ink-500">
              <FileText className="h-8 w-8 mx-auto text-ink-400 mb-2" />
              No documents match.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
