type SettingsPageProps = {
  status: string;
};

export function SettingsPage({ status }: SettingsPageProps) {
  const normalized = status.trim().toLowerCase();
  const isAvailable =
    normalized === "ok" ||
    normalized === "online" ||
    normalized === "available" ||
    normalized === "доступен" ||
    normalized === "доступно";

  const statusText = isAvailable ? "Доступен" : "Недоступен";
  const statusClass = isAvailable ? "text-[#18794e]" : "text-[#b42318]";

  return (
    <section className="page-shell justify-items-start">
      <article className="tile w-full max-w-[420px] rounded-2xl border border-line/70 bg-white/70 p-4">
        <p className="tiny">Сервер</p>
        <p className={`m-0 mt-2 text-ui-lg font-semibold ${statusClass}`}>{statusText}</p>
      </article>
    </section>
  );
}
