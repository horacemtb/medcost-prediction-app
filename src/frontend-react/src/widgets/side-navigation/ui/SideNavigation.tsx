import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/predict", label: "Расчет", icon: "+" },
  { to: "/history", label: "История", icon: "◫" },
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
            <span className="side-nav-link-icon" aria-hidden="true">{item.icon}</span>
            <span className="side-nav-link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="side-nav-widget side-nav-footer">
        <NavLink to="/settings" className={({ isActive }) => `side-nav-item ${isActive ? "active" : ""}`} title="Настройки" aria-label="Настройки">
          <span>⚙</span>
        </NavLink>
      </div>
    </aside>
  );
}
