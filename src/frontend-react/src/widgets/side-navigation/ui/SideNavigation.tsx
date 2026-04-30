import { NavLink } from "react-router-dom";
import addChart from "../../../shared/assets/addChart.svg";
import history from "../../../shared/assets/history.svg";
import setting from "../../../shared/assets/settings.svg";

const navItems = [
  { to: "/predict", label: "Расчет", icon: addChart },
  { to: "/history", label: "История", icon: history },
];

export function SideNavigation() {
  return (
    <aside className="side-nav" aria-label="Боковая навигация">
      <nav className="side-nav-widget side-nav-list">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `side-nav-link ${isActive ? "active" : ""}`}
            title={item.label}
            aria-label={item.label}
          >
            <span className="side-nav-link-icon" aria-hidden="true">
              <img src={item.icon} alt="" />
            </span>
            <span className="side-nav-link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="side-nav-widget side-nav-footer">
        <NavLink
          to="/settings"
          className={({ isActive }) => `side-nav-item ${isActive ? "active" : ""}`}
          title="Настройки"
          aria-label="Настройки"
        >
          <img src={setting} alt="" />
        </NavLink>
      </div>
    </aside>
  );
}
