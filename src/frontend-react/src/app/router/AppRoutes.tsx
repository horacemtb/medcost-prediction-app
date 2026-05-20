import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoadingState } from "../../shared/ui/kit";

const DashboardPage = lazy(() => import("../../pages/dashboard/ui/DashboardPage"));
const PredictPage = lazy(() => import("../../pages/predict/ui/PredictPage"));
const HistoryPage = lazy(() => import("../../pages/history/ui/HistoryPage"));
const FactorsPage = lazy(() => import("../../pages/factors/ui/FactorsPage"));
const SettingsPage = lazy(() => import("../../pages/settings/ui/SettingsPage"));

type AppRoutesProps = {
  status: string;
};

export function AppRoutes({ status }: AppRoutesProps) {
  return (
    <Suspense fallback={<LoadingState label="Загрузка раздела..." />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/predict" element={<PredictPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/factors" element={<FactorsPage />} />
        <Route path="/settings" element={<SettingsPage status={status} />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
