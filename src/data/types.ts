// Domain types for the Client Onboarding Portal

export type Role = "sales" | "onboarding" | "implementation" | "success";

export type OnboardingStage =
  | "handoff"
  | "kickoff_scheduled"
  | "discovery"
  | "asset_collection"
  | "configuration"
  | "uat"
  | "launch_prep"
  | "live"
  | "transitioned";

export const STAGES: { id: OnboardingStage; label: string; short: string }[] = [
  { id: "handoff", label: "Sales Handoff", short: "Handoff" },
  { id: "kickoff_scheduled", label: "Kickoff Scheduled", short: "Kickoff" },
  { id: "discovery", label: "Discovery", short: "Discovery" },
  { id: "asset_collection", label: "Asset Collection", short: "Assets" },
  { id: "configuration", label: "Configuration", short: "Config" },
  { id: "uat", label: "Client UAT", short: "UAT" },
  { id: "launch_prep", label: "Launch Prep", short: "Launch Prep" },
  { id: "live", label: "Live", short: "Live" },
  { id: "transitioned", label: "Transitioned to CSM", short: "Transitioned" },
];

export const ACTIVE_STAGES: OnboardingStage[] = [
  "handoff",
  "kickoff_scheduled",
  "discovery",
  "asset_collection",
  "configuration",
  "uat",
  "launch_prep",
];

export type Health =
  | "on_track"
  | "waiting_client"
  | "internal_blocked"
  | "at_risk"
  | "ready_for_launch";

export const HEALTH_LABELS: Record<Health, string> = {
  on_track: "On Track",
  waiting_client: "Waiting on Client",
  internal_blocked: "Internal Blocked",
  at_risk: "At Risk",
  ready_for_launch: "Ready for Launch",
};

export type TeamMember = {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: Role;
  title: string;
  avatarColor: string;
};

export type StakeholderRole =
  | "Executive Sponsor"
  | "Project Lead"
  | "Technical Contact"
  | "Procurement"
  | "Legal"
  | "End User"
  | "Champion";

export type StakeholderStatus =
  | "engaged"
  | "warm"
  | "cold"
  | "blocking"
  | "unknown";

export type Stakeholder = {
  id: string;
  name: string;
  title: string;
  email?: string;
  role: StakeholderRole;
  status: StakeholderStatus;
  lastContactAt?: string;
  notes?: string;
};

// What sales promised the client during the deal — the messiest realism
export type SalesPromise = {
  id: string;
  body: string;
  raisedBy: string; // sales rep id
  at: string;
  supported: "yes" | "scope_exception" | "no" | "unknown";
  resolution?: string;
};

export type BlockerKind =
  | "awaiting_client_assets"
  | "awaiting_dns"
  | "legal_review"
  | "missing_decision_maker"
  | "scope_exception"
  | "billing_setup_incomplete"
  | "tech_dependency"
  | "client_unresponsive"
  | "exec_sponsor_changed"
  | "kickoff_reschedule"
  | "implementation_capacity";

export type Blocker = {
  id: string;
  kind: BlockerKind;
  label: string;
  since: string;
  setBy: string;
  detail?: string;
  unblocksAt?: string; // expected
};

export type DataIssue =
  | "missing_w9"
  | "missing_dpa"
  | "missing_intake_form"
  | "wrong_stakeholder"
  | "incomplete_billing"
  | "missing_tech_contact"
  | "duplicate_record"
  | "tax_form_expired";

export type TaskKind =
  | "client_task"
  | "internal_task"
  | "approval"
  | "dependency"
  | "launch_prep";

export type TaskStatus =
  | "open"
  | "in_progress"
  | "blocked"
  | "complete"
  | "skipped";

export type Task = {
  id: string;
  clientId: string;
  kind: TaskKind;
  title: string;
  ownerId: string; // internal owner; for client_task this is the AM
  assignedTo?: string; // for client_task: client stakeholder name
  due: string;
  status: TaskStatus;
  priority: "low" | "normal" | "high";
  blocker?: string;
  dependsOn?: string; // task id
  detail?: string;
};

export type ApprovalType =
  | "legal"
  | "billing"
  | "scope_exception"
  | "implementation_signoff"
  | "client_approval"
  | "security_review";

export type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "needs_info";

export type Approval = {
  id: string;
  clientId: string;
  type: ApprovalType;
  title: string;
  ownerId: string; // internal owner
  approverName: string; // who needs to approve (could be client or internal)
  approverIsClient?: boolean;
  requestedAt: string;
  status: ApprovalStatus;
  riskIfDelayed?: string;
  detail?: string;
};

export type DocumentStatus = "missing" | "pending_review" | "approved" | "expired";

export type DocumentKind =
  | "contract"
  | "kickoff_doc"
  | "intake_form"
  | "asset"
  | "implementation_doc"
  | "approval"
  | "signed_form"
  | "w9"
  | "dpa"
  | "msa";

export type ClientDocument = {
  id: string;
  clientId: string;
  name: string;
  kind: DocumentKind;
  status: DocumentStatus;
  uploadedBy?: string;
  at?: string;
  size?: string;
  required: boolean;
  note?: string;
};

export type ActivityKind =
  | "deal_handed_off"
  | "onboarding_created"
  | "kickoff_scheduled"
  | "kickoff_held"
  | "asset_uploaded"
  | "blocker_set"
  | "blocker_cleared"
  | "approval_requested"
  | "approval_granted"
  | "requirements_submitted"
  | "implementation_started"
  | "stage_change"
  | "client_email"
  | "internal_note"
  | "task_completed"
  | "go_live"
  | "transitioned";

export type Activity = {
  id: string;
  clientId: string;
  kind: ActivityKind;
  ownerId: string; // internal actor (or client placeholder)
  at: string;
  summary: string;
  detail?: string;
};

export type InternalComment = {
  id: string;
  clientId: string;
  authorId: string;
  body: string;
  at: string;
  mentions?: string[];
};

export type ManualOverride = {
  id: string;
  field:
    | "go_live_target"
    | "stage"
    | "owner"
    | "health"
    | "package";
  oldValue: string;
  newValue: string;
  by: string;
  at: string;
  note?: string;
};

export type StageHistoryEntry = {
  stage: OnboardingStage;
  enteredAt: string;
  by: string;
  note?: string;
};

export type AIInsight = {
  id: string;
  body: string;
  weight: "low" | "medium" | "high";
  topic: "risk" | "client" | "scope" | "timing" | "blocker" | "handoff";
};

export type ClientFlag =
  | "scope_promise_unresolved"
  | "exec_sponsor_changed"
  | "client_ghosted"
  | "kickoff_rescheduled_2x"
  | "manually_advanced"
  | "rep_handoff"
  | "expansion_likely"
  | "high_touch";

export type Plan =
  | "Starter"
  | "Growth"
  | "Enterprise"
  | "Pilot"
  | "Custom";

export type Industry =
  | "B2B SaaS"
  | "Healthcare"
  | "Manufacturing"
  | "Logistics"
  | "Consumer Brands"
  | "Financial Services"
  | "Retail"
  | "Cybersecurity"
  | "Real Estate"
  | "Education"
  | "Travel & Hospitality"
  | "Food & Beverage";

export type Client = {
  id: string;
  name: string; // Company name
  industry: Industry;
  plan: Plan;
  contractValue: number; // annual
  closedAt: string; // when deal closed
  goLiveTarget: string; // expected
  goLiveActual?: string;
  ownerId: string; // onboarding manager
  implementerId?: string; // implementation lead
  csmId?: string; // CSM after launch
  salesRepId: string; // who closed it
  stage: OnboardingStage;
  health: Health;
  // Derived/cached
  daysInOnboarding: number;
  daysInStage: number;
  completionPct: number; // 0-100
  // Operational depth
  stakeholders: Stakeholder[];
  promises: SalesPromise[];
  blockers: Blocker[];
  dataIssues: DataIssue[];
  flags: ClientFlag[];
  stageHistory: StageHistoryEntry[];
  manualOverrides: ManualOverride[];
  aiInsights: AIInsight[];
  // Surface fields
  reasonSurfaced: string;
  recommendedAction: string;
  aiSummary: string;
  notes: string;
  pinnedNote?: string;
  pinnedNoteBy?: string;
  pinnedNoteAt?: string;
  legacyId?: string;
  // Onboarding playbook checklist progress (cached)
  checklistComplete: number; // out of total
  checklistTotal: number;
};

export type AuditEvent = {
  id: string;
  at: string;
  actor: string;
  action: string;
  clientId?: string;
};
