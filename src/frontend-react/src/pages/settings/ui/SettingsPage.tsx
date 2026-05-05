import { MiniStatCard } from "../../../shared/ui/kit";

type SettingsPageProps = {
  status: string;
};

export function SettingsPage({ status }: SettingsPageProps) {
  return (
    <section className="page-shell justify-items-start">
      <MiniStatCard label="Сервис" value={status} />
    </section>
  );
}
