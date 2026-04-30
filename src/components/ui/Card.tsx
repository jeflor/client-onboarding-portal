import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  pad = true,
}: {
  children: ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <div className={`card ${pad ? "card-pad" : ""} ${className}`}>{children}</div>
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
        <h3 className="text-base font-semibold text-ink-900">{title}</h3>
        {description && (
          <p className="text-sm text-ink-500 mt-0.5">{description}</p>
        )}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}
