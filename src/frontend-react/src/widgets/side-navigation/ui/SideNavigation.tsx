import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardPlus,
  History as HistoryIcon,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { KitButton } from "../../../shared/ui/kit/KitButton";

type SideNavigationProps = {
  collapsed: boolean;
  onToggle: () => void;
};

const navItems = [
  { to: "/dashboard", label: "Статистика", icon: LayoutDashboard },
  { to: "/predict", label: "Новый прогноз", icon: ClipboardPlus },
  { to: "/history", label: "История", icon: HistoryIcon },
  { to: "/settings", label: "Настройки", icon: Settings },
];

export function SideNavigation({ collapsed, onToggle }: SideNavigationProps) {
  const asideClassName = useMemo(
    () =>
      [
        "flex min-h-screen flex-col justify-between bg-white py-7 transition-[padding,width] duration-200",
        collapsed ? "px-3" : "px-6",
      ].join(" "),
    [collapsed],
  );

  return (
    <aside className={asideClassName}>
      <div>
        <div className={collapsed ? "mb-12 flex justify-center px-0" : "mb-14 flex items-center gap-3 px-2"}>
          <span className="inline-grid size-11 place-items-center overflow-hidden rounded-xl bg-[#0d1f49]">
            <img src="/favicon.svg" alt="" className="size-11" aria-hidden="true" />
          </span>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="m-0 text-ui-brand tracking-tight text-[#1f2c44]">
                PrecisionAI
              </p>
              <p className="m-0 text-ui-xs font-semibold uppercase tracking-[0.26em] text-[#8391aa]">
                Cost Intelligence
              </p>
            </div>
          ) : null}
        </div>

        <nav className={collapsed ? "grid grid-cols-1 justify-items-center gap-3" : "grid grid-cols-1 gap-3"}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "relative inline-flex min-h-12 items-center rounded-xl py-2 text-ui-nav transition",
                  collapsed ? "justify-center px-0 w-12" : "gap-3 px-3 w-full",
                  isActive
                    ? "text-[#4f6ff2]"
                    : "text-[#78879e] hover:bg-white/80 hover:text-[#526683]",
                ].join(" ")
              }
              title={item.label}
              aria-label={item.label}
            >
              {({ isActive }) => (
                <>
                  <span
                    className="inline-grid size-5 place-items-center"
                    aria-hidden="true"
                  >
                    <item.icon
                      className={
                        isActive
                          ? "size-5 text-[#4f6ff2]"
                          : "size-5 text-[#6f7e98]"
                      }
                      strokeWidth={2.2}
                    />
                  </span>
                  {!collapsed ? <span className="leading-tight">{item.label}</span> : <span className="sr-only">{item.label}</span>}
                  {isActive ? (
                    <span className={collapsed ? "absolute right-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-full bg-[#4f6ff2]" : "absolute right-0 top-1/2 h-12 w-[3px] -translate-y-1/2 rounded-full bg-[#4f6ff2]"} />
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className={collapsed ? "flex justify-center" : "flex justify-end pr-1"}>
        <KitButton
          type="button"
          variant="ghost"
          size={24}
          className={collapsed ? "h-10 w-10 rounded-full border border-line/70 bg-white/80" : "h-10 w-10 rounded-full border border-line/70 bg-white/80"}
          onClick={onToggle}
          aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"}
          title={collapsed ? "Развернуть меню" : "Свернуть меню"}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </KitButton>
      </div>
    </aside>
  );
}
