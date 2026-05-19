import { UserRound } from "lucide-react";
import { parseNumberInput } from "../../../../shared/lib/form-values";
import {
  FormField,
  KitInput,
  KitSelect,
  SectionCard,
} from "../../../../shared/ui/kit";
import type { PredictFormWidgetProps } from "../../model/types";

type BasicDataSectionProps = Pick<
  PredictFormWidgetProps,
  "form" | "errors" | "onUpdateField" | "onFullNameBlur"
>;

export function BasicDataSection({
  form,
  errors,
  onUpdateField,
  onFullNameBlur,
}: BasicDataSectionProps) {
  return (
    <SectionCard title="1. Основные данные" icon={UserRound}>
      <div className="grid gap-3">
        <FormField label="ФИО пациента" error={errors.full_name}>
          <KitInput
            value={form.full_name}
            placeholder="Иванов Иван Иванович"
            aria-invalid={Boolean(errors.full_name)}
            onChange={(e) => onUpdateField("full_name", e.target.value)}
            onBlur={(e) => onFullNameBlur(e.target.value)}
          />
        </FormField>

        <FormField label="СНИЛС">
          <KitInput
            value={form.snils}
            placeholder="123-456-789 01"
            onChange={(e) => onUpdateField("snils", e.target.value)}
          />
        </FormField>

        <FormField label="Телефон">
          <KitInput
            value={form.phone}
            placeholder="89001234567"
            onChange={(e) => onUpdateField("phone", e.target.value)}
          />
        </FormField>

        <FormField label="Адрес">
          <KitInput
            value={form.address}
            placeholder="г. Москва, ул. Ленина, д. 1"
            onChange={(e) => onUpdateField("address", e.target.value)}
          />
        </FormField>

        <FormField label="Возраст" error={errors.age}>
          <KitInput
            type="number"
            min={18}
            max={100}
            step={1}
            value={form.age === 0 ? "" : form.age}
            aria-invalid={Boolean(errors.age)}
            onChange={(e) =>
              onUpdateField("age", parseNumberInput(e.target.value))
            }
          />
        </FormField>

        <FormField label="Пол" error={errors.gender}>
          <KitSelect
            value={form.gender}
            onChange={(e) => onUpdateField("gender", e.target.value)}
          >
            <option value="">Не выбрано</option>
            <option>Женский</option>
            <option>Мужской</option>
          </KitSelect>
        </FormField>

        <FormField label="BMI (индекс массы тела)" error={errors.bmi}>
          <KitInput
            type="number"
            min={10}
            max={60}
            step={0.1}
            value={form.bmi === 0 ? "" : form.bmi}
            aria-invalid={Boolean(errors.bmi)}
            onChange={(e) =>
              onUpdateField("bmi", parseNumberInput(e.target.value))
            }
          />
        </FormField>

        <FormField
          label="Уровень физической активности"
          error={errors.physical_activity_label}
        >
          <KitSelect
            value={form.physical_activity_label}
            onChange={(e) =>
              onUpdateField("physical_activity_label", e.target.value)
            }
          >
            <option value="">Не выбрано</option>
            <option>Низкий</option>
            <option>Средний</option>
            <option>Высокий</option>
          </KitSelect>
        </FormField>

        <FormField
          label="Тип населенного пункта"
          error={errors.city_type_label}
        >
          <KitSelect
            value={form.city_type_label}
            onChange={(e) => onUpdateField("city_type_label", e.target.value)}
          >
            <option value="">Не выбрано</option>
            <option>Город</option>
            <option>Пригород</option>
            <option>Сельская местность</option>
          </KitSelect>
        </FormField>

        <FormField label="Шагов в день" error={errors.daily_steps}>
          <KitInput
            type="number"
            min={0}
            max={50000}
            step={100}
            value={form.daily_steps === 0 ? "" : form.daily_steps}
            aria-invalid={Boolean(errors.daily_steps)}
            onChange={(e) =>
              onUpdateField("daily_steps", parseNumberInput(e.target.value))
            }
          />
        </FormField>

        <FormField label="Часы сна" error={errors.sleep_hours}>
          <KitInput
            type="number"
            min={0}
            max={24}
            step={0.5}
            value={form.sleep_hours === 0 ? "" : form.sleep_hours}
            aria-invalid={Boolean(errors.sleep_hours)}
            onChange={(e) =>
              onUpdateField("sleep_hours", parseNumberInput(e.target.value))
            }
          />
        </FormField>
      </div>
    </SectionCard>
  );
}
