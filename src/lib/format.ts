export const fmtMoney = (n: number) => {
  if (n >= 1_000_000)
    return `$${(n / 1_000_000).toFixed(2).replace(/\.00$/, "")}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return `$${n.toLocaleString()}`;
};

export const fmtMoneyFull = (n: number) =>
  `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export const fmtPct = (n: number) => `${Math.round(n)}%`;

export function relativeTime(iso: string, now: Date = new Date()): string {
  const t = new Date(iso).getTime();
  const diff = t - now.getTime();
  const abs = Math.abs(diff);
  const min = 60_000;
  const hr = 60 * min;
  const day = 24 * hr;
  const mo = 30 * day;
  const future = diff > 0;
  let text = "";
  if (abs < min) text = "just now";
  else if (abs < hr) text = `${Math.round(abs / min)}m`;
  else if (abs < day) text = `${Math.round(abs / hr)}h`;
  else if (abs < mo) text = `${Math.round(abs / day)}d`;
  else text = `${Math.round(abs / mo)}mo`;
  if (text === "just now") return text;
  return future ? `in ${text}` : `${text} ago`;
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
