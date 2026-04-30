// Operational mess seed data — cross-functional conflicts, reconciliation items,
// AI detections. Layered on top of the base client data via depth lookups.

import type {
  CrossFunctionalConflict,
  ReconciliationItem,
  AIDetection,
  InternalComment,
} from "./types";
import { daysAgo, hoursAgo } from "./time";

export const conflictsByClient: Record<string, CrossFunctionalConflict[]> = {
  // Helix Robotics — sales promised Salesforce sync, implementation pushing back
  "C-2041": [
    {
      id: "cf-2041-1",
      clientId: "C-2041",
      topic: "scope_mismatch",
      title: "Salesforce sync timing",
      detail:
        "Sales promised 30-day delivery on the Salesforce sync. Implementation says 60-day minimum even with the PM-approved exception. CSM worried this becomes the launch story.",
      between: ["sales", "implementation", "success"],
      raisedBy: "imp_kenji",
      at: daysAgo(8),
      status: "in_discussion",
    },
    {
      id: "cf-2041-2",
      clientId: "C-2041",
      topic: "responsibility_unclear",
      title: "Who owns DPA escalation?",
      detail:
        "Onboarding thinks legal team should escalate counsel-to-counsel. Legal team thinks onboarding should keep chasing through Avery. Sitting at 7 days no movement.",
      between: ["onboarding"],
      raisedBy: "om_avery",
      at: daysAgo(3),
      status: "open",
    },
  ],
  // Pacific Ridge — the classic "we can do something similar to RouteWise" handoff
  "C-2042": [
    {
      id: "cf-2042-1",
      clientId: "C-2042",
      topic: "promise_vs_package",
      title: "Custom routing integration scope",
      detail:
        "Sales (Jordan) said 'we can do something similar to RouteWise.' Client heard parity. Implementation can build ~60% of RouteWise functionality in-package, full parity is 8-12 weeks of custom work. Engineering needs PM call to descope or quote.",
      between: ["sales", "implementation"],
      raisedBy: "imp_kenji",
      at: daysAgo(4),
      status: "in_discussion",
      resolution: "PM call scheduled Thursday — descope vs. quote decision",
    },
  ],
  // Aldridge — multiple teams worried for different reasons
  "C-2034": [
    {
      id: "cf-2034-1",
      clientId: "C-2034",
      topic: "launch_risk_disagreement",
      title: "Push launch vs. ship-and-iterate",
      detail:
        "Onboarding wants to push go-live another 2 weeks until sponsor re-engages. Implementation says they're ready and config will rot if it sits. CSM wants to go-live but with reduced scope (single plant first) so we don't blow the relationship.",
      between: ["onboarding", "implementation", "success"],
      raisedBy: "csm_ines",
      at: daysAgo(2),
      status: "open",
    },
    {
      id: "cf-2034-2",
      clientId: "C-2034",
      topic: "stakeholder_dispute",
      title: "Sarah (EA) as decision-maker?",
      detail:
        "Avery treating Sarah-the-EA as effective gatekeeper. Implementation worried we're committing to scope decisions through someone without authority. Want Theo on a call before any more work.",
      between: ["onboarding", "implementation"],
      raisedBy: "imp_kenji",
      at: daysAgo(1),
      status: "open",
    },
  ],
  // Brightlane — billing tension
  "C-2038": [
    {
      id: "cf-2038-1",
      clientId: "C-2038",
      topic: "billing_mismatch",
      title: "PO splits across departments",
      detail:
        "Brightlane finance wants to split the contract value across two POs (CX dept + IT dept). Our billing system requires a single PO. Daniel (CISO) trying to mediate but it's been quiet.",
      between: ["onboarding", "success"],
      raisedBy: "om_avery",
      at: daysAgo(5),
      status: "open",
    },
  ],
  // Lumen — last-minute volume gate ask is a soft conflict
  "C-2031": [
    {
      id: "cf-2031-1",
      clientId: "C-2031",
      topic: "missing_requirement",
      title: "CMO's volume gate ask came late",
      detail:
        "Iris (CMO) added a soft-launch volume cap 2 days before launch — wasn't in original scope. Implementation can config it but it's last-minute and Sasha wasn't aware her boss was going to ask.",
      between: ["onboarding", "implementation"],
      raisedBy: "imp_dante",
      at: hoursAgo(20),
      status: "resolved",
      resolution: "Config ready, gated to first 2 weeks. Will lift automatically.",
    },
  ],
};

export const reconciliationByClient: Record<string, ReconciliationItem[]> = {
  "C-2038": [
    {
      id: "rc-2038-1",
      clientId: "C-2038",
      what: "HIPAA intake form",
      clientClaim: "Renée says she sent it Tuesday via DocuSign",
      ourReality: "No DocuSign envelope received. Inbox/spam clean.",
      raisedAt: daysAgo(2),
      status: "open",
    },
    {
      id: "rc-2038-2",
      clientId: "C-2038",
      what: "Sample tickets CSV",
      clientClaim: "'Sent that last week'",
      ourReality: "Got a 3-row sample, not the 50 we asked for. Need to clarify.",
      raisedAt: daysAgo(4),
      status: "open",
    },
  ],
  "C-2041": [
    {
      id: "rc-2041-1",
      clientId: "C-2041",
      what: "Admin user list",
      clientClaim: "Jamie said 'IT will export it this week'",
      ourReality: "Nothing yet. Friday 4pm — likely won't happen this week.",
      raisedAt: daysAgo(3),
      status: "open",
    },
  ],
  "C-2034": [
    {
      id: "rc-2034-1",
      clientId: "C-2034",
      what: "Site C plant data",
      clientClaim: "Theo's team says they uploaded weeks ago",
      ourReality:
        "Site A and B are in. Site C never uploaded. Possible they sent to wrong endpoint.",
      raisedAt: daysAgo(8),
      status: "open",
    },
    {
      id: "rc-2034-2",
      clientId: "C-2034",
      what: "Updated COO contact",
      clientClaim: "Sarah said Theo is 'reachable on his cell'",
      ourReality: "Number we have rings to office voicemail. May be stale.",
      raisedAt: daysAgo(6),
      status: "open",
    },
  ],
  "C-2042": [
    {
      id: "rc-2042-1",
      clientId: "C-2042",
      what: "Current routing config",
      clientClaim: "Owen said 'I sent it to Kenji last week'",
      ourReality:
        "Got a screenshot, not the actual config files. Need the JSON exports.",
      raisedAt: daysAgo(2),
      status: "open",
    },
  ],
};

export const aiDetectionsByClient: Record<string, AIDetection[]> = {
  "C-2041": [
    {
      id: "aid-2041-1",
      clientId: "C-2041",
      kind: "scope_mismatch",
      body: "Detected scope mismatch in handoff notes — Sales mentioned 'custom Salesforce sync' but the Enterprise plan only includes the standard Salesforce connector. PM exception logged.",
      weight: "high",
      surface: "tab_handoff",
      detectedAt: daysAgo(15),
    },
    {
      id: "aid-2041-2",
      clientId: "C-2041",
      kind: "missing_dependency",
      body: "SSO config can't proceed without signed DPA. Suggest blocking that task explicitly so the dependency is visible.",
      weight: "high",
      surface: "tab_blockers",
      detectedAt: daysAgo(5),
    },
    {
      id: "aid-2041-3",
      clientId: "C-2041",
      kind: "redundant_artifact",
      body: "Two documents named 'Helix-Kickoff-Notes-v3' and 'Helix-Kickoff-Notes-v3-FINAL' — one is likely stale. Consolidate before next legal review.",
      weight: "medium",
      surface: "tab_documents",
      detectedAt: daysAgo(2),
    },
  ],
  "C-2042": [
    {
      id: "aid-2042-1",
      clientId: "C-2042",
      kind: "promise_conflict",
      body: "Sales promise 'parity with RouteWise' conflicts with Growth-tier package scope. Either descope (recommend) or generate a scope-exception ticket for engineering.",
      weight: "high",
      surface: "tab_handoff",
      detectedAt: daysAgo(11),
    },
    {
      id: "aid-2042-2",
      clientId: "C-2042",
      kind: "stakeholder_gap",
      body: "Owen's boss Carla holds budget approval but hasn't been met. Historical pattern: deals like this slip 12-18 days when budget approver isn't engaged before configuration.",
      weight: "medium",
      surface: "tab_overview",
      detectedAt: daysAgo(6),
    },
  ],
  "C-2034": [
    {
      id: "aid-2034-1",
      clientId: "C-2034",
      kind: "timing_warning",
      body: "Sponsor responsiveness pattern matches the Halberd 2024 churn case — 12 day silence at config stage correlates with 41% post-launch churn rate. Recommend executive escalation before any further work.",
      weight: "high",
      surface: "global",
      detectedAt: daysAgo(2),
    },
  ],
  "C-2038": [
    {
      id: "aid-2038-1",
      clientId: "C-2038",
      kind: "missing_dependency",
      body: "5 client tasks open across 4 separate emails — consolidating into one ask resolves 2.3× faster for healthcare clients in this size band.",
      weight: "high",
      surface: "tab_tasks",
      detectedAt: daysAgo(1),
    },
    {
      id: "aid-2038-2",
      clientId: "C-2038",
      kind: "billing_risk",
      body: "Detected PO mismatch — client wants to split contract across CX/IT departments. Our billing setup will reject. Pre-empt this with finance before they encounter it.",
      weight: "high",
      surface: "tab_approvals",
      detectedAt: daysAgo(5),
    },
  ],
  "C-2031": [
    {
      id: "aid-2031-1",
      clientId: "C-2031",
      kind: "timing_warning",
      body: "Highest-confidence launch in queue — UAT passed first attempt, champion + decision-maker both engaged in last 6h.",
      weight: "low",
      surface: "tab_overview",
      detectedAt: hoursAgo(4),
    },
  ],
};

// Additional charged internal comments showing inter-team friction
export const extraInternalComments: InternalComment[] = [
  {
    id: "ic-7001",
    clientId: "C-2042",
    authorId: "imp_kenji",
    body: "@morgan @jordan I need a yes/no on routing scope by EOD thurs or I'm pausing config. Can't keep building speculatively.",
    at: daysAgo(2),
    mentions: ["sales_morgan", "sales_jordan"],
  },
  {
    id: "ic-7002",
    clientId: "C-2042",
    authorId: "sales_jordan",
    body: "fair. ill push the PM call to wed instead of thurs. owe you one.",
    at: daysAgo(2),
  },
  {
    id: "ic-7003",
    clientId: "C-2034",
    authorId: "csm_ines",
    body: "@avery genuine ask: how confident are you we get a real go-live date this week? I'm starting to plan a soft transition convo with Sloane and I don't want to be premature.",
    at: hoursAgo(18),
    mentions: ["om_avery"],
  },
  {
    id: "ic-7004",
    clientId: "C-2034",
    authorId: "om_avery",
    body: "@ines honestly 60/40. sarah is helpful but theo needs to actually sign off and he's not picking up. would NOT plan transition yet.",
    at: hoursAgo(16),
    mentions: ["csm_ines"],
  },
  {
    id: "ic-7005",
    clientId: "C-2038",
    authorId: "om_avery",
    body: "@dante billing flagged the PO split. they wont process two POs against one contract. need to either get brightlane to issue one PO or get an exception from finance leadership. neither is fast.",
    at: daysAgo(1),
    mentions: ["imp_dante"],
  },
  {
    id: "ic-7006",
    clientId: "C-2041",
    authorId: "imp_kenji",
    body: "kicking this back to leadership: sales-promised salesforce sync is going to slip beyond the 60d exception. avery's team is already nervous. either we pull in a 3rd party integrator (costs us margin) or we have a hard conversation with helix.",
    at: daysAgo(4),
  },
  {
    id: "ic-7007",
    clientId: "C-2041",
    authorId: "om_avery",
    body: "@kenji i'll have the convo. avery is mature about this stuff. better to have it now than at week 6.",
    at: daysAgo(4),
    mentions: ["imp_kenji"],
  },
  {
    id: "ic-7008",
    clientId: "C-2046",
    authorId: "om_priya",
    body: "lattice was the cleanest sales handoff I've seen this quarter. morgan you should write up what you did differently.",
    at: hoursAgo(36),
  },
];
