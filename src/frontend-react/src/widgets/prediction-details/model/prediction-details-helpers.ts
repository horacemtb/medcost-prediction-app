import type { PredictionDetailsResponse } from "../../../shared/types/medcost";

export function formatMoney(value: number) {
  return value.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
}

export function formatGender(value: number) {
  return value === 1 ? "Мужской" : "Женский";
}

export function formatActivity(value: string) {
  if (value === "High") return "Высокий";
  if (value === "Low") return "Низкий";
  return "Средний";
}

export function formatCity(value: string) {
  if (value === "Semi-Urban") return "Пригород";
  if (value === "Rural") return "Сельская местность";
  return "Город";
}

export function formatDate(value: string) {
  return new Date(value).toLocaleString("ru-RU");
}

export function deriveRiskLevel(predictedCost: number) {
  if (predictedCost < 20000) return "Низкий";
  if (predictedCost < 50000) return "Средний";
  return "Высокий";
}

export function deriveRiskProfileCategory(predictedCost: number) {
  if (predictedCost < 15000) return "Низкий";
  if (predictedCost < 30000) return "Стандартный";
  if (predictedCost < 50000) return "Выше среднего";
  return "Высокий";
}

export function buildRecommendation(riskProfileCategory: string) {
  if (riskProfileCategory === "Низкий") {
    return {
      title: "Рекомендуется к страхованию по стандартному полису.",
      description:
        "Пациент демонстрирует низкий уровень медицинского риска. Страхование является экономически выгодным для компании.",
    };
  }
  if (riskProfileCategory === "Стандартный") {
    return {
      title: "Рекомендуется к страхованию с повышенными условиями.",
      description:
        "Пациент имеет умеренный уровень риска. Стандартное страхование требует корректировки.",
    };
  }
  if (riskProfileCategory === "Выше среднего") {
    return {
      title: "Рекомендуется к страхованию с повышенными условиями.",
      description:
        "Пациент демонстрирует уровень риска значительно выше среднего. Рекомендуется применение повышающего коэффициента к базовой премии.",
    };
  }
  return {
    title: "Не рекомендуется к стандартному страхованию.",
    description:
      "Пациент относится к группе высокого медицинского риска. Стандартное страхование экономически нецелесообразно.",
  };
}

export function getChronicCount(details: PredictionDetailsResponse) {
  return [
    details.smoker,
    details.diabetes,
    details.hypertension,
    details.heart_disease,
    details.asthma,
  ].filter(Boolean).length;
}

export function sortRiskFactors(details: PredictionDetailsResponse) {
  return [...details.risk_factors].sort(
    (a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value),
  );
}
