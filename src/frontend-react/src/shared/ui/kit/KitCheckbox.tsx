import type { InputHTMLAttributes } from "react";

type KitCheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function KitCheckbox({ className = "", label, ...props }: KitCheckboxProps) {
  const isChecked = props.checked === true;

  return (
    <label
      className={`kit-checkbox group inline-flex w-fit justify-self-start cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm text-txt transition hover:bg-white/10 ${
        isChecked
          ? "border-emerald-500/70 bg-emerald-500/12"
          : "border-line/60 bg-white/5 hover:border-emerald-500/70"
      } ${className}`.trim()}
    >
      <input type="checkbox" className="sr-only" {...props} />
      <span
        aria-hidden="true"
        className={`inline-grid size-4 place-items-center rounded border ${
          isChecked ? "border-transparent" : "border-line/70 group-hover:border-emerald-500/70"
        }`}
      >
        {isChecked ? <span className="text-xs leading-none text-emerald-500">✓</span> : null}
      </span>
      <span className="kit-checkbox__label leading-snug">{label}</span>
    </label>
  );
}
