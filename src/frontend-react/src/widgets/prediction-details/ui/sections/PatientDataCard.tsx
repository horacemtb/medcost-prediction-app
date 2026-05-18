import type { PredictionDetailsResponse } from "../../../../shared/types/medcost";
import {
  formatActivity,
  formatCity,
  formatGender,
} from "../../model/prediction-details-helpers";

type PatientDataCardProps = {
  details: PredictionDetailsResponse;
};

export function PatientDataCard({ details }: PatientDataCardProps) {
  const contactRows = [
    { label: "СНИЛС", value: details.snils },
    { label: "Телефон", value: details.phone },
    { label: "Адрес", value: details.address },
  ].filter((row) => row.value);

  return (
    <article className="rounded-2xl border border-line/70 bg-[#eef4ff] p-5">
      <p className="m-0 text-ui-xs uppercase tracking-[0.15em] text-[#677da1]">
        Данные пациента
      </p>
      <p className="m-0 mt-1 text-ui-md font-semibold text-[#1a2741]">
        {details.full_name}
      </p>
      {contactRows.length > 0 && (
        <div className="mt-2 grid grid-cols-1 gap-1 text-ui-sm text-[#334766]">
          {contactRows.map((row) => (
            <p key={row.label} className="m-0 break-words">
              <span className="text-[#6b7d99]">{row.label}</span>
              <br />
              {row.value}
            </p>
          ))}
        </div>
      )}
      <div className="mt-2 grid grid-cols-2 gap-2 text-ui-sm text-[#334766]">
        <p className="m-0">
          <span className="text-[#6b7d99]">Возраст</span>
          <br />
          {details.age} лет
        </p>
        <p className="m-0">
          <span className="text-[#6b7d99]">Пол</span>
          <br />
          {formatGender(details.gender)}
        </p>
        <p className="m-0">
          <span className="text-[#6b7d99]">ИМТ</span>
          <br />
          {details.bmi}
        </p>
        <p className="m-0">
          <span className="text-[#6b7d99]">Активность</span>
          <br />
          {formatActivity(details.physical_activity_level)}
        </p>
        <p className="m-0">
          <span className="text-[#6b7d99]">Нас. пункт</span>
          <br />
          {formatCity(details.city_type)}
        </p>
        <p className="m-0">
          <span className="text-[#6b7d99]">Стресс</span>
          <br />
          {details.stress_level}
        </p>
      </div>
    </article>
  );
}
