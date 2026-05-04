import { forwardRef, type InputHTMLAttributes } from "react";

type KitInputProps = InputHTMLAttributes<HTMLInputElement>;

export const KitInput = forwardRef<HTMLInputElement, KitInputProps>(function KitInput({ className = "", ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`h-8 w-full rounded-xl border border-line/70 bg-transparent px-3 text-[14px] text-txt outline-none transition placeholder:[color:var(--placeholder)] focus:border-accent/70 focus:ring-2 focus:ring-accent/25 ${className}`.trim()}
      {...props}
    />
  );
});
