import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

type Weight = "low" | "medium" | "high";

const toneFor: Record<Weight, { wrap: string; icon: string }> = {
  low: {
    wrap: "bg-ink-50 text-ink-600 border-ink-200",
    icon: "text-ink-400",
  },
  medium: {
    wrap: "bg-brand-50/60 text-brand-700 border-brand-100",
    icon: "text-brand-600",
  },
  high: {
    wrap: "bg-warning-50/70 text-warning-800 border-warning-100",
    icon: "text-warning-600",
  },
};

export function AIHint({
  weight = "medium",
  children,
}: {
  weight?: Weight;
  children: ReactNode;
}) {
  const t = toneFor[weight];
  return (
    <div
      className={`rounded-md border px-2 py-1 text-[11.5px] inline-flex items-start gap-1.5 leading-snug ${t.wrap}`}
    >
      <Sparkles className={`h-3 w-3 mt-0.5 shrink-0 ${t.icon}`} />
      <span className="font-medium">{children}</span>
    </div>
  );
}

export function AILine({
  weight = "medium",
  children,
}: {
  weight?: Weight;
  children: ReactNode;
}) {
  const color =
    weight === "high"
      ? "text-warning-700"
      : weight === "medium"
        ? "text-brand-700"
        : "text-ink-500";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11.5px] font-medium ${color}`}
    >
      <Sparkles className="h-3 w-3" />
      {children}
    </span>
  );
}
