import { teamById } from "../../data/team";
import { initials } from "../../lib/format";

type Props = {
  name?: string;
  ownerId?: string;
  size?: "xs" | "sm" | "md" | "lg";
  ring?: boolean;
};

const sizeClass = {
  xs: "h-5 w-5 text-[9px]",
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

export function Avatar({ name, ownerId, size = "md", ring }: Props) {
  const t = ownerId ? teamById[ownerId] : undefined;
  const display = t?.name ?? name ?? "?";
  const color = t?.avatarColor ?? "#5e6878";
  const init = t?.initials ?? initials(display);
  return (
    <span
      title={display}
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0 ${sizeClass[size]} ${
        ring ? "ring-2 ring-white" : ""
      }`}
      style={{ backgroundColor: color }}
    >
      {init}
    </span>
  );
}

export function AvatarStack({
  ownerIds,
  size = "sm",
  max = 4,
}: {
  ownerIds: string[];
  size?: "xs" | "sm" | "md";
  max?: number;
}) {
  const visible = ownerIds.slice(0, max);
  const overflow = ownerIds.length - visible.length;
  return (
    <div className="flex -space-x-1.5">
      {visible.map((id) => (
        <Avatar key={id} ownerId={id} size={size} ring />
      ))}
      {overflow > 0 && (
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-ink-100 text-ink-600 text-[10px] font-semibold ring-2 ring-white">
          +{overflow}
        </span>
      )}
    </div>
  );
}
