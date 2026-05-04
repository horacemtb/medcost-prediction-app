import { KitButton, MiniStatCard } from "../../../shared/ui/kit";

type ThemeMode = "light" | "dark";

type SettingsPageProps = {
  status: string;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
};

export function SettingsPage({ status, theme, onThemeChange }: SettingsPageProps) {
  return (
    <section className="page-shell justify-items-start">
      <MiniStatCard label="Сервис" value={status} />
      <article className="tile w-full max-w-md rounded-2xl border border-line/70 bg-white/5 p-4">
        <h2 className="m-0 text-base font-semibold text-txt">Тема интерфейса</h2>
        <p className="mt-2 text-sm text-muted">Выберите светлую или тёмную тему.</p>
        <div className="mt-3 flex gap-2">
          <KitButton
            variant={theme === "light" ? "primary" : "default"}
            onClick={() => onThemeChange("light")}
            aria-pressed={theme === "light"}
          >
            Light
          </KitButton>
          <KitButton
            variant={theme === "dark" ? "primary" : "default"}
            onClick={() => onThemeChange("dark")}
            aria-pressed={theme === "dark"}
          >
            Dark
          </KitButton>
        </div>
      </article>
    </section>
  );
}
