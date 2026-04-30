import { Plus, StickyNote, CheckSquare, AlertOctagon, HandHeart } from "lucide-react";
import { useState } from "react";
import { useAppState } from "../../state/AppState";

export function FloatingActionButton() {
  const { openQuickLog } = useAppState();
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-5 right-5 z-30 flex flex-col items-end gap-2">
      {open && (
        <>
          <FabItem
            label="Add note"
            icon={StickyNote}
            onClick={() => {
              openQuickLog({ initialMode: "note" });
              setOpen(false);
            }}
          />
          <FabItem
            label="Client task"
            icon={HandHeart}
            onClick={() => {
              openQuickLog({ initialMode: "client_task" });
              setOpen(false);
            }}
          />
          <FabItem
            label="Internal task"
            icon={CheckSquare}
            onClick={() => {
              openQuickLog({ initialMode: "internal_task" });
              setOpen(false);
            }}
          />
          <FabItem
            label="Add blocker"
            icon={AlertOctagon}
            onClick={() => {
              openQuickLog({ initialMode: "blocker" });
              setOpen(false);
            }}
          />
        </>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`h-12 w-12 rounded-full shadow-pop flex items-center justify-center text-white transition-transform ${
          open ? "rotate-45 bg-ink-900" : "bg-brand-600 hover:bg-brand-700"
        }`}
        title="Quick log (⌘L)"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}

function FabItem({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 bg-white border border-ink-200 shadow-card rounded-full pl-3 pr-3.5 py-1.5 text-[12.5px] font-medium text-ink-700 hover:bg-ink-50"
    >
      <Icon className="h-3.5 w-3.5 text-brand-600" />
      {label}
    </button>
  );
}
