import { MiniStatCard } from "../../../shared/ui/kit";

export function DashboardPage() {
  return (
    <section className="page-shell">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.35fr_1fr]">
        <article className="tile xl">
          <p className="tiny">Система медицинских расходов</p>
          <h1>Контроль MedCost</h1>
          <p className="muted">Рабочая зона сервиса прогнозирования медицинских расходов.</p>
        </article>
        <article className="tile chart">
          <p className="tiny">Условная динамика нагрузки</p>
          <div className="mt-2 flex h-[120px] items-end gap-2">
            <span className="w-4 rounded-full bg-line/70" style={{ height: "36%" }} />
            <span className="w-4 rounded-full bg-line/70" style={{ height: "58%" }} />
            <span className="w-4 rounded-full bg-accent" style={{ height: "84%" }} />
            <span className="w-4 rounded-full bg-line/70" style={{ height: "46%" }} />
            <span className="w-4 rounded-full bg-line/70" style={{ height: "67%" }} />
            <span className="w-4 rounded-full bg-line/70" style={{ height: "52%" }} />
          </div>
        </article>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <MiniStatCard label="Основной раздел" value="Дашборд" />
        <MiniStatCard label="Режим" value="Аналитика" />
        <MiniStatCard label="Версия" value="v1" />
      </div>
    </section>
  );
}
