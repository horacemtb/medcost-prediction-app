import { useMemo } from "react";
import { featureMap } from "../../../shared/config/feature-map";
import { KitButton, KitFieldLabel, KitLoader } from "../../../shared/ui/kit";
import { useMinimumLoading } from "../../../shared/lib/useMinimumLoading";
import { usePredictionDetails } from "../model/PredictionDetailsContext";
import type { PredictionDetailsResponse } from "../../../shared/types/medcost";
import {
  deriveRiskLevel,
  formatActivity,
  formatCity,
  formatDate,
  formatGender,
  formatMoney,
  getChronicCount,
  sortRiskFactors,
} from "../model/prediction-details-helpers";
import closeIcon from "../../../shared/assets/close.svg";
import { PredictionDetailsActionsDropdown } from "./PredictionDetailsActionsDropdown";

type PredictionDetailsWidgetProps = {
  hideCloseButton?: boolean;
  hideActionsDropdown?: boolean;
  onRecalculate?: (details: PredictionDetailsResponse) => void;
  onDelete?: (details: PredictionDetailsResponse) => void;
  onExport?: (details: PredictionDetailsResponse) => void;
};

export function PredictionDetailsWidget({
  hideCloseButton = false,
  hideActionsDropdown = false,
  onRecalculate,
  onDelete,
  onExport,
}: PredictionDetailsWidgetProps) {
  const {
    open,
    details,
    loading,
    error,
    closePredictionDetails,
    retryPredictionDetails,
  } = usePredictionDetails();
  const visibleLoading = useMinimumLoading(loading, { minMs: 1000 });
  const showWidget =
    open || visibleLoading || Boolean(details) || Boolean(error);

  const sortedFactors = useMemo(
    () => (details ? sortRiskFactors(details) : []),
    [details],
  );

  const predictedCost = details?.predicted_cost ?? 0;
  const delta = details
    ? details.predicted_cost - details.previous_year_cost
    : 0;
  const riskLevel = details ? deriveRiskLevel(details.predicted_cost) : null;

  if (!showWidget) return null;

  return (
    <aside className="tile form-tile relative flex h-full min-h-0 self-stretch flex-col gap-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="widget-title">Карта прогноза</h3>
          {!hideActionsDropdown && details && (
            <PredictionDetailsActionsDropdown
              details={details}
              onRecalculate={onRecalculate}
              onDelete={onDelete}
              onExport={onExport}
            />
          )}
        </div>
        {!hideCloseButton && (
          <KitButton
            type="button"
            variant="icon"
            onClick={closePredictionDetails}
          >
            <img src={closeIcon} alt="" aria-hidden="true" />
          </KitButton>
        )}
      </div>

      <div className="relative min-h-0 flex-1">
        <div className="scroll-hidden h-full min-h-0 overflow-auto">
        {visibleLoading && !details ? (
          <div className="flex min-h-[220px] items-center justify-center text-center text-muted">
            <KitLoader label="Загрузка прогноза..." />
          </div>
        ) : error && !details ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center text-muted">
            <p>{error.includes("404") ? "Прогноз не найден." : error}</p>
            <div className="flex justify-center gap-2">
              <KitButton
                type="button"
                variant="primary"
                onClick={retryPredictionDetails}
              >
                Повторить
              </KitButton>
            </div>
          </div>
        ) : details ? (
          <div className="flex flex-col gap-3">
            <section className="rounded-2xl border p-3 [border-color:color-mix(in_srgb,var(--line)_80%,transparent)]">
              <div className="mb-2 flex flex-col gap-2">
                <p className="m-0 text-3xl font-extrabold text-txt">
                  {formatMoney(predictedCost)} ₽
                </p>
                <p className="m-0 text-xs text-muted">
                  ID: {details.prediction_id}
                </p>
                <p className="m-0 text-xs text-muted">
                  Дата: {formatDate(details.created_at)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <article className="min-w-0 flex-1 basis-[220px] rounded-xl border p-2 [border-color:color-mix(in_srgb,var(--line)_80%,transparent)]">
                  <KitFieldLabel>Предыдущий год</KitFieldLabel>
                  <strong className="text-sm text-txt">
                    {formatMoney(details.previous_year_cost)} ₽
                  </strong>
                </article>
                <article className="min-w-0 flex-1 basis-[220px] rounded-xl border p-2 [border-color:color-mix(in_srgb,var(--line)_80%,transparent)]">
                  <KitFieldLabel>Разница</KitFieldLabel>
                  <strong className={delta >= 0 ? "kpi-up" : "kpi-down"}>
                    {delta >= 0 ? "+" : ""}
                    {formatMoney(delta)} ₽
                  </strong>
                </article>
                <article className="min-w-0 flex-1 basis-[220px] rounded-xl border p-2 [border-color:color-mix(in_srgb,var(--line)_80%,transparent)]">
                  <KitFieldLabel>Уровень риска</KitFieldLabel>
                  <strong className="text-sm text-txt">{riskLevel}</strong>
                </article>
                <article className="min-w-0 flex-1 basis-[220px] rounded-xl border p-2 [border-color:color-mix(in_srgb,var(--line)_80%,transparent)]">
                  <KitFieldLabel>Пациент</KitFieldLabel>
                  <strong className="text-sm text-txt">
                    {details.full_name}
                  </strong>
                </article>
              </div>
            </section>

            <section className="rounded-2xl border p-3 [border-color:color-mix(in_srgb,var(--line)_80%,transparent)]">
              <h3 className="mb-2 mt-0 text-sm font-semibold text-txt">
                Пациент
              </h3>
              <div className="flex flex-wrap gap-2">
                <article className="min-w-0 flex-1 basis-[220px] rounded-xl border p-2 [border-color:color-mix(in_srgb,var(--line)_80%,transparent)]">
                  <KitFieldLabel>Возраст</KitFieldLabel>
                  <strong className="text-sm text-txt">{details.age}</strong>
                </article>
                <article className="min-w-0 flex-1 basis-[220px] rounded-xl border p-2 [border-color:color-mix(in_srgb,var(--line)_80%,transparent)]">
                  <KitFieldLabel>Пол</KitFieldLabel>
                  <strong className="text-sm text-txt">
                    {formatGender(details.gender)}
                  </strong>
                </article>
                <article className="min-w-0 flex-1 basis-[220px] rounded-xl border p-2 [border-color:color-mix(in_srgb,var(--line)_80%,transparent)]">
                  <KitFieldLabel>ИМТ</KitFieldLabel>
                  <strong className="text-sm text-txt">{details.bmi}</strong>
                </article>
                <article className="min-w-0 flex-1 basis-[220px] rounded-xl border p-2 [border-color:color-mix(in_srgb,var(--line)_80%,transparent)]">
                  <KitFieldLabel>Активность</KitFieldLabel>
                  <strong className="text-sm text-txt">
                    {formatActivity(details.physical_activity_level)}
                  </strong>
                </article>
                <article className="min-w-0 flex-1 basis-[220px] rounded-xl border p-2 [border-color:color-mix(in_srgb,var(--line)_80%,transparent)]">
                  <KitFieldLabel>Шагов</KitFieldLabel>
                  <strong className="text-sm text-txt">
                    {details.daily_steps.toLocaleString("ru-RU")}
                  </strong>
                </article>
                <article className="min-w-0 flex-1 basis-[220px] rounded-xl border p-2 [border-color:color-mix(in_srgb,var(--line)_80%,transparent)]">
                  <KitFieldLabel>Сон</KitFieldLabel>
                  <strong className="text-sm text-txt">
                    {details.sleep_hours}
                  </strong>
                </article>
                <article className="min-w-0 flex-1 basis-[220px] rounded-xl border p-2 [border-color:color-mix(in_srgb,var(--line)_80%,transparent)]">
                  <KitFieldLabel>Стресс</KitFieldLabel>
                  <strong className="text-sm text-txt">
                    {details.stress_level}
                  </strong>
                </article>
                <article className="min-w-0 flex-1 basis-[220px] rounded-xl border p-2 [border-color:color-mix(in_srgb,var(--line)_80%,transparent)]">
                  <KitFieldLabel>Визиты</KitFieldLabel>
                  <strong className="text-sm text-txt">
                    {details.doctor_visits_per_year}
                  </strong>
                </article>
                <article className="min-w-0 flex-1 basis-[220px] rounded-xl border p-2 [border-color:color-mix(in_srgb,var(--line)_80%,transparent)]">
                  <KitFieldLabel>Госпитализации</KitFieldLabel>
                  <strong className="text-sm text-txt">
                    {details.hospital_admissions}
                  </strong>
                </article>
                <article className="min-w-0 flex-1 basis-[220px] rounded-xl border p-2 [border-color:color-mix(in_srgb,var(--line)_80%,transparent)]">
                  <KitFieldLabel>Лекарства</KitFieldLabel>
                  <strong className="text-sm text-txt">
                    {details.medication_count}
                  </strong>
                </article>
                <article className="min-w-0 flex-1 basis-[220px] rounded-xl border p-2 [border-color:color-mix(in_srgb,var(--line)_80%,transparent)]">
                  <KitFieldLabel>Тип города</KitFieldLabel>
                  <strong className="text-sm text-txt">
                    {formatCity(details.city_type)}
                  </strong>
                </article>
                <article className="min-w-0 flex-1 basis-[220px] rounded-xl border p-2 [border-color:color-mix(in_srgb,var(--line)_80%,transparent)]">
                  <KitFieldLabel>Хронические факторы</KitFieldLabel>
                  <strong className="text-sm text-txt">
                    {getChronicCount(details)}
                  </strong>
                </article>
              </div>
            </section>

            <section className="rounded-2xl border p-3 [border-color:color-mix(in_srgb,var(--line)_80%,transparent)]">
              <h3 className="mb-2 mt-0 text-sm font-semibold text-txt">
                Факторы расчета
              </h3>
              <div className="flex flex-col gap-2">
                {sortedFactors.map((factor) => (
                  <article
                    key={`${factor.feature_name}-${factor.shap_value}`}
                    className="rounded-xl border p-2 [border-color:color-mix(in_srgb,var(--line)_80%,transparent)] [background:color-mix(in_srgb,var(--bg)_92%,#fff_8%)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <KitFieldLabel>
                          {featureMap[factor.feature_name] ??
                            factor.feature_name}
                        </KitFieldLabel>
                        <strong className="text-sm text-txt">
                          {factor.feature_value === ""
                            ? "—"
                            : String(factor.feature_value)}
                        </strong>
                      </div>
                      <strong
                        className={
                          factor.direction === "increase"
                            ? "kpi-up"
                            : "kpi-down"
                        }
                      >
                        {factor.shap_value > 0 ? "+" : ""}
                        {factor.shap_value.toFixed(2)}
                      </strong>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : null}
        </div>

        {visibleLoading && details && (
          <div
            className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center backdrop-blur-[2px]"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="loading-card">
              <KitLoader label="Обновляем прогноз..." />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
