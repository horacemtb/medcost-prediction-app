import { FieldMeta, KitInput, KitSelect } from "../../../../shared/ui/kit";
import type {
  PredictFormErrors,
  PredictFormState,
} from "../../../../pages/predict/model/predict-form";

type PatientSectionProps = {
  form: PredictFormState;
  errors: PredictFormErrors;
  onUpdateField: <K extends keyof PredictFormState>(
    key: K,
    value: PredictFormState[K],
  ) => void;
  onFullNameBlur: (value: string) => void;
};

export function PatientSection({
  form,
  errors,
  onUpdateField,
  onFullNameBlur,
}: PatientSectionProps) {
  return (
    <div className="form-section">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col">
          <span className="flex items-center"> ФИО пациента</span>
          <KitInput
            value={form.full_name}
            placeholder="Иванов Иван Иванович"
            aria-invalid={Boolean(errors.full_name)}
            onChange={(e) => onUpdateField("full_name", e.target.value)}
            onBlur={(e) => onFullNameBlur(e.target.value)}
          />
          <FieldMeta error={errors.full_name} />
        </label>
        <label className="flex flex-col">
          <span className="flex items-center"> Возраст</span>
          <KitInput
            type="number"
            min={18}
            max={100}
            value={form.age}
            aria-invalid={Boolean(errors.age)}
            onChange={(e) => onUpdateField("age", Number(e.target.value))}
          />
          <FieldMeta error={errors.age} />
        </label>
        <label className="flex flex-col">
          <span className="flex items-center">Пол</span>
          <KitSelect
            value={form.gender}
            onChange={(e) => onUpdateField("gender", e.target.value)}
          >
            <option>Женский</option>
            <option>Мужской</option>
          </KitSelect>
        </label>
        <label className="flex flex-col">
          <span className="flex items-center gap-1">ИМТ</span>
          <KitInput
            type="number"
            min={10}
            max={60}
            step={0.1}
            value={form.bmi}
            aria-invalid={Boolean(errors.bmi)}
            onChange={(e) => onUpdateField("bmi", Number(e.target.value))}
          />
          <FieldMeta error={errors.bmi} hint="Норма: 18.5–24.9" />
        </label>
      </div>
    </div>
  );
}
