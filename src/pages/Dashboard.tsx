import { useAppState } from "../state/AppState";
import { OnboardingManagerDashboard } from "./dashboards/OnboardingManagerDashboard";
import { SalesDashboard } from "./dashboards/SalesDashboard";
import { ImplementationDashboard } from "./dashboards/ImplementationDashboard";
import { ClientSuccessDashboard } from "./dashboards/ClientSuccessDashboard";

export function DashboardPage() {
  const { role } = useAppState();
  if (role === "sales") return <SalesDashboard />;
  if (role === "implementation") return <ImplementationDashboard />;
  if (role === "success") return <ClientSuccessDashboard />;
  return <OnboardingManagerDashboard />;
}
