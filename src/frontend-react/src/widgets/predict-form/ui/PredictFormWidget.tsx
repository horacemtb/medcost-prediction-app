import {
  Activity,
  AlertTriangle,
  Calculator,
  HeartPulse,
  ScanText,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import { featureMap } from "../../../shared/config/feature-map";
import {
  FieldMeta,
  KitButton,
  KitCheckbox,
  KitInput,
  KitSelect,
} from "../../../shared/ui/kit";
import type { PredictFormWidgetProps } from "../model/types";

function StepperField({
  label,
  value,
  min,
  max,
  step,
  error,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  error?: string;
  onChange: (next: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-ui-sm font-medium text-txt">{label}</span>
      <KitInput
        type="number"
        min={min}
        max={max}
        step={step}
        value={value === 0 ? "" : value}
        aria-invalid={Boolean(error)}
        className="h-10 bg-white/70"
        placeholder="Не указано"
        onChange={(e) =>
          onChange(e.target.value === "" ? 0 : Number(e.target.value))
        }
      />
      <FieldMeta error={error} />
    </label>
  );
}

export function PredictFormWidget({
  form,
  errors,
  costInput,
  loading,
  ocrLoading,
  ocrWarnings,
  ocrError,
  chronicCount,
  formPredictionId,
  onUpdateField,
  onFullNameBlur,
  onCostInputChange,
  onCostInputBlur,
  onReset,
  onSubmit,
  onRecognizeForm,
}: PredictFormWidgetProps) {
  const ocrInputRef = useRef<HTMLInputElement | null>(null);

  const handlePickOcrFile = () => {
    ocrInputRef.current?.click();
  };

  const handleOcrFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onRecognizeForm(file);
    event.target.value = "";
  };

  return (
    <section className="flex h-full min-h-0 flex-col">
      <input
        ref={ocrInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        className="hidden"
        onChange={handleOcrFileChange}
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-ui-display">Данные пациента</h3>
        <KitButton
          type="button"
          className="h-10 rounded-xl border border-line/70 bg-white px-4 text-ui-sm font-medium text-txt hover:bg-[#f4f7ff]"
          disabled={ocrLoading}
          onClick={handlePickOcrFile}
        >
          <ScanText className="size-4" />
          {ocrLoading ? "Распознаем..." : "Распознать анкету"}
        </KitButton>
      </div>

      <p className="muted mt-4">
        Эти данные используются для расчета прогнозируемой стоимости лечения и
        профиля рисков.
      </p>

      {ocrError && (
        <div className="mt-4 rounded-xl border border-[#f3b4b4] bg-[#fff1f1] p-3 text-ui-sm text-[#9f1f1f]">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p className="m-0">{ocrError}</p>
          </div>
        </div>
      )}

      {!ocrError && ocrWarnings.length > 0 && (
        <div className="mt-4 rounded-xl border border-[#f4d28b] bg-[#fff8e8] p-3 text-ui-sm text-[#7a4b00]">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="m-0 font-semibold">
                Некоторые поля анкеты не распознаны.
              </p>
              <ul className="m-0 mt-2 list-disc space-y-1 pl-5">
                {ocrWarnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 grid flex-1 min-h-0 grid-cols-1 gap-3 overflow-auto pr-1 lg:grid-cols-[1.1fr_1.5fr]">
        <article className="rounded-2xl border border-line/65 bg-white/70 p-4">
          <h4 className="mb-3 inline-flex items-center gap-2 text-ui-lg font-semibold text-txt">
            <UserRound className="size-5 text-[#2f64ef]" />
            1. Основные данные
          </h4>
          <div className="grid gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-ui-sm font-medium text-txt">
                ФИО пациента
              </span>
              <KitInput
                value={form.full_name}
                placeholder="Иванов Иван Иванович"
                aria-invalid={Boolean(errors.full_name)}
                className="h-10 bg-white/70"
                onChange={(e) => onUpdateField("full_name", e.target.value)}
                onBlur={(e) => onFullNameBlur(e.target.value)}
              />
              <FieldMeta error={errors.full_name} />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-ui-sm font-medium text-txt">СНИЛС</span>
              <KitInput
                value={form.snils}
                placeholder="123-456-789 01"
                className="h-10 bg-white/70"
                onChange={(e) => onUpdateField("snils", e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-ui-sm font-medium text-txt">Телефон</span>
              <KitInput
                value={form.phone}
                placeholder="89001234567"
                className="h-10 bg-white/70"
                onChange={(e) => onUpdateField("phone", e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-ui-sm font-medium text-txt">Адрес</span>
              <KitInput
                value={form.address}
                placeholder="г. Москва, ул. Ленина, д. 1"
                className="h-10 bg-white/70"
                onChange={(e) => onUpdateField("address", e.target.value)}
              />
            </label>

            <StepperField
              label="Возраст"
              value={form.age}
              min={18}
              max={100}
              step={1}
              error={errors.age}
              onChange={(next) => onUpdateField("age", next)}
            />

            <label className="flex flex-col gap-1.5">
              <span className="text-ui-sm font-medium text-txt">Пол</span>
              <KitSelect
                value={form.gender}
                className="h-10 bg-white/70"
                placeholderText="Не выбран"
                onChange={(e) => onUpdateField("gender", e.target.value)}
              >
                <option value="">
                  Не выбран
                </option>
                <option>Женский</option>
                <option>Мужской</option>
              </KitSelect>
              <FieldMeta error={errors.gender} />
            </label>

            <StepperField
              label="BMI (индекс массы тела)"
              value={form.bmi}
              min={10}
              max={60}
              step={0.1}
              error={errors.bmi}
              onChange={(next) => onUpdateField("bmi", next)}
            />

            <label className="flex flex-col gap-1.5">
              <span className="text-ui-sm font-medium text-txt">
                Уровень физической активности
              </span>
              <KitSelect
                value={form.physical_activity_label}
                className="h-10 bg-white/70"
                placeholderText="Не выбран"
                onChange={(e) =>
                  onUpdateField("physical_activity_label", e.target.value)
                }
              >
                <option value="">Не выбран</option>
                <option>Низкий</option>
                <option>Средний</option>
                <option>Высокий</option>
              </KitSelect>
              <FieldMeta error={errors.physical_activity_label} />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-ui-sm font-medium text-txt">
                Тип населенного пункта
              </span>
              <KitSelect
                value={form.city_type_label}
                className="h-10 bg-white/70"
                placeholderText="Не выбран"
                onChange={(e) =>
                  onUpdateField("city_type_label", e.target.value)
                }
              >
                <option value="">Не выбран</option>
                <option>Город</option>
                <option>Пригород</option>
                <option>Сельская местность</option>
              </KitSelect>
              <FieldMeta error={errors.city_type_label} />
            </label>

            <StepperField
              label="Шагов в день"
              value={form.daily_steps}
              min={0}
              max={50000}
              step={100}
              error={errors.daily_steps}
              onChange={(next) => onUpdateField("daily_steps", next)}
            />

            <StepperField
              label="Часы сна"
              value={form.sleep_hours}
              min={0}
              max={24}
              step={0.5}
              error={errors.sleep_hours}
              onChange={(next) => onUpdateField("sleep_hours", next)}
            />
          </div>
        </article>

        <div className="grid gap-3">
          <article className="rounded-2xl border border-line/65 bg-white/70 p-4">
            <h4 className="mb-3 inline-flex items-center gap-2 text-ui-lg font-semibold text-txt">
              <HeartPulse className="size-5 text-[#2f64ef]" />
              2. Сопутствующие факторы
            </h4>
            <div className="grid gap-2">
              {(
                [
                  "smoker",
                  "diabetes",
                  "hypertension",
                  "heart_disease",
                  "asthma",
                ] as const
              ).map((k) => (
                <KitCheckbox
                  key={k}
                  label={featureMap[k]}
                  checked={form[k]}
                  className="w-full justify-start border-line/60 bg-white/65"
                  onChange={(e) => onUpdateField(k, e.target.checked)}
                />
              ))}
            </div>
            <small className="mt-2 block text-ui-xs text-muted">
              {chronicCount
                ? `Отмечено факторов: ${chronicCount}`
                : "Факторы не выбраны"}
            </small>
          </article>

          <article className="rounded-2xl border border-line/65 bg-white/70 p-4">
            <h4 className="mb-3 inline-flex items-center gap-2 text-ui-lg font-semibold text-txt">
              <Activity className="size-5 text-[#2f64ef]" />
              3. Поведенческие и медицинские показатели
            </h4>

            <label className="mb-3 block">
              <span className="mb-2 block text-ui-sm font-medium text-txt">
                Уровень стресса
              </span>
              <div className="flex items-center gap-3">
                <span className="text-ui-xs text-muted">1</span>
                <input
                  className="h-1.5 flex-1 accent-[#4f6ff2]"
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={form.stress_level}
                  aria-invalid={Boolean(errors.stress_level)}
                  onChange={(e) =>
                    onUpdateField("stress_level", Number(e.target.value))
                  }
                />
                <span className="text-ui-xs text-muted">10</span>
                <span className="min-w-6 text-right text-ui-sm font-semibold text-[#4f6ff2]">
                  {form.stress_level}
                </span>
              </div>
              <FieldMeta error={errors.stress_level} />
            </label>

            <div className="grid gap-3">
              <StepperField
                label="Визитов к врачу в год"
                value={form.doctor_visits_per_year}
                min={0}
                max={100}
                step={1}
                onChange={(next) =>
                  onUpdateField("doctor_visits_per_year", next)
                }
              />
              <StepperField
                label="Госпитализаций"
                value={form.hospital_admissions}
                min={0}
                max={50}
                step={1}
                onChange={(next) => onUpdateField("hospital_admissions", next)}
              />
              <StepperField
                label="Количество лекарств"
                value={form.medication_count}
                min={0}
                max={100}
                step={1}
                onChange={(next) => onUpdateField("medication_count", next)}
              />

              <label className="flex flex-col gap-1.5">
                <span className="text-ui-sm font-medium text-txt">
                  Расходы за прошлый год
                </span>
                <KitInput
                  inputMode="numeric"
                  value={costInput}
                  placeholder="Не указано"
                  aria-invalid={Boolean(errors.previous_year_cost)}
                  className="h-10 bg-white/70"
                  onChange={(e) => onCostInputChange(e.target.value)}
                  onBlur={onCostInputBlur}
                />
                <FieldMeta error={errors.previous_year_cost} />
              </label>
            </div>
          </article>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center gap-2">
        <div className="flex flex-wrap justify-center gap-2">
          <KitButton
            type="button"
            onClick={onReset}
            className="h-11 min-w-[260px] rounded-xl bg-[#142f6b] text-ui-md font-semibold hover:brightness-110"
          >
            Очистить
          </KitButton>
          <KitButton
            type="button"
            className="h-11 min-w-[260px] rounded-xl bg-[#142f6b] text-ui-md font-semibold hover:brightness-110"
            variant="primary"
            disabled={loading}
            onClick={onSubmit}
          >
            <Calculator className="size-4" />
            {loading ? "Расчет..." : "Рассчитать"}
          </KitButton>
        </div>
        <p className="inline-flex items-center gap-1 text-ui-xs text-muted">
          <ShieldCheck className="size-3.5" />
          {formPredictionId === null
            ? "Прогноз на основе модели PrecisionAI v3.0"
            : `Перерасчет пациента id ${formPredictionId}`}
        </p>
      </div>
    </section>
  );
}
