import { useMemo } from "react";
import { featureMap } from "../../../shared/config/feature-map";
import {
  buildPredictSummaryView,
  type PredictSummaryForm,
} from "../model/predict-summary";

type PredictSummaryWidgetProps = {
  form: PredictSummaryForm;
  chronicCount: number;
};

export function PredictSummaryWidget({
  form,
  chronicCount,
}: PredictSummaryWidgetProps) {
  const summary = useMemo(
    () => buildPredictSummaryView(form, chronicCount),
    [form, chronicCount],
  );

  return (
    <section className="tile form-tile sticky top-0 gap-3 p-4">
      <div className="flex flex-col gap-2 w-full">
        <h3 className="widget-title">Сводка перед расчетом</h3>
        <p className="m-0 text-sm text-muted">
          {summary.normalizedName || "ФИО не заполнено"}
        </p>

        <div className="rounded-xl border border-line/70 bg-white/5 p-3">
          <div className="flex justify-between text-xs text-muted">
            <span>
              Заполнено: {summary.completion.done}/{summary.completion.total}
            </span>
            <strong className="text-txt">{summary.completion.percent}%</strong>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-line/60">
            <span
              className="block h-full rounded-full bg-accent transition-[width] duration-300"
              style={{ width: `${summary.completion.percent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <article className="rounded-xl border border-line/70 bg-white/5 p-2">
            <span className="block text-[11px] text-muted">Возраст</span>
            <strong className="text-base text-txt">{form.age}</strong>
          </article>
          <article className="rounded-xl border border-line/70 bg-white/5 p-2">
            <span className="block text-[11px] text-muted">ИМТ</span>
            <strong className="text-base text-txt">{form.bmi}</strong>
          </article>
          <article className="rounded-xl border border-line/70 bg-white/5 p-2">
            <span className="block text-[11px] text-muted">Расходы</span>
            <strong className="text-base text-txt">
              {form.previous_year_cost.toLocaleString("ru-RU")} ₽
            </strong>
          </article>
          <article className="rounded-xl border border-line/70 bg-white/5 p-2">
            <span className="block text-[11px] text-muted">Факторы</span>
            <strong className="text-base text-txt">{chronicCount}</strong>
          </article>
        </div>

        <div className="grid grid-cols-1 gap-2 rounded-xl border border-line/70 bg-white/5 p-3">
          <p className="m-0 text-sm text-muted">
            Категория ИМТ:{" "}
            <strong className="text-txt">{summary.bmiCategory}</strong>
          </p>
          <p className="m-0 text-sm text-muted">
            Стресс: <strong className="text-txt">{summary.stressCategory}</strong>
          </p>
          <p className="m-0 text-sm text-muted">
            Активность:{" "}
            <strong className="text-txt">{form.physical_activity_label}</strong>
          </p>
          <p className="m-0 text-sm text-muted">
            Профиль:{" "}
            <strong className="text-txt">{summary.predictedProfile}</strong>
          </p>
        </div>

        {summary.chronicFactors.length > 0 && (
          <div className="grid gap-2">
            {summary.chronicFactors.map((k) => (
              <span
                key={k}
                className="rounded-lg border border-line/80 px-2 py-1 text-xs text-muted"
              >
                {featureMap[k]}
              </span>
            ))}
          </div>
        )}
        {summary.summaryIssues.length > 0 && (
          <div className="mt-2 rounded-xl border border-danger/50 bg-danger/20 p-2">
            {summary.summaryIssues.map((issue) => (
              <p key={issue} className="my-1 text-xs text-danger">
                {issue}
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

