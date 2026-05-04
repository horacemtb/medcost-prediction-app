import { NavLink } from "react-router-dom";
import addChart from "../../../shared/assets/addChart.svg";
import history from "../../../shared/assets/history.svg";
import setting from "../../../shared/assets/settings.svg";

const navItems = [
  { to: "/predict", label: "Расчет", icon: addChart },
  { to: "/history", label: "История", icon: history },
  { to: "/settings", label: "Настройки", icon: setting },
];

export function SideNavigation() {
  return (
    <aside className="h-fit lg:sticky lg:top-1/2 lg:-translate-y-1/2" aria-label="Боковая навигация">
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
                <span className="inline-grid size-[42px] place-items-center rounded-xl bg-white/5" aria-hidden="true">
                  <img
                    src={item.icon}
                    alt=""
                    className={isActive
                      ? "size-[42px] [filter:var(--nav-icon-filter-active)]"
                      : "size-[42px] [filter:var(--nav-icon-filter)]"}
                  />
                </span>
                <span className="leading-tight">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
