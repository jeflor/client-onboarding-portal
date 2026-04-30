import type { ReactNode } from "react";

type Accent = "brand" | "warning" | "danger" | "success" | "orange" | "none";

export function Card({
  children,
  className = "",
  pad = true,
  accent = "none",
}: {
  children: ReactNode;
  className?: string;
  pad?: boolean;
  accent?: Accent;
}) {
  const accentClass =
    accent === "brand"
      ? "card-accent"
      : accent === "warning"
        ? "card-accent-warning"
        : accent === "danger"
          ? "card-accent-danger"
          : accent === "success"
            ? "card-accent-success"
            : accent === "orange"
              ? "card-accent-orange"
              : "card";
  return (
    <div className={`${accentClass} ${pad ? "card-pad" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  eyebrow,
  right,
  description,
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  right?: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        {eyebrow && <div className="h-eyebrow mb-1">{eyebrow}</div>}
        <h3 className="text-base font-semibold text-ink-900 display tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-ink-500 mt-0.5">{description}</p>
        )}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}
