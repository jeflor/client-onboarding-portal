import {
  Sparkles,
  StickyNote,
  CalendarClock,
  CheckSquare,
  AlertOctagon,
  ShieldAlert,
  MoreHorizontal,
  ArrowRight,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useStore } from "../../state/DataStore";
import { useAppState } from "../../state/AppState";
import { useToast } from "../../state/Toaster";
import type { Client, OnboardingStage } from "../../data/types";
import { ACTIVE_STAGES, STAGES } from "../../data/types";

type Variant = "compact" | "full";

export function InlineActions({
  client,
  variant = "compact",
}: {
  client: Client;
  variant?: Variant;
}) {
  const store = useStore();
  const { currentUserId, openQuickLog, openAI, openClient } = useAppState();
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);

  const stop = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const quickNote = (e: React.MouseEvent) => {
    stop(e);
    openQuickLog({ clientId: client.id, initialMode: "note" });
  };
  const quickClientTask = (e: React.MouseEvent) => {
    stop(e);
    openQuickLog({ clientId: client.id, initialMode: "client_task" });
  };
  const quickInternalTask = (e: React.MouseEvent) => {
    stop(e);
    openQuickLog({ clientId: client.id, initialMode: "internal_task" });
  };
  const quickBlocker = (e: React.MouseEvent) => {
    stop(e);
    openQuickLog({ clientId: client.id, initialMode: "blocker" });
  };
  const aiAssist = (e: React.MouseEvent) => {
    stop(e);
    openAI(client.id);
  };
  const advance = (e: React.MouseEvent, to: OnboardingStage) => {
    stop(e);
    store.changeStage({ clientId: client.id, actorId: currentUserId, to });
    toast.success(`Stage → ${to.replace("_", " ")} · ${client.name}`, {
      label: "Open",
      onClick: () => openClient(client.id),
    });
    setMenuOpen(false);
  };
  const escalate = (e: React.MouseEvent) => {
    stop(e);
    store.escalate({
      clientId: client.id,
      actorId: currentUserId,
      reason: client.recommendedAction,
    });
    toast.success(`Escalated · ${client.name}`);
    setMenuOpen(false);
  };
  const pushLive = (e: React.MouseEvent, days: number) => {
    stop(e);
    store.pushGoLive({
      clientId: client.id,
      actorId: currentUserId,
      days,
    });
    toast.warning(`Go-live ${days >= 0 ? "+" : ""}${days}d · ${client.name}`);
    setMenuOpen(false);
  };

  const currentIdx = ACTIVE_STAGES.indexOf(client.stage);
  const nextStage =
    currentIdx >= 0 && currentIdx < ACTIVE_STAGES.length - 1
      ? ACTIVE_STAGES[currentIdx + 1]
      : null;

  if (variant === "compact") {
    return (
      <div className="inline-flex items-center gap-0.5">
        <IconButton
          title="Add note"
          onClick={quickNote}
          icon={StickyNote}
        />
        <IconButton
          title="Client task"
          onClick={quickClientTask}
          icon={CheckSquare}
        />
        <IconButton
          title="Add blocker"
          onClick={quickBlocker}
          icon={AlertOctagon}
          tone="warn"
        />
        <IconButton
          title="AI assist"
          onClick={aiAssist}
          icon={Sparkles}
          tone="brand"
        />
        <div className="relative">
          <IconButton
            title="More"
            onClick={(e) => {
              stop(e);
              setMenuOpen((v) => !v);
            }}
            icon={MoreHorizontal}
          />
          {menuOpen && (
            <div
              onClick={stop}
              className="absolute right-0 mt-1 w-56 bg-white border border-ink-200 rounded-lg shadow-pop z-30 py-1"
            >
              {nextStage && (
                <MenuItem
                  icon={ArrowRight}
                  onClick={(e) => advance(e, nextStage)}
                >
                  Advance to {STAGES.find((s) => s.id === nextStage)?.short}
                </MenuItem>
              )}
              <MenuItem icon={CheckSquare} onClick={quickInternalTask}>
                Internal task
              </MenuItem>
              <MenuItem
                icon={CalendarClock}
                onClick={(e) => pushLive(e, 7)}
              >
                Push go-live +7d
              </MenuItem>
              <div className="my-1 border-t border-ink-100" />
              <MenuItem
                icon={ShieldAlert}
                onClick={escalate}
                tone="danger"
              >
                Escalate to manager
              </MenuItem>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <FullButton onClick={quickNote} icon={StickyNote}>
        Note
      </FullButton>
      <FullButton onClick={quickClientTask} icon={CheckSquare}>
        Client task
      </FullButton>
      <FullButton onClick={quickInternalTask} icon={CheckSquare}>
        Internal task
      </FullButton>
      <FullButton onClick={quickBlocker} icon={AlertOctagon} tone="warning">
        Blocker
      </FullButton>
      {nextStage && (
        <FullButton onClick={(e) => advance(e, nextStage)} icon={ArrowRight}>
          Advance stage
        </FullButton>
      )}
      <FullButton onClick={escalate} icon={ShieldAlert} tone="danger">
        Escalate
      </FullButton>
      <FullButton onClick={aiAssist} icon={Sparkles} tone="brand">
        AI
      </FullButton>
    </div>
  );
}

function IconButton({
  icon: Icon,
  title,
  onClick,
  tone,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  onClick: (e: React.MouseEvent) => void;
  tone?: "brand" | "warn";
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-ink-100 transition-colors ${
        tone === "brand"
          ? "text-brand-600"
          : tone === "warn"
            ? "text-warning-600"
            : "text-ink-500"
      } hover:text-ink-900`}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function FullButton({
  icon: Icon,
  children,
  onClick,
  tone,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: ReactNode;
  onClick: (e: React.MouseEvent) => void;
  tone?: "brand" | "warning" | "danger";
}) {
  const toneClass =
    tone === "brand"
      ? "text-brand-700 border-brand-200 hover:bg-brand-50"
      : tone === "warning"
        ? "text-warning-700 border-warning-200 hover:bg-warning-50"
        : tone === "danger"
          ? "text-danger-700 border-danger-200 hover:bg-danger-50"
          : "text-ink-700 border-ink-200 hover:bg-ink-50";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11.5px] font-medium border bg-white ${toneClass}`}
    >
      <Icon className="h-3 w-3" />
      {children}
    </button>
  );
}

function MenuItem({
  icon: Icon,
  children,
  onClick,
  tone,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: ReactNode;
  onClick: (e: React.MouseEvent) => void;
  tone?: "danger";
}) {
  const toneClass =
    tone === "danger" ? "text-danger-700" : "text-ink-700";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 text-[12.5px] hover:bg-ink-50 ${toneClass}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}
