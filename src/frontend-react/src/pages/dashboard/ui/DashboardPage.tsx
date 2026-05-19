import { useEffect, useState } from "react";
import { medcostApi } from "../../../shared/api/medcost-api";
import type { OverviewResponse } from "../../../shared/types/medcost";
import { KitLoader } from "../../../shared/ui/kit";
import { ExecutiveOverviewWidget } from "../../../widgets/dashboard/ui/ExecutiveOverviewWidget";
import { RiskProfileWidget } from "../../../widgets/dashboard/ui/RiskProfileWidget";
import { PopulationPredictionDriftWidget } from "../../../widgets/dashboard/ui/PopulationPredictionDriftWidget";
import { GenderSegmentationWidget } from "../../../widgets/dashboard/ui/GenderSegmentationWidget";
import { ExplainabilityMonitorWidget } from "../../../widgets/dashboard/ui/ExplainabilityMonitorWidget";

export function DashboardPage() {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [error, setError] = useState("");
  const pageHeader = (
    <div className="space-y-2">
      <h1 className="m-0 text-ui-display text-[#13264b]">Статистика</h1>
      <p className="m-0 max-w-3xl text-ui-sm text-muted">
        Сводные показатели по историческим данным и прогнозам: объемы,
        средние значения и распределение расходов по диапазонам.
      </p>
    </div>
  );

  useEffect(() => {
    let cancelled = false;

    medcostApi
      .overview()
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Не удалось загрузить обзор",
          );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <section className="flex h-full min-h-0 flex-col gap-4">
        {pageHeader}
        <div className="flex-1 min-h-0 overflow-auto pr-1">
          <div className="rounded-3xl border border-[#dfe6f6] bg-white p-6">
            <p className="text-ui-sm text-danger">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!overview) {
    return (
      <section className="flex h-full min-h-0 flex-col gap-4">
        {pageHeader}
        <div className="flex-1 min-h-0 overflow-auto pr-1">
          <div className="tile relative min-h-[220px] w-full rounded-3xl border border-line/70 bg-white/70 p-5">
            <div
              className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[2px]"
              role="status"
              aria-live="polite"
              aria-busy="true"
            >
              <div className="loading-card">
                <KitLoader label="Загрузка статистики..." />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  console.log("Overview data:", overview);

  return (
    <section className="flex h-full min-h-0 flex-col gap-4">
      {pageHeader}
      <div className="scroll-transparent flex-1 min-h-0 overflow-auto pr-1">
        <div className="grid gap-4">
          <ExecutiveOverviewWidget overview={overview} />
          <div className="grid gap-4 min-[1200px]:grid-cols-[35fr_65fr]">
            <RiskProfileWidget overview={overview} />
            <div className="grid min-w-0 gap-4">
              <PopulationPredictionDriftWidget overview={overview} />
              <GenderSegmentationWidget overview={overview} />
            </div>
          </div>
          <ExplainabilityMonitorWidget overview={overview} />
        </div>
      </div>
    </section>
  );
}
