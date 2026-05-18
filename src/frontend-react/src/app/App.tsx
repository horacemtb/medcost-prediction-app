import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { medcostApi } from "../shared/api/medcost-api";
import { DashboardPage } from "../pages/dashboard/ui/DashboardPage";
import { PredictPage } from "../pages/predict/ui/PredictPage";
import { HistoryPage } from "../pages/history/ui/HistoryPage";
import { FactorsPage } from "../pages/factors/ui/FactorsPage";
import { SettingsPage } from "../pages/settings/ui/SettingsPage";
import { SideNavigation } from "../widgets/side-navigation/ui/SideNavigation";
import { PredictionDetailsProvider } from "../widgets/prediction-details";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("...");
  const [globalSearch, setGlobalSearch] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("sidebar-collapsed") === "1";
  });

  useEffect(() => {
    medcostApi
      .health()
      .then((x) => setStatus(x.status))
      .catch(() => setStatus("недоступен"));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("sidebar-collapsed", sidebarCollapsed ? "1" : "0");
  }, [sidebarCollapsed]);

  const handleGlobalSearch = useCallback(async () => {
    const query = globalSearch.trim();
    if (!query) return;

    if (/^\d+$/.test(query)) {
      try {
        const id = Number(query);
        const details = await medcostApi.prediction(id);
        navigate("/predict", { state: { prefillDetails: details, openReport: true } });
      } catch {
        navigate(`/history?search=${encodeURIComponent(query)}`);
      }
      return;
    }

    navigate(`/history?search=${encodeURIComponent(query)}`);
  }, [globalSearch, navigate]);

  const handleClearSearch = useCallback(() => {
    setGlobalSearch("");

    if (location.pathname.startsWith("/history")) {
      navigate("/history");
      return;
    }

    if (location.pathname.startsWith("/predict")) {
      navigate("/predict", { state: { forceNew: true } });
    }
  }, [location.pathname, navigate]);

  const shellStyle = {
    "--sidebar-width": "292px",
  } as CSSProperties;

  return (
    <div className="min-h-screen bg-[#f6f8fd] text-txt">
      <PredictionDetailsProvider>
        <div
          className="grid min-h-screen w-full grid-cols-1 gap-0 transition-[grid-template-columns] duration-300 ease-in-out md:[grid-template-columns:var(--sidebar-width)_minmax(0,1fr)]"
          style={shellStyle}
        >
          <SideNavigation
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((value) => !value)}
          />
          <div
            className={[
              "relative z-10 min-w-0 border-l border-[#e8ecf4] bg-[#f6f8fd] transition-[margin-left,width] duration-300 ease-in-out",
              sidebarCollapsed ? "md:-ml-[196px] md:w-[calc(100%+196px)]" : "",
            ].join(" ")}
          >
            <header className="flex h-[78px] items-center justify-between gap-4 border-b border-[#e8ecf4] bg-white px-8">
              <div className="flex h-11 w-full max-w-[680px] items-center rounded-2xl bg-[#f1f4fa] px-4">
                <Search className="mr-3 size-5 text-[#74839b]" />
                <input
                  className="w-full bg-transparent text-ui-sm text-[#30425f] outline-none placeholder:text-[#74839b]"
                  placeholder="Поиск по имени или ID пациента"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      void handleGlobalSearch();
                    }
                  }}
                />
                {globalSearch.trim() ? (
                  <button
                    type="button"
                    className="ml-2 inline-flex size-7 items-center justify-center rounded-full text-[#74839b] transition hover:bg-[#e5ebf5] hover:text-[#30425f]"
                    onClick={handleClearSearch}
                    aria-label="Очистить поиск"
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
              </div>
            </header>
            <main className="h-[calc(100vh-78px)] overflow-auto px-8 py-6">
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
      </PredictionDetailsProvider>
    </div>
  );
}
