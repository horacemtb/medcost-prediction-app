import { forwardRef, type InputHTMLAttributes } from "react";

type KitInputProps = InputHTMLAttributes<HTMLInputElement>;

export const KitInput = forwardRef<HTMLInputElement, KitInputProps>(function KitInput({ className = "", ...props }, ref) {
  return (
    <input
      ref={ref}
      placeholder="Не указано"
      className={`h-10 w-full rounded-xl border border-line/70 bg-white/70 px-3 text-ui-sm text-txt outline-none transition placeholder:[color:var(--placeholder)] focus:border-accent/70 focus:ring-2 focus:ring-accent/25 ${className}`.trim()}
      {...props}
    />
  );
});
