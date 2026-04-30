import type { ReactNode } from "react";
import type { Health } from "../../data/types";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "accent";

const toneClass: Record<Tone, string> = {
  neutral: "badge-neutral",
  brand: "badge-brand",
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
  accent: "badge-accent",
};

export function Badge({
  tone = "neutral",
  children,
  dot,
}: {
  tone?: Tone;
  children: ReactNode;
  dot?: boolean;
}) {
  return (
    <span className={toneClass[tone]}>
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            tone === "success"
              ? "bg-success-500"
              : tone === "warning"
                ? "bg-warning-500"
                : tone === "danger"
                  ? "bg-danger-500"
                  : tone === "accent"
                    ? "bg-accent-500"
                    : tone === "brand"
                      ? "bg-brand-500"
                      : "bg-ink-400"
          }`}
        />
      )}
      {children}
    </span>
  );
}

const healthMap: Record<Health, { tone: Tone; label: string }> = {
  on_track: { tone: "success", label: "On Track" },
  waiting_client: { tone: "accent", label: "Waiting on Client" },
  internal_blocked: { tone: "warning", label: "Internal Blocked" },
  at_risk: { tone: "danger", label: "At Risk" },
  ready_for_launch: { tone: "brand", label: "Ready for Launch" },
};

export function HealthBadge({ health }: { health: Health }) {
  const m = healthMap[health];
  return (
    <Badge tone={m.tone} dot>
      {m.label}
    </Badge>
  );
}
