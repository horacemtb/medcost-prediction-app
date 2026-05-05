import type { ButtonHTMLAttributes } from "react";

type KitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "danger" | "ghost" | "tab" | "sort" | "menu" | "icon";
  size?: 24 | 32 | 42;
};

export function KitButton({ className = "", variant = "default", size = 32, ...props }: KitButtonProps) {
  const base =
    "kit-button inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border px-3 text-ui-sm font-medium leading-none transition-colors transition-shadow duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-0 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60";

  const sizes: Record<24 | 32 | 42, string> = {
    24: "h-9 min-w-9 px-2 text-ui-xs",
    32: "h-9 min-w-9 px-3",
    42: "h-9 min-w-10 px-3",
  };

  const variants: Record<NonNullable<KitButtonProps["variant"]>, string> = {
    default: "border-line/70 bg-white/5 text-txt shadow-sm hover:bg-white/10",
    primary: "border-accent/80 bg-accent text-white shadow-sm hover:brightness-110",
    danger: "border-red-500/80 bg-red-600 text-white shadow-sm hover:bg-red-500",
    ghost: "border-transparent bg-transparent text-txt hover:bg-white/10",
    tab: "border-line/60 bg-white/5 text-muted hover:bg-white/10 hover:text-txt aria-selected:border-accent/70 aria-selected:bg-accent/20 aria-selected:text-txt",
    sort: "border-transparent bg-transparent px-0 text-muted shadow-none hover:text-txt",
    menu: "border-line/70 bg-white/8 text-txt shadow-sm hover:bg-white/15",
    icon: "border-transparent bg-transparent text-muted shadow-none hover:text-txt [&>img]:h-5 [&>img]:w-5 [&>img]:[filter:var(--nav-icon-filter)]",
  };

  return (
    <button
      className={`${base} kit-button--${variant} kit-button--size-${size} ${sizes[size]} ${variants[variant]} ${className}`.trim()}
      {...props}
    />
  );
}
