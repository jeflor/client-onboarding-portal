import {
  AlertTriangle,
  ScrollText,
  UserMinus,
  Snowflake,
  ShieldCheck,
  Ban,
  Clock,
  Wrench,
  CalendarX,
  Receipt,
  FileMinus,
  Copy,
  ShieldAlert,
} from "lucide-react";
import type { Client, BlockerKind, DataIssue } from "../../data/types";

const blockerIcon: Record<
  BlockerKind,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  awaiting_client_assets: FileMinus,
  awaiting_dns: Wrench,
  legal_review: ScrollText,
  missing_decision_maker: AlertTriangle,
  scope_exception: AlertTriangle,
  billing_setup_incomplete: Receipt,
  tech_dependency: Wrench,
  client_unresponsive: UserMinus,
  exec_sponsor_changed: UserMinus,
  kickoff_reschedule: CalendarX,
  implementation_capacity: Snowflake,
};

const issueLabel: Record<DataIssue, string> = {
  missing_w9: "Missing W-9",
  missing_dpa: "Missing DPA",
  missing_intake_form: "Intake form missing",
  wrong_stakeholder: "Wrong stakeholder",
  incomplete_billing: "Billing incomplete",
  missing_tech_contact: "No tech contact",
  duplicate_record: "Possible duplicate",
  tax_form_expired: "Tax form expired",
};

export function BlockerPills({
  client,
  max,
  size = "sm",
}: {
  client: Client;
  max?: number;
  size?: "xs" | "sm";
}) {
  if (client.blockers.length === 0) return null;
  const visible = max ? client.blockers.slice(0, max) : client.blockers;
  const overflow = client.blockers.length - visible.length;
  return (
    <div className="inline-flex items-center gap-1 flex-wrap">
      {visible.map((b) => {
        const Icon = blockerIcon[b.kind] ?? AlertTriangle;
        return (
          <span
            key={b.id}
            title={`${b.label}${b.detail ? " · " + b.detail : ""}`}
            className={`inline-flex items-center gap-1 rounded-md ring-1 ring-inset ring-warning-200 bg-warning-50 text-warning-700 font-medium ${
              size === "xs"
                ? "px-1.5 py-0 text-[10.5px]"
                : "px-1.5 py-0.5 text-[11px]"
            }`}
          >
            <Icon className="h-3 w-3" />
            {b.label}
          </span>
        );
      })}
      {overflow > 0 && <span className="badge-warning">+{overflow}</span>}
    </div>
  );
}

export function DataIssuePills({
  client,
  max = 2,
}: {
  client: Client;
  max?: number;
}) {
  if (client.dataIssues.length === 0) return null;
  const visible = client.dataIssues.slice(0, max);
  const overflow = client.dataIssues.length - visible.length;
  return (
    <div className="inline-flex items-center gap-1 flex-wrap">
      {visible.map((d) => (
        <span
          key={d}
          className="inline-flex items-center gap-1 rounded-md ring-1 ring-inset ring-ink-200 bg-ink-100 text-ink-600 px-1.5 py-0 text-[10.5px] font-medium"
        >
          <AlertTriangle className="h-3 w-3 text-warning-500" />
          {issueLabel[d]}
        </span>
      ))}
      {overflow > 0 && (
        <span className="text-[10.5px] text-ink-500 font-medium">
          +{overflow}
        </span>
      )}
    </div>
  );
}

export function FlagPills({ client }: { client: Client }) {
  return (
    <div className="inline-flex items-center gap-1 flex-wrap">
      {client.flags.includes("scope_promise_unresolved") && (
        <span className="badge-danger">Scope promise open</span>
      )}
      {client.flags.includes("client_ghosted") && (
        <span className="badge-danger">Client ghosted</span>
      )}
      {client.flags.includes("exec_sponsor_changed") && (
        <span className="badge-warning">Sponsor changed</span>
      )}
      {client.flags.includes("kickoff_rescheduled_2x") && (
        <span className="badge-warning">Kickoff resched 2×</span>
      )}
      {client.flags.includes("manually_advanced") && (
        <span className="badge-warning">Manually advanced</span>
      )}
      {client.flags.includes("rep_handoff") && (
        <span className="badge-neutral">Rep handoff</span>
      )}
      {client.flags.includes("expansion_likely") && (
        <span className="badge-success">Expansion likely</span>
      )}
      {client.flags.includes("high_touch") && (
        <span className="badge-brand">High touch</span>
      )}
    </div>
  );
}

export function EscalationPill() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md ring-1 ring-inset ring-danger-200 bg-danger-50 text-danger-700 px-1.5 py-0 text-[10.5px] font-semibold">
      <ShieldAlert className="h-3 w-3" />
      Escalated
    </span>
  );
}

export function DuplicatePill({ client }: { client: Client }) {
  if (!client.dataIssues.includes("duplicate_record")) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-md ring-1 ring-inset ring-warning-200 bg-warning-50 text-warning-700 px-1.5 py-0 text-[10.5px] font-medium">
      <Copy className="h-3 w-3" />
      Duplicate?
    </span>
  );
}

// Re-exports for convenience
export { ShieldCheck, Ban, Clock };
