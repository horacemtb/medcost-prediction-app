import { useCallback, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import addChart from "../../../shared/assets/addChart.svg";
import history from "../../../shared/assets/history.svg";
import setting from "../../../shared/assets/settings.svg";
import { setPendingOcrFile } from "../../../shared/lib/pending-ocr-file";

const navItems = [
  { to: "/predict", label: "Расчет", icon: addChart },
  { to: "/history", label: "История", icon: history },
  { to: "/settings", label: "Настройки", icon: setting },
];

export function SideNavigation() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenOcrChooser = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleOcrFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;

      const fileName = file.name.toLowerCase();
      const isSupportedMime =
        file.type === "image/png" || file.type === "image/jpeg";
      const isSupportedExt =
        fileName.endsWith(".png") ||
        fileName.endsWith(".jpg") ||
        fileName.endsWith(".jpeg");

      if (!isSupportedMime && !isSupportedExt) {
        navigate("/predict", {
          state: {
            ocrError: "Поддерживаются только файлы PNG и JPEG для OCR.",
          },
        });
        return;
      }

      setPendingOcrFile(file);
      navigate("/predict");
    },
    [navigate],
  );

  return (
    <aside
      className="h-fit lg:sticky lg:top-1/2 lg:-translate-y-1/2"
      aria-label="Боковая навигация"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleOcrFileChange}
      />
      <nav className="grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `inline-flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-2xl px-3 py-3 text-center text-[14px] font-medium transition ${
                isActive
                  ? "bg-accent/15 text-txt"
                  : "bg-white/5 text-muted hover:bg-white/10 hover:text-txt"
              }`
            }
            title={item.label}
            aria-label={item.label}
          >
            {({ isActive }) => (
              <>
                <span
                  className="inline-grid size-[42px] place-items-center rounded-xl bg-white/5"
                  aria-hidden="true"
                >
                  <img
                    src={item.icon}
                    alt=""
                    className={
                      isActive
                        ? "size-[42px] [filter:var(--nav-icon-filter-active)]"
                        : "size-[42px] [filter:var(--nav-icon-filter)]"
                    }
                  />
                </span>
                <span className="leading-tight">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={handleOpenOcrChooser}
          className="inline-flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-2xl bg-white/5 px-3 py-3 text-center text-[14px] font-medium text-muted transition hover:bg-white/10 hover:text-txt"
          title="Распознать анкету"
          aria-label="Распознать анкету"
        >
          <span
            className="inline-grid size-[42px] place-items-center rounded-xl bg-white/5"
            aria-hidden="true"
          >
            <img
              src={addChart}
              alt=""
              className="size-[42px] [filter:var(--nav-icon-filter)]"
            />
          </span>
          <span className="leading-tight">Распознать анкету</span>
        </button>
      </nav>
    </aside>
  );
}
