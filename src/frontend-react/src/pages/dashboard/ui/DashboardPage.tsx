import { useEffect, useState } from "react";
import { medcostApi } from "../../../shared/api/medcost-api";
import type { OverviewResponse } from "../../../shared/types/medcost";
import { ExecutiveOverviewWidget } from "../../../widgets/dashboard/ui/ExecutiveOverviewWidget";
import { RiskProfileWidget } from "../../../widgets/dashboard/ui/RiskProfileWidget";
import { PopulationPredictionDriftWidget } from "../../../widgets/dashboard/ui/PopulationPredictionDriftWidget";
import { GenderSegmentationWidget } from "../../../widgets/dashboard/ui/GenderSegmentationWidget";
import { ExplainabilityMonitorWidget } from "../../../widgets/dashboard/ui/ExplainabilityMonitorWidget";

export function DashboardPage() {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    medcostApi
      .overview()
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Не удалось загрузить обзор");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <section className="rounded-3xl border border-[#dfe6f6] bg-white p-6">
        <h1 className="m-0 text-ui-display text-[#13264b]">Дашборд</h1>
        <p className="mt-3 text-ui-sm text-danger">{error}</p>
      </section>
    );
  }

  if (!overview) {
    return (
      <section className="rounded-3xl border border-[#dfe6f6] bg-white p-6">
        <h1 className="m-0 text-ui-display text-[#13264b]">Дашборд</h1>
        <p className="mt-3 text-ui-sm text-muted">Загружаем аналитические данные...</p>
      </section>
    );
  }

  console.log("Overview data:", overview);

  return (
    <section className="grid gap-4">
      <ExecutiveOverviewWidget overview={overview} />
      <div className="grid gap-4 xl:grid-cols-[35%_65%]">
        <RiskProfileWidget overview={overview} />
        <div className="grid gap-4">
          <PopulationPredictionDriftWidget overview={overview} />
          <GenderSegmentationWidget overview={overview} />
        </div>
      </div>
      <ExplainabilityMonitorWidget overview={overview} />
    </section>
  );
}
