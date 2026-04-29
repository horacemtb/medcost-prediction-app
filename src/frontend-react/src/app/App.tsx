import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { medcostApi } from "../shared/api/medcost-api";
import { DashboardPage } from "../pages/dashboard/ui/DashboardPage";
import { PredictPage } from "../pages/predict/ui/PredictPage";
import { HistoryPage } from "../pages/history/ui/HistoryPage";
import { FactorsPage } from "../pages/factors/ui/FactorsPage";
import { SettingsPage } from "../pages/settings/ui/SettingsPage";
import { SideNavigation } from "../widgets/side-navigation/ui/SideNavigation";

export default function App() {
  const [status, setStatus] = useState("...");

  useEffect(() => {
    medcostApi.health().then((x) => setStatus(x.status)).catch(() => setStatus("недоступен"));
  }, []);

  return (
    <div className="scene">
      <div className="app-shell">
        <SideNavigation />
        <main className="dashboard-glass">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/predict" element={<PredictPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/factors" element={<FactorsPage />} />
            <Route path="/settings" element={<SettingsPage status={status} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
