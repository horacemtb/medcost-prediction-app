import { InfoSectionCard, MiniStatCard } from "../../../shared/ui/kit";

export function SettingsPage({ status }: { status: string }) {
  return (
    <section className="dashboard-main">
      <InfoSectionCard title="Настройки" subtitle="Параметры приложения и состояние инфраструктуры." />
      <MiniStatCard label="Сервис" value={status} />
    </section>
  );
}
