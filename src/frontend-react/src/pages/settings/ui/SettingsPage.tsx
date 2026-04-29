export function SettingsPage({ status }: { status: string }) {
  return (
    <section className="dashboard-main">
      <section className="tile form-tile">
        <h2>Настройки</h2>
        <p className="muted">Параметры приложения и состояние инфраструктуры.</p>
      </section>
      <section className="tile mini">
        <p className="tiny">Сервис</p>
        <h3>{status}</h3>
      </section>
    </section>
  );
}
