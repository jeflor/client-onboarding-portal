import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { AppStateProvider } from "./state/AppState";
import { DataStoreProvider } from "./state/DataStore";
import { ToasterProvider } from "./state/Toaster";
import { DashboardPage } from "./pages/Dashboard";
import { ClientsPage } from "./pages/Clients";
import { QueuePage } from "./pages/Queue";
import { TasksPage } from "./pages/Tasks";
import { DocumentsPage } from "./pages/Documents";
import { ApprovalsPage } from "./pages/Approvals";
import { TimelinePage } from "./pages/Timeline";
import { TeamPage } from "./pages/Team";
import { SettingsPage } from "./pages/Settings";

function App() {
  return (
    <DataStoreProvider>
      <ToasterProvider>
        <AppStateProvider>
          <HashRouter>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/queue" element={<QueuePage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/approvals" element={<ApprovalsPage />} />
                <Route path="/timeline" element={<TimelinePage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </HashRouter>
        </AppStateProvider>
      </ToasterProvider>
    </DataStoreProvider>
  );
}

export default App;
