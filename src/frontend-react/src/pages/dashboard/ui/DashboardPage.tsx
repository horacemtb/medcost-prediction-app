import {
  Activity,
  Bell,
  ChartPie,
  Download,
  Gauge,
  Rocket,
  Shield,
  Sparkles,
} from "lucide-react";

export function DashboardPage() {
  return (
    <section className="rounded-3xl border border-[#dfe6f6] bg-gradient-to-br from-[#ffffff] via-[#f8faff] to-[#f1f5ff] p-6 shadow-[0_20px_45px_-34px_rgba(27,60,126,0.42)] md:p-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <h1 className="m-0 text-ui-display text-[#13264b]">Статистика</h1>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#eaf0ff] px-4 py-2 text-ui-sm font-semibold text-[#315ee8]">
              <Sparkles className="size-4" />
              В разработке
            </span>
          </div>
          <p className="muted mt-2">
            Мы готовим аналитику по прогнозам, рискам и качеству модели.
          </p>
          <p className="muted mt-0">
            Скоро здесь появятся интерактивные отчеты и ключевые метрики.
          </p>
        </div>

        <div className="relative min-h-[110px] overflow-hidden rounded-2xl ">
          <div className="absolute -right-9 -top-9 size-36 rounded-full bg-[#edf3ff]" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-[#dfe6f6] bg-white/85 p-5">
          <div className="mb-3 inline-flex rounded-2xl bg-[#eef3ff] p-3 text-[#3967ec]">
            <ChartPie className="size-6" />
          </div>
          <p className="m-0 text-ui-sm text-[#607296]">Всего прогнозов</p>
          <p className="m-0 text-ui-kpi text-[#13264b]">1 248</p>
          <p className="mt-2 text-ui-sm text-[#8a98b5]">Пример данных</p>
        </article>
        <article className="rounded-2xl border border-[#dfe6f6] bg-white/85 p-5">
          <div className="mb-3 inline-flex rounded-2xl bg-[#fff4e8] p-3 text-[#ec912e]">
            <Shield className="size-6" />
          </div>
          <p className="m-0 text-ui-sm text-[#607296]">Средний уровень риска</p>
          <p className="m-0 text-ui-kpi text-[#13264b]">28%</p>
          <p className="mt-2 text-ui-sm text-[#8a98b5]">Пример данных</p>
        </article>
        <article className="rounded-2xl border border-[#dfe6f6] bg-white/85 p-5">
          <div className="mb-3 inline-flex rounded-2xl bg-[#ecf9ed] p-3 text-[#4cae55]">
            <Gauge className="size-6" />
          </div>
          <p className="m-0 text-ui-sm text-[#607296]">Точность модели</p>
          <p className="m-0 text-ui-kpi text-[#13264b]">87%</p>
          <p className="mt-2 text-ui-sm text-[#8a98b5]">Пример данных</p>
        </article>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_0.95fr]">
        <article className="rounded-2xl border border-[#dfe6f6] bg-white/85 p-6">
          <h2 className="m-0 text-ui-display text-[#13264b]">Что скоро появится</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl bg-[#f7faff] p-4">
              <Activity className="mt-1 size-5 text-[#3967ec]" />
              <div>
                <p className="m-0 text-ui-md font-semibold text-[#213a66]">
                  Динамика прогнозов
                </p>
                <p className="m-0 text-ui-sm text-[#7f90b0]">
                  Графики трендов и сезонности
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-[#f7faff] p-4">
              <ChartPie className="mt-1 size-5 text-[#3967ec]" />
              <div>
                <p className="m-0 text-ui-md font-semibold text-[#213a66]">
                  Распределение рисков
                </p>
                <p className="m-0 text-ui-sm text-[#7f90b0]">
                  Анализ рисков по категориям
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-[#f7faff] p-4">
              <Download className="mt-1 size-5 text-[#3967ec]" />
              <div>
                <p className="m-0 text-ui-md font-semibold text-[#213a66]">
                  Экспорт отчетов
                </p>
                <p className="m-0 text-ui-sm text-[#7f90b0]">
                  Скачивайте отчеты в PDF и Excel
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-[#f7faff] p-4">
              <Bell className="mt-1 size-5 text-[#3967ec]" />
              <div>
                <p className="m-0 text-ui-md font-semibold text-[#213a66]">
                  История изменений
                </p>
                <p className="m-0 text-ui-sm text-[#7f90b0]">
                  Отслеживание версий и правок
                </p>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-[#dfe6f6] bg-gradient-to-br from-[#eef4ff] to-[#e8f0ff] p-6">
          <div className="mb-4 inline-flex rounded-xl bg-white p-3 text-[#3863e8]">
            <Rocket className="size-6" />
          </div>
          <h3 className="m-0 text-ui-display text-[#13264b]">
            Скоро здесь будет ещё лучше
          </h3>
          <p className="muted mt-3">
            Мы активно работаем над созданием мощной аналитики, которая поможет
            вам принимать решения на основе данных.
          </p>
          <button
            type="button"
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#9bb4ff] bg-white px-5 text-ui-sm font-semibold text-[#315ee8]"
          >
            <Bell className="size-4" />
            Сообщим, когда готово
          </button>
        </article>
      </div>
    </section>
  );
}
