import { useMemo, useState } from "react";
import {
  HandHeart,
  CalendarPlus,
  CalendarCheck,
  Upload,
  AlertOctagon,
  Stamp,
  CheckCircle2,
  Wrench,
  ArrowRightLeft,
  StickyNote,
  Mail,
  Rocket,
  ShieldCheck,
  Filter,
  Search,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { useStore } from "../state/DataStore";
import { useAppState } from "../state/AppState";
import { teamById } from "../data/team";
import { Avatar } from "../components/ui/Avatar";
import { Card } from "../components/ui/Card";
import { fmtTime, fmtDate, relativeTime } from "../lib/format";
import type { ActivityKind } from "../data/types";

const iconFor: Record<
  ActivityKind,
  { Icon: ComponentType<SVGProps<SVGSVGElement>>; tone: string; label: string }
> = {
  deal_handed_off: {
    Icon: HandHeart,
    tone: "bg-brand-50 text-brand-700",
    label: "Handoff",
  },
  onboarding_created: { Icon: CalendarPlus, tone: "bg-brand-50 text-brand-700", label: "Created" },
  kickoff_scheduled: {
    Icon: CalendarPlus,
    tone: "bg-brand-50 text-brand-700",
    label: "Kickoff scheduled",
  },
  kickoff_held: { Icon: CalendarCheck, tone: "bg-success-50 text-success-700", label: "Kickoff held" },
  asset_uploaded: { Icon: Upload, tone: "bg-success-50 text-success-700", label: "Asset" },
  blocker_set: { Icon: AlertOctagon, tone: "bg-warning-50 text-warning-700", label: "Blocker" },
  blocker_cleared: { Icon: CheckCircle2, tone: "bg-success-50 text-success-700", label: "Blocker cleared" },
  approval_requested: { Icon: Stamp, tone: "bg-ink-100 text-ink-700", label: "Approval" },
  approval_granted: { Icon: ShieldCheck, tone: "bg-success-50 text-success-700", label: "Approval granted" },
  requirements_submitted: { Icon: Upload, tone: "bg-success-50 text-success-700", label: "Requirements" },
  implementation_started: { Icon: Wrench, tone: "bg-brand-50 text-brand-700", label: "Implementation" },
  stage_change: { Icon: ArrowRightLeft, tone: "bg-brand-50 text-brand-700", label: "Stage change" },
  internal_note: { Icon: StickyNote, tone: "bg-ink-100 text-ink-600", label: "Note" },
  client_email: { Icon: Mail, tone: "bg-success-50 text-success-700", label: "Client email" },
  task_completed: { Icon: CheckCircle2, tone: "bg-success-50 text-success-700", label: "Task" },
  go_live: { Icon: Rocket, tone: "bg-brand-50 text-brand-700", label: "Go live" },
  transitioned: { Icon: HandHeart, tone: "bg-success-50 text-success-700", label: "Transitioned" },
};

const kindFilters: Array<{ id: "all" | ActivityKind; label: string }> = [
  { id: "all", label: "All" },
  { id: "deal_handed_off", label: "Handoffs" },
  { id: "kickoff_scheduled", label: "Kickoffs" },
  { id: "blocker_set", label: "Blockers" },
  { id: "approval_granted", label: "Approvals" },
  { id: "stage_change", label: "Stage changes" },
  { id: "go_live", label: "Go-lives" },
];

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date(today.getTime() - 86400000);
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yest)) return "Yesterday";
  return fmtDate(iso);
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function TimelinePage() {
  const store = useStore();
  const { openClient } = useAppState();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | ActivityKind>("all");

  const clientsById = useMemo(
    () => Object.fromEntries(store.clients.map((c) => [c.id, c])),
    [store.clients],
  );

  const filtered = store.activities
    .filter((a) => (filter === "all" ? true : a.kind === filter))
    .filter((a) => {
      if (!query) return true;
      const c = clientsById[a.clientId];
      return `${a.summary} ${a.detail ?? ""} ${c?.name ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase());
    })
    .sort((a, b) => (a.at < b.at ? 1 : -1));

  const groups: Record<string, typeof filtered> = {};
  for (const a of filtered) {
    const k = dayLabel(a.at);
    (groups[k] ||= []).push(a);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">
            Timeline
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">
            Live event stream — handoffs, blockers, stage changes, approvals,
            go-lives.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search timeline…"
              className="pl-8 pr-3 h-8 text-sm rounded-lg bg-white border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-400/40 w-56"
            />
          </div>
          <button className="btn-secondary" type="button">
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {kindFilters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-2.5 py-1 rounded-md text-[12px] font-medium ${
              filter === f.id
                ? "bg-ink-900 text-white"
                : "bg-white border border-ink-200 text-ink-700 hover:bg-ink-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        {Object.entries(groups).map(([day, items]) => (
          <section key={day} className="mb-6 last:mb-0">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 mb-2">
              {day}
            </h3>
            <ol className="space-y-3">
              {items.map((a) => {
                const cfg = iconFor[a.kind];
                const c = clientsById[a.clientId];
                const owner = teamById[a.ownerId];
                return (
                  <li
                    key={a.id}
                    className="flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-ink-50/40 cursor-pointer"
                    onClick={() => c && openClient(c.id)}
                  >
                    <span
                      className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${cfg.tone}`}
                    >
                      <cfg.Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-ink-900">
                        {a.summary}
                      </div>
                      {a.detail && (
                        <p className="text-[12px] text-ink-500 mt-0.5">
                          {a.detail}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-400 flex-wrap">
                        {owner && (
                          <>
                            <Avatar ownerId={owner.id} size="xs" />
                            <span className="font-medium text-ink-600">
                              {owner.name}
                            </span>
                          </>
                        )}
                        {c && (
                          <>
                            <span>·</span>
                            <span>{c.name}</span>
                          </>
                        )}
                        <span>·</span>
                        <span>{cfg.label}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-ink-400 whitespace-nowrap">
                      {fmtTime(a.at)} · {relativeTime(a.at)}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-ink-500">
            No activity matches.
          </div>
        )}
      </Card>
    </div>
  );
}
