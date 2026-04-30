import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { defaultUserId, teamById } from "../data/team";
import type { Role } from "../data/types";

type AIState = {
  open: boolean;
  contextClientId: string | null;
};

type QuickLogState = {
  open: boolean;
  clientId?: string | null;
  initialMode?: "note" | "client_task" | "internal_task" | "blocker" | "approval";
};

type AppStateValue = {
  role: Role;
  setRole: (r: Role) => void;
  currentUserId: string;
  currentUser: ReturnType<typeof getUser>;
  // Client drawer
  openClientId: string | null;
  openClient: (id: string) => void;
  closeClient: () => void;
  // AI
  ai: AIState;
  openAI: (clientId?: string | null) => void;
  closeAI: () => void;
  // Quick log
  quickLog: QuickLogState;
  openQuickLog: (input?: Partial<QuickLogState>) => void;
  closeQuickLog: () => void;
};

function getUser(role: Role) {
  return teamById[defaultUserId[role]];
}

const Ctx = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("onboarding");
  const [openClientId, setOpenClientId] = useState<string | null>(null);
  const [ai, setAI] = useState<AIState>({ open: false, contextClientId: null });
  const [quickLog, setQuickLog] = useState<QuickLogState>({ open: false });

  const openClient = useCallback((id: string) => setOpenClientId(id), []);
  const closeClient = useCallback(() => setOpenClientId(null), []);
  const openAI = useCallback(
    (clientId: string | null = null) =>
      setAI({ open: true, contextClientId: clientId }),
    [],
  );
  const closeAI = useCallback(() => setAI((s) => ({ ...s, open: false })), []);
  const openQuickLog = useCallback<AppStateValue["openQuickLog"]>(
    (input = {}) =>
      setQuickLog({
        open: true,
        clientId: input.clientId ?? null,
        initialMode: input.initialMode ?? "note",
      }),
    [],
  );
  const closeQuickLog = useCallback(() => setQuickLog({ open: false }), []);

  // ⌘L global
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setQuickLog({ open: true, initialMode: "note" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const currentUserId = defaultUserId[role];
  const value = useMemo<AppStateValue>(
    () => ({
      role,
      setRole,
      currentUserId,
      currentUser: getUser(role),
      openClientId,
      openClient,
      closeClient,
      ai,
      openAI,
      closeAI,
      quickLog,
      openQuickLog,
      closeQuickLog,
    }),
    [
      role,
      currentUserId,
      openClientId,
      openClient,
      closeClient,
      ai,
      openAI,
      closeAI,
      quickLog,
      openQuickLog,
      closeQuickLog,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
