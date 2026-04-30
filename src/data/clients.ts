import type { Client, OnboardingStage, Health } from "./types";
import { daysAgo, daysFromNow, hoursAgo, NOW } from "./time";

// Clients are constructed from declarative seeds that capture realistic mess:
// half-finished records, ghosted clients, scope promises that don't match
// supported features, kickoffs rescheduled twice, manual stage advances.

type ClientSeed = {
  id: string;
  name: string;
  industry: Client["industry"];
  plan: Client["plan"];
  contractValue: number;
  closedDaysAgo: number;
  goLiveTargetDays: number; // from now (negative = past due)
  goLiveActualDaysAgo?: number;
  ownerId: string;
  implementerId?: string;
  csmId?: string;
  salesRepId: string;
  stage: OnboardingStage;
  health: Health;
  notes: string;
  pinnedNote?: string;
  pinnedNoteBy?: string;
  pinnedNoteDaysAgo?: number;
  reasonSurfaced: string;
  recommendedAction: string;
  aiSummary: string;
  legacyId?: string;
  flags?: Client["flags"];
  dataIssues?: Client["dataIssues"];
  checklistComplete: number;
  checklistTotal: number;
  // Stakeholders (lighter than the sales app — onboarding cares about a smaller set)
  stakeholders?: Client["stakeholders"];
  promises?: Array<{
    body: string;
    raisedBy: string;
    daysAgo: number;
    supported: "yes" | "scope_exception" | "no" | "unknown";
    resolution?: string;
  }>;
  blockers?: Array<{
    kind: import("./types").BlockerKind;
    label: string;
    sinceDaysAgo: number;
    setBy: string;
    detail?: string;
    unblocksDays?: number;
  }>;
  stageHistoryDaysAgo?: Array<{
    stage: OnboardingStage;
    daysAgo: number;
    by: string;
    note?: string;
  }>;
  manualOverrides?: Array<{
    field: import("./types").ManualOverride["field"];
    oldValue: string;
    newValue: string;
    by: string;
    daysAgo: number;
    note?: string;
  }>;
  aiInsights?: Client["aiInsights"];
};

const seeds: ClientSeed[] = [
  // ========== AT RISK / WAITING ON CLIENT ==========
  {
    id: "C-2041",
    name: "Helix Robotics",
    industry: "Manufacturing",
    plan: "Enterprise",
    contractValue: 84000,
    closedDaysAgo: 18,
    goLiveTargetDays: 9,
    ownerId: "om_avery",
    implementerId: "imp_kenji",
    csmId: "csm_ines",
    salesRepId: "sales_morgan",
    stage: "configuration",
    health: "internal_blocked",
    notes:
      "Multi-site rollout. Started config last week. Legal still negotiating DPA terms which is gating SSO setup.",
    pinnedNote:
      "WATCH: their procurement is ruthless on SLA terms — don't let our standard 99.5% slip in any doc",
    pinnedNoteBy: "om_avery",
    pinnedNoteDaysAgo: 11,
    reasonSurfaced: "DPA stuck in legal · 7d · gating SSO config",
    recommendedAction: "Escalate DPA to legal lead, propose redline call",
    aiSummary:
      "Configuration phase healthy on the implementation side, but blocked upstream by DPA legal review. Legal contact has been quiet for 7 days. Risk to launch: 5–10 days slip if not unblocked this week.",
    legacyId: "HUB-2026-02-118",
    flags: ["scope_promise_unresolved"],
    dataIssues: ["missing_dpa"],
    checklistComplete: 14,
    checklistTotal: 22,
    stakeholders: [
      {
        id: "sh-2041-1",
        name: "Avery Bloomfield",
        title: "VP, Revenue Operations",
        email: "abloomfield@helixrobotics.com",
        role: "Executive Sponsor",
        status: "engaged",
        lastContactAt: hoursAgo(8),
      },
      {
        id: "sh-2041-2",
        name: "Marcus Penn",
        title: "General Counsel",
        email: "mpenn@helixrobotics.com",
        role: "Legal",
        status: "blocking",
        lastContactAt: daysAgo(7),
        notes: "Wants uncapped IP indemnity. Holding firm at 2× ACV.",
      },
      {
        id: "sh-2041-3",
        name: "Jamie Cho",
        title: "IT Director",
        email: "jcho@helixrobotics.com",
        role: "Technical Contact",
        status: "warm",
        lastContactAt: daysAgo(3),
      },
    ],
    promises: [
      {
        body: "Custom Salesforce sync within 30 days of go-live (not on roadmap)",
        raisedBy: "sales_morgan",
        daysAgo: 17,
        supported: "scope_exception",
        resolution:
          "PM approved 60-day delivery exception. Engineering has scoped.",
      },
      {
        body: "Dedicated CSM within first 90 days",
        raisedBy: "sales_morgan",
        daysAgo: 17,
        supported: "yes",
      },
    ],
    blockers: [
      {
        kind: "legal_review",
        label: "DPA stuck in legal",
        sinceDaysAgo: 7,
        setBy: "om_avery",
        detail: "Their counsel wants uncapped IP indemnity. We countered 2× ACV.",
        unblocksDays: 3,
      },
      {
        kind: "tech_dependency",
        label: "SSO config blocked by DPA",
        sinceDaysAgo: 5,
        setBy: "imp_kenji",
        detail: "Can't proceed without signed DPA covering identity data.",
      },
    ],
    stageHistoryDaysAgo: [
      { stage: "handoff", daysAgo: 18, by: "sales_morgan" },
      { stage: "kickoff_scheduled", daysAgo: 16, by: "om_avery" },
      { stage: "discovery", daysAgo: 14, by: "om_avery" },
      { stage: "asset_collection", daysAgo: 11, by: "om_avery" },
      { stage: "configuration", daysAgo: 6, by: "imp_kenji" },
    ],
    manualOverrides: [
      {
        field: "go_live_target",
        oldValue: "2026-05-04",
        newValue: "2026-05-09",
        by: "om_avery",
        daysAgo: 4,
        note: "Pushed back 5d for legal.",
      },
    ],
    aiInsights: [
      {
        id: "ai-2041-1",
        body: "Launch slip likely 5-10d if DPA not unblocked this week. Counsel-to-counsel call typically resolves in 48h.",
        weight: "high",
        topic: "risk",
      },
      {
        id: "ai-2041-2",
        body: "Champion (Avery) is engaged and replying inside 8h — escalate via her, not legal directly",
        weight: "medium",
        topic: "client",
      },
    ],
  },
  {
    id: "C-2038",
    name: "Brightlane Health",
    industry: "Healthcare",
    plan: "Enterprise",
    contractValue: 62000,
    closedDaysAgo: 14,
    goLiveTargetDays: 18,
    ownerId: "om_avery",
    implementerId: "imp_dante",
    csmId: "csm_sloane",
    salesRepId: "sales_morgan",
    stage: "asset_collection",
    health: "waiting_client",
    notes:
      "Healthcare buyer. Waiting on intake forms + branding assets. Renée (champion) responsive but bandwidth-constrained.",
    pinnedNote:
      "renée is in 11am ET standup → email her after 9am or before 10am ET",
    pinnedNoteBy: "om_avery",
    pinnedNoteDaysAgo: 9,
    reasonSurfaced: "5 client tasks open · 9d quiet on assets",
    recommendedAction: "Send a single-prompt asset request, not a checklist",
    aiSummary:
      "Champion is engaged but slow. Asset requests sent piecemeal — pattern suggests consolidating into one ask would unblock 3 tasks at once.",
    flags: [],
    dataIssues: ["missing_intake_form"],
    checklistComplete: 9,
    checklistTotal: 22,
    stakeholders: [
      {
        id: "sh-2038-1",
        name: "Renée Okafor",
        title: "Director of Sales Enablement",
        email: "renee.okafor@brightlanehealth.com",
        role: "Project Lead",
        status: "warm",
        lastContactAt: daysAgo(4),
      },
      {
        id: "sh-2038-2",
        name: "Daniel Ortiz",
        title: "CISO",
        email: "dortiz@brightlanehealth.com",
        role: "Technical Contact",
        status: "unknown",
        notes: "Needs SOC 2 packet sent directly.",
      },
    ],
    promises: [
      {
        body: "Same-day import of historical CX tickets (CSV)",
        raisedBy: "sales_morgan",
        daysAgo: 14,
        supported: "yes",
      },
    ],
    blockers: [
      {
        kind: "awaiting_client_assets",
        label: "Awaiting intake form + brand assets",
        sinceDaysAgo: 9,
        setBy: "om_avery",
        detail: "5 items pending: brand kit, intake form, sample tickets, agent list, business hours.",
      },
    ],
    stageHistoryDaysAgo: [
      { stage: "handoff", daysAgo: 14, by: "sales_morgan" },
      { stage: "kickoff_scheduled", daysAgo: 12, by: "om_avery" },
      { stage: "discovery", daysAgo: 9, by: "om_avery" },
      { stage: "asset_collection", daysAgo: 5, by: "om_avery" },
    ],
    aiInsights: [
      {
        id: "ai-2038-1",
        body: "Asset requests sent in 4 separate emails — single consolidated ask resolves 2.3× faster for healthcare clients in this size band",
        weight: "high",
        topic: "client",
      },
    ],
  },
  {
    id: "C-2034",
    name: "Aldridge Manufacturing",
    industry: "Manufacturing",
    plan: "Enterprise",
    contractValue: 128000,
    closedDaysAgo: 28,
    goLiveTargetDays: -3,
    ownerId: "om_avery",
    implementerId: "imp_kenji",
    csmId: "csm_ines",
    salesRepId: "sales_morgan",
    stage: "configuration",
    health: "at_risk",
    notes:
      "Largest active deal. Theo (exec sponsor) has been quiet 12 days — original go-live was Monday and we're going to miss.",
    pinnedNote:
      "theo's EA is sarah - try going through her. theo himself is in plant-tour mode all month.",
    pinnedNoteBy: "om_avery",
    pinnedNoteDaysAgo: 5,
    reasonSurfaced: "Past go-live by 3d · sponsor ghosted 12d · highest-value account",
    recommendedAction: "Escalate to manager, schedule new go-live with sponsor's EA",
    aiSummary:
      "Highest-value account, past target by 3 days. Pattern matches our 2024 Halberd deal that ultimately churned post-launch — sponsor disengagement at this stage is the biggest predictor of poor adoption.",
    flags: ["client_ghosted", "kickoff_rescheduled_2x"],
    dataIssues: ["wrong_stakeholder"],
    checklistComplete: 11,
    checklistTotal: 24,
    stakeholders: [
      {
        id: "sh-2034-1",
        name: "Theo Hartmann",
        title: "COO",
        email: "thartmann@aldridge.co",
        role: "Executive Sponsor",
        status: "cold",
        lastContactAt: daysAgo(12),
      },
      {
        id: "sh-2034-2",
        name: "Sarah Liu",
        title: "Executive Assistant to Theo",
        email: "sliu@aldridge.co",
        role: "Project Lead",
        status: "warm",
        lastContactAt: daysAgo(2),
        notes: "Effective gatekeeper. Use her to route asks to Theo.",
      },
    ],
    promises: [
      {
        body: "Multi-site dashboard rollup (3 plants) by go-live",
        raisedBy: "sales_morgan",
        daysAgo: 27,
        supported: "yes",
      },
      {
        body: "Custom KPI for plant-level OEE tracking",
        raisedBy: "sales_morgan",
        daysAgo: 27,
        supported: "scope_exception",
        resolution:
          "Engineering quoted 8 weeks. Communicated to client; deferred to Q3.",
      },
    ],
    blockers: [
      {
        kind: "exec_sponsor_changed",
        label: "Exec sponsor effectively unreachable (12d)",
        sinceDaysAgo: 12,
        setBy: "om_avery",
        detail: "Theo in plant-tour mode all month. Sarah (EA) is acting gateway.",
      },
      {
        kind: "kickoff_reschedule",
        label: "Kickoff rescheduled 2×",
        sinceDaysAgo: 22,
        setBy: "om_avery",
        detail: "Originally 4/12, then 4/19 (theo travel), held 4/24 with mid-level only.",
      },
    ],
    stageHistoryDaysAgo: [
      { stage: "handoff", daysAgo: 28, by: "sales_morgan" },
      { stage: "kickoff_scheduled", daysAgo: 26, by: "om_avery" },
      { stage: "discovery", daysAgo: 19, by: "om_avery" },
      { stage: "asset_collection", daysAgo: 14, by: "om_avery" },
      { stage: "configuration", daysAgo: 8, by: "imp_kenji" },
    ],
    manualOverrides: [
      {
        field: "go_live_target",
        oldValue: "2026-04-21",
        newValue: "2026-04-27",
        by: "om_avery",
        daysAgo: 14,
      },
      {
        field: "go_live_target",
        oldValue: "2026-04-27",
        newValue: "2026-05-04",
        by: "om_avery",
        daysAgo: 4,
        note: "Theo unreachable. Penciling next Monday but unconfirmed.",
      },
      {
        field: "health",
        oldValue: "waiting_client",
        newValue: "at_risk",
        by: "om_avery",
        daysAgo: 3,
      },
    ],
    aiInsights: [
      {
        id: "ai-2034-1",
        body: "Sponsor ghosted pattern — historical churn rate 41% when sponsor disengages 10+ days during config. Escalate this week.",
        weight: "high",
        topic: "risk",
      },
      {
        id: "ai-2034-2",
        body: "Sarah (EA) is responsive — use her to route a 1-paragraph 'we need a 15-min decision' note to Theo",
        weight: "medium",
        topic: "client",
      },
    ],
  },
  // ========== ON TRACK / EARLY ==========
  {
    id: "C-2046",
    name: "Lattice Diagnostics",
    industry: "Healthcare",
    plan: "Growth",
    contractValue: 44000,
    closedDaysAgo: 4,
    goLiveTargetDays: 26,
    ownerId: "om_priya",
    implementerId: "imp_dante",
    csmId: "csm_sloane",
    salesRepId: "sales_priya".replace("priya", "morgan"),
    stage: "kickoff_scheduled",
    health: "on_track",
    notes:
      "Clean handoff. Mei (COO) is the operational lead. Kickoff this Friday.",
    reasonSurfaced: "Kickoff Friday · all prep on track",
    recommendedAction: "Send kickoff prep doc 24h before",
    aiSummary:
      "Healthy early-stage onboarding. Procurement-friendly proposal already sent during sales — fewer downstream surprises expected.",
    checklistComplete: 5,
    checklistTotal: 22,
    stakeholders: [
      {
        id: "sh-2046-1",
        name: "Mei Chen",
        title: "COO",
        email: "mei.chen@latticedx.com",
        role: "Project Lead",
        status: "engaged",
        lastContactAt: daysAgo(1),
      },
    ],
    blockers: [],
    stageHistoryDaysAgo: [
      { stage: "handoff", daysAgo: 4, by: "sales_morgan" },
      { stage: "kickoff_scheduled", daysAgo: 2, by: "om_priya" },
    ],
    aiInsights: [
      {
        id: "ai-2046-1",
        body: "Pre-procurement-aligned deal — historical pattern: 4-6 days faster to launch than average for this plan tier",
        weight: "low",
        topic: "timing",
      },
    ],
  },
  {
    id: "C-2049",
    name: "Kestrel Mobility",
    industry: "Logistics",
    plan: "Growth",
    contractValue: 52000,
    closedDaysAgo: 6,
    goLiveTargetDays: 28,
    ownerId: "om_priya",
    implementerId: "imp_dante",
    csmId: "csm_sloane",
    salesRepId: "sales_jordan",
    stage: "discovery",
    health: "on_track",
    notes:
      "Partner-sourced. Anya is engaged. Discovery call yesterday surfaced 2 stakeholders we hadn't met.",
    reasonSurfaced: "Discovery call complete · 2 new stakeholders to map",
    recommendedAction: "Send stakeholder mapping doc + book 30-min with Carla",
    aiSummary:
      "Partner-sourced deals close 1.6× faster — already ahead of typical timeline. New stakeholders surfaced early is a healthy sign.",
    checklistComplete: 7,
    checklistTotal: 22,
    stakeholders: [
      {
        id: "sh-2049-1",
        name: "Anya Volkov",
        title: "Head of Partnerships",
        role: "Project Lead",
        status: "engaged",
        lastContactAt: hoursAgo(20),
      },
      {
        id: "sh-2049-2",
        name: "Carla Ramos",
        title: "VP Operations",
        role: "Executive Sponsor",
        status: "unknown",
      },
    ],
    blockers: [],
    stageHistoryDaysAgo: [
      { stage: "handoff", daysAgo: 6, by: "sales_jordan" },
      { stage: "kickoff_scheduled", daysAgo: 4, by: "om_priya" },
      { stage: "discovery", daysAgo: 1, by: "om_priya" },
    ],
  },
  // ========== READY FOR LAUNCH ==========
  {
    id: "C-2031",
    name: "Lumen & Co.",
    industry: "Consumer Brands",
    plan: "Growth",
    contractValue: 38000,
    closedDaysAgo: 22,
    goLiveTargetDays: 4,
    ownerId: "om_priya",
    implementerId: "imp_dante",
    csmId: "csm_ines",
    salesRepId: "sales_morgan",
    stage: "launch_prep",
    health: "ready_for_launch",
    notes:
      "Pilot terms locked, tech setup verified. Sasha (champion) signed off on UAT yesterday.",
    pinnedNote:
      "sasha mentioned IRIS (CMO) wants a 'soft' launch with email volume capped first 2 weeks - DON'T forget to gate that in config",
    pinnedNoteBy: "om_priya",
    pinnedNoteDaysAgo: 2,
    reasonSurfaced: "UAT signed off · launch in 4 days",
    recommendedAction: "Confirm CMO sign-off on volume gate · send launch comms",
    aiSummary:
      "Clean late-stage path. Two soft items remain: gated email volume (per CMO) and CSM intro. Both fit the standard launch checklist.",
    flags: [],
    checklistComplete: 20,
    checklistTotal: 22,
    stakeholders: [
      {
        id: "sh-2031-1",
        name: "Sasha Berger",
        title: "VP Marketing",
        role: "Champion",
        status: "engaged",
        lastContactAt: hoursAgo(18),
      },
      {
        id: "sh-2031-2",
        name: "Iris Mendez",
        title: "CMO",
        role: "Executive Sponsor",
        status: "warm",
        lastContactAt: daysAgo(5),
      },
    ],
    blockers: [],
    promises: [
      {
        body: "90-day pilot terms (extended from 60)",
        raisedBy: "sales_morgan",
        daysAgo: 21,
        supported: "yes",
      },
    ],
    stageHistoryDaysAgo: [
      { stage: "handoff", daysAgo: 22, by: "sales_morgan" },
      { stage: "kickoff_scheduled", daysAgo: 20, by: "om_priya" },
      { stage: "discovery", daysAgo: 17, by: "om_priya" },
      { stage: "asset_collection", daysAgo: 14, by: "om_priya" },
      { stage: "configuration", daysAgo: 10, by: "imp_dante" },
      { stage: "uat", daysAgo: 4, by: "om_priya" },
      { stage: "launch_prep", daysAgo: 1, by: "om_priya", note: "UAT passed first try" },
    ],
    aiInsights: [
      {
        id: "ai-2031-1",
        body: "Highest-confidence launch in the queue — UAT passed first attempt, champion signed off in writing",
        weight: "low",
        topic: "client",
      },
    ],
  },
  {
    id: "C-2027",
    name: "Riverstone Realty",
    industry: "Real Estate",
    plan: "Starter",
    contractValue: 28000,
    closedDaysAgo: 30,
    goLiveTargetDays: 0,
    ownerId: "om_priya",
    implementerId: "imp_dante",
    csmId: "csm_sloane",
    salesRepId: "sales_morgan",
    stage: "launch_prep",
    health: "ready_for_launch",
    notes:
      "Going live today. Soft launch — single office first, then expand to 4 next week.",
    reasonSurfaced: "Going live today",
    recommendedAction: "Run go-live checklist · post in #launches",
    aiSummary:
      "Standard SMB launch. Eitan agreed to be a reference post-launch.",
    checklistComplete: 22,
    checklistTotal: 22,
    stakeholders: [
      {
        id: "sh-2027-1",
        name: "Eitan Halevi",
        title: "Founder",
        role: "Executive Sponsor",
        status: "engaged",
        lastContactAt: daysAgo(1),
      },
    ],
    stageHistoryDaysAgo: [
      { stage: "handoff", daysAgo: 30, by: "sales_morgan" },
      { stage: "kickoff_scheduled", daysAgo: 27, by: "om_priya" },
      { stage: "discovery", daysAgo: 25, by: "om_priya" },
      { stage: "asset_collection", daysAgo: 20, by: "om_priya" },
      { stage: "configuration", daysAgo: 15, by: "imp_dante" },
      { stage: "uat", daysAgo: 7, by: "om_priya" },
      { stage: "launch_prep", daysAgo: 3, by: "om_priya" },
    ],
  },
  // ========== INTERNAL BLOCKED ==========
  {
    id: "C-2042",
    name: "Pacific Ridge Logistics",
    industry: "Logistics",
    plan: "Enterprise",
    contractValue: 72000,
    closedDaysAgo: 12,
    goLiveTargetDays: 22,
    ownerId: "om_avery",
    implementerId: "imp_kenji",
    csmId: "csm_ines",
    salesRepId: "sales_jordan",
    stage: "discovery",
    health: "internal_blocked",
    notes:
      "Implementation team flagged a custom integration we promised may need engineering support — Owen on client side is patient but waiting.",
    reasonSurfaced: "Implementation flagged scope risk · 4d in triage",
    recommendedAction: "Get PM decision on scope today; communicate to client",
    aiSummary:
      "Sales handoff included a custom routing integration ('like RouteWise but better') that engineering hasn't sized. Client is patient now but the gap will widen.",
    flags: ["scope_promise_unresolved", "rep_handoff"],
    checklistComplete: 6,
    checklistTotal: 22,
    stakeholders: [
      {
        id: "sh-2042-1",
        name: "Owen Caldwell",
        title: "Director of BD",
        role: "Project Lead",
        status: "warm",
        lastContactAt: daysAgo(2),
      },
    ],
    promises: [
      {
        body: "Custom routing integration on parity with RouteWise (mentioned in deal stage)",
        raisedBy: "sales_jordan",
        daysAgo: 11,
        supported: "unknown",
        resolution: "Engineering scoping. PM expected decision Friday.",
      },
    ],
    blockers: [
      {
        kind: "scope_exception",
        label: "Custom integration scoping (engineering)",
        sinceDaysAgo: 4,
        setBy: "imp_kenji",
        detail: "Need PM + eng decision on scope. Holding discovery until clarified.",
      },
    ],
    stageHistoryDaysAgo: [
      { stage: "handoff", daysAgo: 12, by: "sales_jordan" },
      { stage: "kickoff_scheduled", daysAgo: 10, by: "om_avery" },
      { stage: "discovery", daysAgo: 7, by: "om_avery" },
    ],
    manualOverrides: [
      {
        field: "owner",
        oldValue: "om_priya",
        newValue: "om_avery",
        by: "om_avery",
        daysAgo: 6,
        note: "Reassigned — Avery has handled custom integrations before.",
      },
    ],
    aiInsights: [
      {
        id: "ai-2042-1",
        body: "Scope ambiguity from sales — pattern matches L-1019 in CRM where similar promises caused 18d slip",
        weight: "high",
        topic: "scope",
      },
    ],
  },
  // ========== UAT / LATE STAGE HEALTHY ==========
  {
    id: "C-2029",
    name: "Cypress Foods",
    industry: "Food & Beverage",
    plan: "Enterprise",
    contractValue: 64000,
    closedDaysAgo: 24,
    goLiveTargetDays: 7,
    ownerId: "om_avery",
    implementerId: "imp_kenji",
    csmId: "csm_ines",
    salesRepId: "sales_morgan",
    stage: "uat",
    health: "on_track",
    notes:
      "UAT in progress with their ops team. Lila (VP Ops) running it personally — good sign.",
    reasonSurfaced: "UAT in flight · client driving · launch in 7d",
    recommendedAction: "Daily UAT standup until launch · prep launch comms",
    aiSummary:
      "Late-stage on-track. UAT being run by VP Ops directly is one of the strongest predictors of clean launch.",
    checklistComplete: 18,
    checklistTotal: 22,
    stakeholders: [
      {
        id: "sh-2029-1",
        name: "Lila Marchetti",
        title: "VP Operations",
        role: "Champion",
        status: "engaged",
        lastContactAt: hoursAgo(12),
      },
    ],
    blockers: [],
    stageHistoryDaysAgo: [
      { stage: "handoff", daysAgo: 24, by: "sales_morgan" },
      { stage: "kickoff_scheduled", daysAgo: 22, by: "om_avery" },
      { stage: "discovery", daysAgo: 19, by: "om_avery" },
      { stage: "asset_collection", daysAgo: 15, by: "om_avery" },
      { stage: "configuration", daysAgo: 10, by: "imp_kenji" },
      { stage: "uat", daysAgo: 3, by: "om_avery" },
    ],
  },
  // ========== NEW HANDOFFS ==========
  {
    id: "C-2052",
    name: "Granite Peak Outfitters",
    industry: "Retail",
    plan: "Starter",
    contractValue: 18000,
    closedDaysAgo: 1,
    goLiveTargetDays: 30,
    ownerId: "om_priya",
    salesRepId: "sales_jordan",
    stage: "handoff",
    health: "on_track",
    notes:
      "Brand new handoff today. Carter is the contact. Need to schedule kickoff.",
    reasonSurfaced: "New handoff · awaiting kickoff scheduling",
    recommendedAction: "Reach out to schedule kickoff in next 48h",
    aiSummary:
      "Standard SMB handoff. Sales notes are thin — schedule kickoff to gather what's missing.",
    flags: [],
    dataIssues: ["missing_intake_form", "missing_tech_contact"],
    checklistComplete: 1,
    checklistTotal: 22,
    stakeholders: [
      {
        id: "sh-2052-1",
        name: "Carter Yates",
        title: "Director, Operations",
        role: "Project Lead",
        status: "unknown",
      },
    ],
    blockers: [],
    stageHistoryDaysAgo: [{ stage: "handoff", daysAgo: 1, by: "sales_jordan" }],
    aiInsights: [
      {
        id: "ai-2052-1",
        body: "Sales handoff notes are sparse — recommend scheduling discovery before configuration scoping",
        weight: "medium",
        topic: "handoff",
      },
    ],
  },
  {
    id: "C-2053",
    name: "Trailhead Software",
    industry: "B2B SaaS",
    plan: "Growth",
    contractValue: 36000,
    closedDaysAgo: 2,
    goLiveTargetDays: 32,
    ownerId: "om_priya",
    implementerId: "imp_dante",
    csmId: "csm_sloane",
    salesRepId: "sales_morgan",
    stage: "kickoff_scheduled",
    health: "on_track",
    notes:
      "Referral from Brightlane Health. Hassan was a fast move from intro to close.",
    reasonSurfaced: "Warm referral · kickoff in 2 days",
    recommendedAction: "Pre-share kickoff agenda + ask for tech contact",
    aiSummary:
      "Warm-referral deals onboard 1.4× faster than average. Hassan is engaged.",
    checklistComplete: 4,
    checklistTotal: 22,
    stakeholders: [
      {
        id: "sh-2053-1",
        name: "Hassan Bouzid",
        title: "VP, Customer Success",
        role: "Project Lead",
        status: "engaged",
        lastContactAt: hoursAgo(6),
      },
    ],
    blockers: [],
    stageHistoryDaysAgo: [
      { stage: "handoff", daysAgo: 2, by: "sales_morgan" },
      { stage: "kickoff_scheduled", daysAgo: 1, by: "om_priya" },
    ],
  },
  // ========== TRANSITIONED (recently launched) ==========
  {
    id: "C-2018",
    name: "Verity Mortgage",
    industry: "Financial Services",
    plan: "Growth",
    contractValue: 41000,
    closedDaysAgo: 56,
    goLiveTargetDays: -14,
    goLiveActualDaysAgo: 14,
    ownerId: "om_avery",
    implementerId: "imp_kenji",
    csmId: "csm_sloane",
    salesRepId: "sales_jordan",
    stage: "transitioned",
    health: "on_track",
    notes:
      "Live for 2 weeks, transitioned to Sloane. Adoption metrics ahead of plan.",
    reasonSurfaced: "Transitioned · adoption ahead of plan",
    recommendedAction: "Schedule 30-day check-in with Sloane",
    aiSummary:
      "Clean transition. Reference-able post 60 days.",
    checklistComplete: 24,
    checklistTotal: 24,
    stakeholders: [
      {
        id: "sh-2018-1",
        name: "Wesley Park",
        title: "Head of Sales",
        role: "Champion",
        status: "engaged",
        lastContactAt: daysAgo(3),
      },
    ],
    stageHistoryDaysAgo: [
      { stage: "handoff", daysAgo: 56, by: "sales_jordan" },
      { stage: "live", daysAgo: 14, by: "om_avery" },
      { stage: "transitioned", daysAgo: 7, by: "om_avery" },
    ],
  },
  {
    id: "C-2014",
    name: "Solene Beauty",
    industry: "Consumer Brands",
    plan: "Starter",
    contractValue: 22000,
    closedDaysAgo: 41,
    goLiveTargetDays: -8,
    goLiveActualDaysAgo: 8,
    ownerId: "om_priya",
    implementerId: "imp_dante",
    csmId: "csm_ines",
    salesRepId: "sales_morgan",
    stage: "live",
    health: "on_track",
    notes: "Live 8 days. CSM introduction held Tuesday.",
    reasonSurfaced: "Live · transition to CSM in flight",
    recommendedAction: "Confirm CSM intake done · then move to transitioned",
    aiSummary:
      "Holiday season for CPG brand starts in 5 weeks — make sure CSM has playbook before then.",
    checklistComplete: 23,
    checklistTotal: 24,
    stakeholders: [
      {
        id: "sh-2014-1",
        name: "Yuki Tanaka",
        title: "Head of CX",
        role: "Champion",
        status: "engaged",
        lastContactAt: daysAgo(1),
      },
    ],
    stageHistoryDaysAgo: [
      { stage: "handoff", daysAgo: 41, by: "sales_morgan" },
      { stage: "live", daysAgo: 8, by: "om_priya" },
    ],
  },
];

export const clients: Client[] = seeds.map((s) => {
  const closedAt = daysAgo(s.closedDaysAgo);
  const goLiveTarget =
    s.goLiveTargetDays >= 0
      ? daysFromNow(s.goLiveTargetDays)
      : daysAgo(-s.goLiveTargetDays);
  const goLiveActual =
    s.goLiveActualDaysAgo !== undefined
      ? daysAgo(s.goLiveActualDaysAgo)
      : undefined;

  // Pin note timestamp
  const pinnedNoteAt =
    s.pinnedNote && s.pinnedNoteDaysAgo !== undefined
      ? daysAgo(s.pinnedNoteDaysAgo)
      : undefined;

  // Stage history
  const stageHistory = (s.stageHistoryDaysAgo ?? []).map((h) => ({
    stage: h.stage,
    enteredAt: daysAgo(h.daysAgo),
    by: h.by,
    note: h.note,
  }));

  // Days in onboarding (from earliest stage history entry)
  const earliestStage = stageHistory[0];
  const daysInOnboarding = earliestStage
    ? Math.floor(
        (NOW.getTime() - new Date(earliestStage.enteredAt).getTime()) /
          86400000,
      )
    : s.closedDaysAgo;

  // Days in current stage
  const currentStageEntry = stageHistory.find((h) => h.stage === s.stage);
  const daysInStage = currentStageEntry
    ? Math.floor(
        (NOW.getTime() -
          new Date(currentStageEntry.enteredAt).getTime()) /
          86400000,
      )
    : 0;

  const completionPct = Math.round(
    (s.checklistComplete / s.checklistTotal) * 100,
  );

  // Promises
  const promises = (s.promises ?? []).map((p, i) => ({
    id: `pr-${s.id}-${i}`,
    body: p.body,
    raisedBy: p.raisedBy,
    at: daysAgo(p.daysAgo),
    supported: p.supported,
    resolution: p.resolution,
  }));

  // Blockers
  const blockers = (s.blockers ?? []).map((b, i) => ({
    id: `bl-${s.id}-${i}`,
    kind: b.kind,
    label: b.label,
    since: daysAgo(b.sinceDaysAgo),
    setBy: b.setBy,
    detail: b.detail,
    unblocksAt:
      b.unblocksDays !== undefined ? daysFromNow(b.unblocksDays) : undefined,
  }));

  // Manual overrides
  const manualOverrides = (s.manualOverrides ?? []).map((m, i) => ({
    id: `mo-${s.id}-${i}`,
    field: m.field,
    oldValue: m.oldValue,
    newValue: m.newValue,
    by: m.by,
    at: daysAgo(m.daysAgo),
    note: m.note,
  }));

  return {
    id: s.id,
    name: s.name,
    industry: s.industry,
    plan: s.plan,
    contractValue: s.contractValue,
    closedAt,
    goLiveTarget,
    goLiveActual,
    ownerId: s.ownerId,
    implementerId: s.implementerId,
    csmId: s.csmId,
    salesRepId: s.salesRepId,
    stage: s.stage,
    health: s.health,
    daysInOnboarding,
    daysInStage,
    completionPct,
    stakeholders: s.stakeholders ?? [],
    promises,
    blockers,
    dataIssues: s.dataIssues ?? [],
    flags: s.flags ?? [],
    stageHistory,
    manualOverrides,
    aiInsights: s.aiInsights ?? [],
    reasonSurfaced: s.reasonSurfaced,
    recommendedAction: s.recommendedAction,
    aiSummary: s.aiSummary,
    notes: s.notes,
    pinnedNote: s.pinnedNote,
    pinnedNoteBy: s.pinnedNoteBy,
    pinnedNoteAt,
    legacyId: s.legacyId,
    checklistComplete: s.checklistComplete,
    checklistTotal: s.checklistTotal,
  };
});

export const clientsById = Object.fromEntries(clients.map((c) => [c.id, c]));

export const fmtMoney = (n: number) => {
  if (n >= 1_000_000)
    return `$${(n / 1_000_000).toFixed(2).replace(/\.00$/, "")}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return `$${n.toLocaleString()}`;
};
