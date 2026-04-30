import { useEffect, useMemo, useState } from "react";
import {
  X,
  Sparkles,
  Mail,
  ShieldAlert,
  Compass,
  Repeat,
  MessageCircleQuestion,
  Send,
  Copy,
  Check,
  HandHeart,
  AlertOctagon,
  FileMinus,
} from "lucide-react";
import { useAppState } from "../../state/AppState";
import { useStore } from "../../state/DataStore";
import { Avatar } from "../ui/Avatar";
import { fmtMoney } from "../../lib/format";

type Action =
  | "summarize_risk"
  | "identify_blockers"
  | "draft_followup"
  | "summarize_missing"
  | "draft_reminder"
  | "summarize_handoff"
  | "flag_scope_risk"
  | "next_action";

type Msg = {
  id: string;
  role: "user" | "assistant";
  body: string;
  meta?: string;
};

const actionMeta: Record<
  Action,
  {
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    chip: string;
  }
> = {
  summarize_risk: { label: "Summarize onboarding risk", icon: ShieldAlert, chip: "Risk" },
  identify_blockers: { label: "Identify blockers", icon: AlertOctagon, chip: "Blockers" },
  draft_followup: { label: "Generate follow-up email", icon: Mail, chip: "Email" },
  summarize_missing: { label: "Summarize missing requirements", icon: FileMinus, chip: "Missing" },
  draft_reminder: { label: "Draft client reminder", icon: Repeat, chip: "Reminder" },
  summarize_handoff: { label: "Summarize sales handoff", icon: HandHeart, chip: "Handoff" },
  flag_scope_risk: { label: "Flag scope risk", icon: MessageCircleQuestion, chip: "Scope" },
  next_action: { label: "Suggest next best action", icon: Compass, chip: "Action" },
};

function generateOutput(
  action: Action,
  clientId: string | null,
  store: ReturnType<typeof useStore>,
): string {
  const c = clientId ? store.clientById(clientId) : null;
  if (!c) {
    if (action === "next_action")
      return [
        "Three highest-leverage moves across active onboardings:",
        "",
        "1. Aldridge Manufacturing ($128k) — past go-live by 3 days, sponsor ghosted 12d. Escalate to manager + go through Theo's EA.",
        "2. Helix Robotics ($84k) — DPA stuck in legal 7d, blocking SSO config. Counsel-to-counsel call resolves these in 48h on average.",
        "3. Brightlane Health ($62k) — 5 client tasks open, 9d quiet. Consolidate into a single ask instead of piecemeal.",
        "",
        "Doing all three this week unblocks ~$274k of pipeline.",
      ].join("\n");
    return "Open a specific client to get a tailored draft. From the queue or any list, click an account and reopen the assistant — output will be grounded in that client's history.";
  }

  switch (action) {
    case "summarize_risk":
      return [
        `${c.name} risk read · health: ${c.health.replace("_", " ")}`,
        "",
        `Top risks:`,
        `• ${c.reasonSurfaced}`,
        ...c.blockers.map((b) => `• ${b.label}`),
        c.flags.includes("client_ghosted") ? "• Sponsor ghosted (12+ days no reply)" : "",
        c.flags.includes("scope_promise_unresolved")
          ? "• Sales-side promise unresolved — scope ambiguity"
          : "",
        "",
        `Mitigations to take this week:`,
        `1. ${c.recommendedAction}`,
        `2. Confirm decision-maker availability in writing`,
        `3. Pre-empt one likely friction (legal, scope, or asset gap) before it surfaces`,
      ]
        .filter(Boolean)
        .join("\n");
    case "identify_blockers":
      if (c.blockers.length === 0)
        return `No blockers logged on ${c.name}. Health is "${c.health.replace("_", " ")}". If you suspect friction, log it explicitly so the queue surfaces it.`;
      return [
        `${c.name} active blockers:`,
        "",
        ...c.blockers.map(
          (b, i) =>
            `${i + 1}. ${b.label}${b.detail ? `\n   ${b.detail}` : ""}`,
        ),
        "",
        `Recommended action: ${c.recommendedAction}`,
      ].join("\n");
    case "draft_followup":
      return [
        `Subject: ${c.name} · Following up on next steps`,
        "",
        `Hi ${c.stakeholders[0]?.name.split(" ")[0] ?? "team"},`,
        "",
        `Wanted to make sure my last note didn't get buried. Where we left things — ${c.recommendedAction.toLowerCase()}.`,
        "",
        `If you're heads-down this week, even a one-line reply with a "yes/wait/handoff to X" would unblock us.`,
        "",
        "Thanks,",
        "Avery",
      ].join("\n");
    case "summarize_missing":
      if (c.dataIssues.length === 0)
        return `${c.name}: no data gaps detected. ${c.checklistComplete}/${c.checklistTotal} checklist items complete.`;
      return [
        `${c.name} missing requirements:`,
        "",
        ...c.dataIssues.map((d, i) => `${i + 1}. ${d.replace(/_/g, " ")}`),
        "",
        `These should be batched into a single ask to avoid overwhelming the client contact.`,
      ].join("\n");
    case "draft_reminder":
      return [
        `Subject: Quick reminder · ${c.name} onboarding`,
        "",
        `Hi ${c.stakeholders[0]?.name.split(" ")[0] ?? "team"},`,
        "",
        `Friendly nudge — we're tracking your launch for ${new Date(c.goLiveTarget).toLocaleDateString("en-US", { month: "short", day: "numeric" })} and need a couple of items from your side to keep that on track:`,
        "",
        ...(c.blockers
          .filter((b) => b.kind === "awaiting_client_assets" || b.kind === "client_unresponsive")
          .map((b) => `• ${b.label}`)
          .slice(0, 3)),
        ...(c.dataIssues.slice(0, 3).map((d) => `• ${d.replace(/_/g, " ")}`)),
        "",
        `Even partial responses help — happy to jump on a 10-min call if easier.`,
        "",
        "Thanks,",
        "Avery",
      ].join("\n");
    case "summarize_handoff":
      return [
        `${c.name} sales handoff summary`,
        "",
        `• Plan: ${c.plan}`,
        `• Contract: ${fmtMoney(c.contractValue)}`,
        `• Closed by: ${c.salesRepId}`,
        `• Stakeholders identified: ${c.stakeholders.length}`,
        `• Promises tracked: ${c.promises.length}`,
        "",
        `Promises:`,
        ...(c.promises.length === 0
          ? ["(none logged — verify with sales rep)"]
          : c.promises.map(
              (p) =>
                `• "${p.body}" — ${p.supported.replace("_", " ")}${p.resolution ? ` (${p.resolution})` : ""}`,
            )),
      ].join("\n");
    case "flag_scope_risk":
      if (!c.flags.includes("scope_promise_unresolved") && c.promises.every((p) => p.supported === "yes"))
        return `${c.name}: no scope risk detected. All promises currently flagged as supported.`;
      return [
        `${c.name} scope risk read:`,
        "",
        ...c.promises
          .filter((p) => p.supported !== "yes")
          .map(
            (p) =>
              `⚠ "${p.body}" — ${p.supported.replace("_", " ")}${p.resolution ? `\n   Resolution: ${p.resolution}` : ""}`,
          ),
        "",
        `Recommendation: explicit confirmation in writing with the client about what's in vs. out before the next stage transition.`,
      ].join("\n");
    case "next_action":
      return [
        `Recommended next move for ${c.name}:`,
        "",
        `→ ${c.recommendedAction}`,
        "",
        `Why: ${c.aiSummary}`,
        "",
        `Time-to-execute: ~${c.health === "at_risk" ? "30 minutes" : "2 hours"}`,
      ].join("\n");
  }
}

function newId() {
  return Math.random().toString(36).slice(2, 9);
}

export function AIAssistantPanel() {
  const { ai, closeAI } = useAppState();
  const store = useStore();
  const client = ai.contextClientId ? store.clientById(ai.contextClientId) : null;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!ai.open) return;
    setMessages([
      {
        id: newId(),
        role: "assistant",
        body: client
          ? `I've loaded the full handoff history for ${client.name}. I can summarize risk, identify blockers, draft client emails, or surface scope ambiguities. What would you like?`
          : "Hi — ask me anything about your onboarding queue. I can summarize risk across the team, identify the most stuck deals, draft client follow-ups, or recommend where to focus this week.",
        meta: client ? `Context: ${client.name}` : "Queue-wide",
      },
    ]);
  }, [ai.open, ai.contextClientId, client]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAI();
    };
    if (ai.open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ai.open, closeAI]);

  const runAction = (a: Action) => {
    const meta = actionMeta[a];
    setMessages((m) => [...m, { id: newId(), role: "user", body: meta.label }]);
    setGenerating(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: newId(),
          role: "assistant",
          body: generateOutput(a, ai.contextClientId, store),
          meta: client ? `${meta.chip} · ${client.name}` : meta.chip,
        },
      ]);
      setGenerating(false);
    }, 700);
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((m) => [...m, { id: newId(), role: "user", body: text }]);
    setInput("");
    setGenerating(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: newId(),
          role: "assistant",
          body: client
            ? `Working from ${client.name} context: ${client.recommendedAction}. ${client.aiSummary}`
            : `Across active onboardings, the highest-leverage focus this week is the 3 stuck enterprise deals — together about $274k. Want me to draft a touch for each?`,
          meta: client ? `Reply · ${client.name}` : "Reply",
        },
      ]);
      setGenerating(false);
    }, 700);
  };

  const suggested = useMemo(
    () =>
      [...store.clients]
        .filter(
          (c) => c.health === "at_risk" || c.health === "internal_blocked",
        )
        .slice(0, 3),
    [store.clients],
  );

  if (!ai.open) return null;

  return (
    <>
      <div
        onClick={closeAI}
        className="fixed inset-0 bg-ink-900/30 backdrop-blur-sm z-40"
      />
      <aside className="fixed top-0 right-0 h-screen w-full sm:w-[480px] bg-white shadow-drawer z-50 flex flex-col">
        <div className="px-5 pt-4 pb-3 border-b border-ink-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-brand-700 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </span>
              <div>
                <div className="text-[13px] font-semibold text-ink-900 leading-tight">
                  Onboarding AI
                </div>
                <div className="text-[11px] text-ink-500">
                  {client
                    ? `Context: ${client.name} · ${fmtMoney(client.contractValue)}`
                    : "Queue-wide context"}
                </div>
              </div>
            </div>
            <button
              onClick={closeAI}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-ink-100 text-ink-500"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-5 py-3 border-b border-ink-200">
          <div className="h-eyebrow mb-2">Quick actions</div>
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.keys(actionMeta) as Action[]).map((a) => {
              const meta = actionMeta[a];
              const Icon = meta.icon;
              return (
                <button
                  key={a}
                  onClick={() => runAction(a)}
                  className="flex items-center gap-2 text-left px-2.5 py-2 rounded-lg border border-ink-200 hover:border-brand-300 hover:bg-brand-50/40 transition-colors text-[12px]"
                >
                  <Icon className="h-3.5 w-3.5 text-brand-600" />
                  <span className="text-ink-800 font-medium leading-tight">
                    {meta.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-ink-50/40">
          {messages.map((m) => (
            <Bubble key={m.id} msg={m} />
          ))}
          {generating && (
            <div className="flex items-start gap-2.5">
              <span className="h-7 w-7 rounded-md bg-brand-700 flex items-center justify-center shrink-0">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </span>
              <div className="bg-white border border-ink-200 rounded-xl rounded-tl-sm px-3 py-2 flex items-center gap-1">
                <Dot />
                <Dot delay={120} />
                <Dot delay={240} />
              </div>
            </div>
          )}
          {!client && messages.length <= 1 && suggested.length > 0 && (
            <div>
              <div className="h-eyebrow mb-2">Suggested clients to focus on</div>
              <div className="space-y-1.5">
                {suggested.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white border border-ink-200 hover:border-brand-300 transition-colors text-left"
                  >
                    <Avatar ownerId={c.ownerId} size="xs" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-medium text-ink-900 truncate">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-ink-500 truncate">
                        {c.recommendedAction}
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-ink-700">
                      {fmtMoney(c.contractValue)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={send}
          className="px-5 pt-3 pb-4 border-t border-ink-200 bg-white"
        >
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(e);
                }
              }}
              rows={2}
              placeholder={
                client
                  ? `Ask about ${client.name}…`
                  : "Ask about your onboarding queue…"
              }
              className="w-full resize-none rounded-lg border border-ink-200 bg-white px-3 py-2 pr-10 text-[13px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-300"
            />
            <button
              type="submit"
              className="absolute right-1.5 bottom-1.5 h-7 w-7 inline-flex items-center justify-center rounded-md bg-brand-600 hover:bg-brand-700 text-white"
              aria-label="Send"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-ink-400">
            <span>Demo assistant · responses are simulated</span>
            <span>⏎ to send · ⇧⏎ for newline</span>
          </div>
        </form>
      </aside>
    </>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const [copied, setCopied] = useState(false);
  if (msg.role === "user") {
    return (
      <div className="flex items-start justify-end">
        <div className="max-w-[85%] bg-brand-700 text-white rounded-xl rounded-tr-sm px-3 py-2 text-[13px] shadow-sm">
          {msg.body}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2.5">
      <span className="h-7 w-7 rounded-md bg-brand-700 flex items-center justify-center shrink-0">
        <Sparkles className="h-3.5 w-3.5 text-white" />
      </span>
      <div className="max-w-[88%] flex-1">
        {msg.meta && (
          <div className="text-[10.5px] font-semibold text-brand-700 uppercase tracking-wider mb-1">
            {msg.meta}
          </div>
        )}
        <div className="bg-white border border-ink-200 rounded-xl rounded-tl-sm px-3 py-2 text-[13px] text-ink-800 whitespace-pre-wrap leading-relaxed">
          {msg.body}
        </div>
        <div className="mt-1 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(msg.body);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
            className="text-[11px] inline-flex items-center gap-1 text-ink-500 hover:text-ink-800"
          >
            {copied ? (
              <Check className="h-3 w-3 text-success-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            className="text-[11px] text-ink-500 hover:text-ink-800"
          >
            Insert into email
          </button>
        </div>
      </div>
    </div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full bg-ink-300 animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
