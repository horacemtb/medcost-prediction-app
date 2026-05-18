import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import {
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
        "flex min-h-0 overflow-hidden bg-white transition-[padding,width] duration-300 ease-in-out md:min-h-screen md:flex-col md:justify-between md:py-7",
        collapsed
          ? "flex-row items-center justify-between gap-3 px-4 py-3 md:px-6"
          : "flex-col justify-between px-6 py-7",
      ].join(" "),
    [collapsed],
  );

  return (
    <aside className={asideClassName}>
      <div className={collapsed ? "flex items-center gap-3 md:block" : ""}>
        <div
          className={
            collapsed
              ? "flex justify-center px-0 md:mb-14 md:grid md:w-[244px] md:grid-cols-[48px_164px] md:items-center md:gap-8"
              : "mb-14 grid w-[244px] min-w-0 grid-cols-[48px_164px] items-center gap-8"
          }
        >
          <span className="inline-grid size-12 place-items-center overflow-hidden rounded-xl bg-[#0d1f49]">
            <img src="/favicon.svg" alt="" className="size-11" aria-hidden="true" />
          </span>
          <div
            className={[
              "w-[164px] min-w-[164px] overflow-hidden whitespace-nowrap",
              collapsed ? "hidden md:block" : "",
            ].join(" ")}
            aria-hidden={collapsed}
          >
              <p className="m-0 text-[1.5rem] font-extrabold leading-none text-[#1f2c44]">
                PrecisionAI
              </p>
              <p className="m-0 mt-1 text-[0.68rem] font-semibold uppercase leading-4 tracking-[0.08em] text-[#8391aa]">
                Cost Intelligence
              </p>
          </div>
        </div>

        <nav className={collapsed ? "flex flex-row justify-center gap-3 md:grid md:grid-cols-1 md:gap-0 md:justify-items-start" : "grid grid-cols-1 gap-0"}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "relative inline-flex min-h-12 items-center overflow-hidden rounded-xl py-2 text-ui-nav transition duration-300 ease-in-out",
                  collapsed
                    ? "w-12 justify-center px-0 md:grid md:w-[244px] md:grid-cols-[48px_164px] md:justify-start md:gap-8"
                    : "w-full gap-3 px-2 md:grid md:w-[244px] md:grid-cols-[48px_164px] md:gap-8 md:px-0",
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
                    className="inline-grid size-5 place-items-center md:size-12"
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
                  <span className={collapsed ? "hidden whitespace-nowrap leading-tight md:block" : "whitespace-nowrap leading-tight"}>
                    {item.label}
                  </span>
                  {isActive ? (
                    <span className={collapsed ? "absolute bottom-0 left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-full bg-[#4f6ff2] md:bottom-auto md:left-[68px] md:top-1/2 md:h-8 md:w-[3px] md:-translate-x-0 md:-translate-y-1/2" : "absolute right-0 top-1/2 h-12 w-[3px] -translate-y-1/2 rounded-full bg-[#4f6ff2]"} />
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="relative z-20 h-10 w-10 md:w-[244px] md:self-start">
        <KitButton
          type="button"
          variant="ghost"
          size={24}
          className={[
            "absolute left-0 top-0 h-10 w-10 rounded-full border border-line/70 bg-white/80 transition-transform duration-300 ease-in-out",
            collapsed ? "md:translate-x-1" : "md:translate-x-[200px]",
          ].join(" ")}
          onClick={onToggle}
          aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"}
          title={collapsed ? "Развернуть меню" : "Свернуть меню"}
        >
          <ChevronRight
            className={[
              "size-4 transition-transform duration-300 ease-in-out",
              collapsed ? "rotate-0" : "rotate-180",
            ].join(" ")}
          />
        </KitButton>
      </div>
    </aside>
  );
}
