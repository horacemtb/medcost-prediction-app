export function parseHistoryDate(value: string): number {
  const direct = new Date(value).getTime();
  if (!Number.isNaN(direct)) return direct;

  const normalized = value.includes(" ") ? value.replace(" ", "T") : value;
  const fallback = new Date(normalized).getTime();
  return Number.isNaN(fallback) ? Number.NaN : fallback;
}
