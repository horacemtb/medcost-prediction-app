import { useEffect, useState } from "react";
import { medcostApi } from "../shared/api/medcost-api";
import { AppToaster } from "../shared/ui/kit";
import { GlobalPatientSearch } from "../features/global-patient-search/ui/GlobalPatientSearch";
import { SideNavigation } from "../widgets/side-navigation/ui/SideNavigation";
import { PredictionDetailsProvider } from "../widgets/prediction-details";
import { AppRoutes } from "./router/AppRoutes";
import { AppShellContent } from "./layout/AppShellContent";
import { AppShellGrid } from "./layout/AppShellGrid";
import { useSidebarCollapsed } from "./model/useSidebarCollapsed";

export default function App() {
  const [status, setStatus] = useState("...");
  const { sidebarCollapsed, toggleSidebarCollapsed } = useSidebarCollapsed();

  useEffect(() => {
    medcostApi
      .health()
      .then((response) => setStatus(response.status))
      .catch(() => setStatus("недоступен"));
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f6f8fd] text-txt">
      <PredictionDetailsProvider>
        <AppToaster />
        <AppShellGrid>
          <SideNavigation
            collapsed={sidebarCollapsed}
            onToggle={toggleSidebarCollapsed}
          />
          <AppShellContent sidebarCollapsed={sidebarCollapsed}>
            <header className="flex h-[78px] items-center justify-between gap-4 border-b border-[#e8ecf4] bg-white px-8">
              <GlobalPatientSearch />
            </header>
            <main className="scroll-transparent h-[calc(100vh-78px)] overflow-auto px-8 py-6">
              <AppRoutes status={status} />
            </main>
          </AppShellContent>
        </AppShellGrid>
      </PredictionDetailsProvider>
    </div>
  );
}
