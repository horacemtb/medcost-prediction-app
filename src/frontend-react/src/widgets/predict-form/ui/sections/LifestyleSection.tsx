import { FieldMeta, KitInput, KitSelect } from "../../../../shared/ui/kit";
import type {
  PredictFormErrors,
  PredictFormState,
} from "../../../../pages/predict/model/predict-form";

type LifestyleSectionProps = {
  form: PredictFormState;
  errors: PredictFormErrors;
  onUpdateField: <K extends keyof PredictFormState>(
    key: K,
    value: PredictFormState[K],
  ) => void;
};

export function LifestyleSection({
  form,
  errors,
  onUpdateField,
}: LifestyleSectionProps) {
  return (
    <div className="form-section">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col">
          <span className="flex items-center">Уровень физической активности</span>
          <KitSelect
            value={form.physical_activity_label}
            onChange={(e) =>
              onUpdateField("physical_activity_label", e.target.value)
            }
          >
            <option>Низкий</option>
            <option>Средний</option>
            <option>Высокий</option>
          </KitSelect>
        </label>

        <label className="flex flex-col">
          <span className="flex items-center">Тип населённого пункта</span>
          <KitSelect
            value={form.city_type_label}
            onChange={(e) => onUpdateField("city_type_label", e.target.value)}
          >
            <option>Город</option>
            <option>Пригород</option>
            <option>Сельская местность</option>
          </KitSelect>
        </label>

        <label className="flex flex-col">
          <span className="flex items-center">Шагов в день</span>
          <KitInput
            type="number"
            min={0}
            max={50000}
            step={100}
            value={form.daily_steps}
            aria-invalid={Boolean(errors.daily_steps)}
            onChange={(e) => onUpdateField("daily_steps", Number(e.target.value))}
          />
          <FieldMeta error={errors.daily_steps} hint="Норма: 7000+" />
        </label>

        <label className="flex flex-col">
          <span className="flex items-center">Часы сна</span>
          <KitInput
            type="number"
            min={0}
            max={24}
            step={0.5}
            value={form.sleep_hours}
            aria-invalid={Boolean(errors.sleep_hours)}
            onChange={(e) => onUpdateField("sleep_hours", Number(e.target.value))}
          />
          <FieldMeta error={errors.sleep_hours} hint="Рекомендация: 7–9" />
        </label>

        <label className="flex flex-col md:col-span-2">
          <span className="flex items-center">Уровень стресса</span>
          <div className="flex items-center gap-2">
            <input
              className="flex-1"
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
            <span className="min-w-6 text-right font-semibold text-txt">
              {form.stress_level}
            </span>
          </div>
          <FieldMeta error={errors.stress_level} />
        </label>
      </div>
    </div>
  );
}

