import { useStore } from "../state/DataStore";
import { Card } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { team, roleLabel } from "../data/team";
import { fmtMoney } from "../lib/format";
import { Mail, Briefcase, Wrench, Headset, HeartHandshake } from "lucide-react";
import type { Role } from "../data/types";

const roleIcon: Record<Role, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  sales: Briefcase,
  onboarding: Headset,
  implementation: Wrench,
  success: HeartHandshake,
};

export function TeamPage() {
  const store = useStore();

  const groups: Record<Role, typeof team> = {
    sales: [],
    onboarding: [],
    implementation: [],
    success: [],
  };
  for (const t of team) groups[t.role].push(t);

  const loadFor = (memberId: string, role: Role) => {
    const open = store.clients.filter(
      (c) => c.stage !== "live" && c.stage !== "transitioned",
    );
    if (role === "onboarding")
      return open.filter((c) => c.ownerId === memberId);
    if (role === "implementation")
      return open.filter((c) => c.implementerId === memberId);
    if (role === "success")
      return store.clients.filter((c) => c.csmId === memberId);
    if (role === "sales")
      return store.clients.filter((c) => c.salesRepId === memberId);
    return [];
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">
          Team
        </h1>
        <p className="text-sm text-ink-500 mt-0.5">
          {team.length} people across sales, onboarding, implementation, and CS.
        </p>
      </div>

      {(Object.keys(groups) as Role[]).map((role) => {
        const members = groups[role];
        if (members.length === 0) return null;
        const Icon = roleIcon[role];
        return (
          <div key={role}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-4 w-4 text-ink-500" />
              <h2 className="text-[12px] font-semibold uppercase tracking-wider text-ink-500">
                {roleLabel[role]} ({members.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {members.map((m) => {
                const load = loadFor(m.id, role);
                const totalValue = load.reduce(
                  (s, c) => s + c.contractValue,
                  0,
                );
                const atRisk = load.filter(
                  (c) =>
                    c.health === "at_risk" || c.health === "internal_blocked",
                );
                return (
                  <Card key={m.id}>
                    <div className="flex items-center gap-3">
                      <Avatar ownerId={m.id} size="lg" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-ink-900">
                            {m.name}
                          </span>
                          <Badge tone="neutral">{m.title}</Badge>
                        </div>
                        <div className="text-[12px] text-ink-500 inline-flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {m.email}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <Stat label="Active" value={String(load.length)} sub="accounts" />
                      <Stat label="Value" value={fmtMoney(totalValue)} sub="under mgmt" />
                      <Stat
                        label="At risk"
                        value={String(atRisk.length)}
                        sub={atRisk.length > 0 ? "needs attention" : "—"}
                        tone={atRisk.length > 0 ? "warn" : "neutral"}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "neutral" | "warn";
}) {
  return (
    <div
      className={`rounded-lg border ${tone === "warn" ? "border-warning-200 bg-warning-50/40" : "border-ink-200 bg-ink-50/40"} p-2`}
    >
      <div className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold">
        {label}
      </div>
      <div
        className={`mt-0.5 text-sm font-semibold ${tone === "warn" ? "text-warning-700" : "text-ink-900"}`}
      >
        {value}
      </div>
      <div className="text-[10.5px] text-ink-500">{sub}</div>
    </div>
  );
}
