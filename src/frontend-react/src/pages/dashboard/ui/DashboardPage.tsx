import { InfoSectionCard, MiniStatCard } from "../../../shared/ui/kit";

export function DashboardPage() {
  return (
    <section className="dashboard-main">
      <div className="top-grid">
        <article className="tile xl">
          <p className="tiny">Система медицинских расходов</p>
          <h1>Контроль MedCost</h1>
          <p className="muted">Рабочая зона сервиса прогнозирования медицинских расходов.</p>
        </article>
        <article className="tile chart">
          <p className="tiny">Условная динамика нагрузки</p>
          <div className="bars">
            <span style={{ height: "36%" }} />
            <span style={{ height: "58%" }} />
            <span className="hot" style={{ height: "84%" }} />
            <span style={{ height: "46%" }} />
            <span style={{ height: "67%" }} />
            <span style={{ height: "52%" }} />
          </div>
        </article>
      </div>
      <div className="mini-grid">
        <MiniStatCard label="Основной раздел" value="Дашборд" />
        <MiniStatCard label="Режим" value="Аналитика" />
        <MiniStatCard label="Версия" value="v1" />
      </div>
      <InfoSectionCard
        title="Навигация"
        subtitle="Расчет вынесен на отдельную страницу «Расчет». История и другие разделы доступны через левое меню."
      />
    </section>
  );
}
