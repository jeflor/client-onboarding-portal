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
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Card, CardHeader } from "../ui/Card";
import { Avatar } from "../ui/Avatar";
import { useStore } from "../../state/DataStore";
import { useAppState } from "../../state/AppState";
import { teamById } from "../../data/team";
import { relativeTime } from "../../lib/format";
import type { ActivityKind } from "../../data/types";

const iconFor: Record<
  ActivityKind,
  { Icon: ComponentType<SVGProps<SVGSVGElement>>; tone: string }
> = {
  deal_handed_off: {
    Icon: HandHeart,
    tone: "bg-brand-50 text-brand-700",
  },
  onboarding_created: {
    Icon: CalendarPlus,
    tone: "bg-brand-50 text-brand-700",
  },
  kickoff_scheduled: {
    Icon: CalendarPlus,
    tone: "bg-brand-50 text-brand-700",
  },
  kickoff_held: {
    Icon: CalendarCheck,
    tone: "bg-success-50 text-success-700",
  },
  asset_uploaded: { Icon: Upload, tone: "bg-success-50 text-success-700" },
  blocker_set: {
    Icon: AlertOctagon,
    tone: "bg-warning-50 text-warning-700",
  },
  blocker_cleared: {
    Icon: CheckCircle2,
    tone: "bg-success-50 text-success-700",
  },
  approval_requested: { Icon: Stamp, tone: "bg-ink-100 text-ink-700" },
  approval_granted: {
    Icon: ShieldCheck,
    tone: "bg-success-50 text-success-700",
  },
  requirements_submitted: {
    Icon: Upload,
    tone: "bg-success-50 text-success-700",
  },
  implementation_started: {
    Icon: Wrench,
    tone: "bg-brand-50 text-brand-700",
  },
  stage_change: {
    Icon: ArrowRightLeft,
    tone: "bg-brand-50 text-brand-700",
  },
  internal_note: {
    Icon: StickyNote,
    tone: "bg-ink-100 text-ink-600",
  },
  client_email: { Icon: Mail, tone: "bg-success-50 text-success-700" },
  task_completed: {
    Icon: CheckCircle2,
    tone: "bg-success-50 text-success-700",
  },
  go_live: { Icon: Rocket, tone: "bg-brand-50 text-brand-700" },
  transitioned: {
    Icon: HandHeart,
    tone: "bg-success-50 text-success-700",
  },
};

export function HandoffTimeline({ limit = 10 }: { limit?: number }) {
  const store = useStore();
  const { openClient } = useAppState();
  const clientsById = Object.fromEntries(
    store.clients.map((c) => [c.id, c]),
  );
  const sorted = [...store.activities]
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, limit);

  return (
    <Card>
      <CardHeader
        eyebrow="Handoff activity"
        title="Live event stream"
        description="Internal handoffs, blockers, approvals, and stage changes."
        right={
          <button className="btn-ghost text-[12px]" type="button">
            Open feed
          </button>
        }
      />
      <ol className="space-y-3.5">
        {sorted.map((a) => {
          const cfg = iconFor[a.kind];
          const client = clientsById[a.clientId];
          const owner = teamById[a.ownerId];
          return (
            <li key={a.id} className="relative pl-9">
              <span
                className={`absolute left-0 top-0.5 h-7 w-7 rounded-full flex items-center justify-center ${cfg.tone}`}
              >
                <cfg.Icon className="h-3.5 w-3.5" />
              </span>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => client && openClient(client.id)}
                    className="text-[13px] font-medium text-ink-900 hover:underline text-left"
                  >
                    {a.summary}
                  </button>
                  {a.detail && (
                    <p className="text-[12px] text-ink-500 mt-0.5">
                      {a.detail}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-400">
                    {owner && <Avatar ownerId={owner.id} size="xs" />}
                    {owner && (
                      <span className="font-medium text-ink-600">
                        {owner.name.split(" ")[0]}
                      </span>
                    )}
                    {client && (
                      <>
                        <span>·</span>
                        <span>{client.name}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-ink-400 whitespace-nowrap pt-0.5">
                  {relativeTime(a.at)}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
