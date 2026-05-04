import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { medcostApi } from "../shared/api/medcost-api";
import { DashboardPage } from "../pages/dashboard/ui/DashboardPage";
import { PredictPage } from "../pages/predict/ui/PredictPage";
import { HistoryPage } from "../pages/history/ui/HistoryPage";
import { FactorsPage } from "../pages/factors/ui/FactorsPage";
import { SettingsPage } from "../pages/settings/ui/SettingsPage";
import { SideNavigation } from "../widgets/side-navigation/ui/SideNavigation";
import { PredictionDetailsProvider } from "../widgets/prediction-details";

type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "app-theme";

export default function App() {
  const [status, setStatus] = useState("...");
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    medcostApi.health().then((x) => setStatus(x.status)).catch(() => setStatus("недоступен"));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-bg text-txt">
      <PredictionDetailsProvider>
        <div className="mx-auto grid min-h-screen w-full max-w-[1440px] grid-cols-1 gap-4 p-4 lg:grid-cols-[88px_minmax(0,1fr)]">
          <SideNavigation />
          <main className="h-[calc(100vh-2rem)] min-h-0 w-full overflow-hidden rounded-3xl border border-line/70 bg-white/5 p-4 shadow-2xl backdrop-blur md:p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/predict" element={<PredictPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/factors" element={<FactorsPage />} />
              <Route path="/settings" element={<SettingsPage status={status} theme={theme} onThemeChange={setTheme} />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </PredictionDetailsProvider>
    </div>
  );
}

