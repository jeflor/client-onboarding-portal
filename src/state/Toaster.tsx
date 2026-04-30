import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

type ToastTone = "success" | "info" | "warning";
type Toast = {
  id: string;
  body: string;
  tone: ToastTone;
  action?: { label: string; onClick: () => void };
};

type Ctx = {
  push: (input: Omit<Toast, "id">) => void;
  success: (body: string, action?: Toast["action"]) => void;
  info: (body: string, action?: Toast["action"]) => void;
  warning: (body: string, action?: Toast["action"]) => void;
};

const ToastCtx = createContext<Ctx | null>(null);

export function ToasterProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback<Ctx["push"]>(
    (input) => {
      const id = Math.random().toString(36).slice(2, 9);
      setToasts((prev) => [...prev, { id, ...input }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const value: Ctx = {
    push,
    success: (body, action) => push({ body, tone: "success", action }),
    info: (body, action) => push({ body, tone: "info", action }),
    warning: (body, action) => push({ body, tone: "warning", action }),
  };

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-[320px] max-w-[calc(100vw-2rem)]">
        {toasts.map((t) => {
          const Icon =
            t.tone === "success"
              ? CheckCircle2
              : t.tone === "warning"
                ? AlertTriangle
                : Info;
          const ring =
            t.tone === "success"
              ? "ring-success-200"
              : t.tone === "warning"
                ? "ring-warning-200"
                : "ring-ink-200";
          const iconColor =
            t.tone === "success"
              ? "text-success-600"
              : t.tone === "warning"
                ? "text-warning-600"
                : "text-brand-600";
          return (
            <div
              key={t.id}
              className={`pointer-events-auto bg-white border border-ink-200 ring-1 ${ring} shadow-pop rounded-lg px-3 py-2.5 flex items-start gap-2.5`}
            >
              <Icon className={`h-4 w-4 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-[12.5px] text-ink-800">{t.body}</div>
              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    t.action!.onClick();
                    dismiss(t.id);
                  }}
                  className="text-[11.5px] font-semibold text-brand-700 hover:underline"
                >
                  {t.action.label}
                </button>
              )}
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="text-ink-400 hover:text-ink-700"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside ToasterProvider");
  return ctx;
}
