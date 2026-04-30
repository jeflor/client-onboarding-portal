import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { ClientDrawer } from "../client/ClientDrawer";
import { AIAssistantPanel } from "../ai/AIAssistantPanel";
import { QuickLogModal } from "../quicklog/QuickLogModal";
import { FloatingActionButton } from "../quicklog/FloatingActionButton";

export function AppShell() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-ink-50 text-ink-700">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
      <ClientDrawer />
      <AIAssistantPanel />
      <QuickLogModal />
      <FloatingActionButton />
    </div>
  );
}
