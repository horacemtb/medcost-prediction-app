import { useEffect, useMemo, useRef, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { KitButton } from "../kit";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  kicker?: string;
  closeLabel?: string;
};

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  className = "",
  kicker,
  closeLabel = "Закрыть",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const focusableSelector = useMemo(
    () =>
      [
        "button:not([disabled])",
        "[href]",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])",
      ].join(", "),
    [],
  );

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      const firstFocusable =
        dialogRef.current?.querySelector<HTMLElement>(focusableSelector);
      firstFocusable?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = "";
      previousFocusRef.current?.focus?.();
    };
  }, [focusableSelector, open]);

  if (!open || typeof document === "undefined") return null;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }

    if (event.key !== "Tab" || !dialogRef.current) return;

    const focusables = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
    ).filter(
      (element) =>
        !element.hasAttribute("disabled") && element.offsetParent !== null,
    );

    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-[#13233d]/35 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={`w-full max-w-[520px] rounded-[28px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(243,246,251,0.96)_100%)] p-5 shadow-[0_24px_80px_rgba(20,36,64,0.18)] ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {kicker ? (
              <p className="m-0 text-ui-xs font-semibold uppercase tracking-[0.18em] text-[#6b7d99]">
                {kicker}
              </p>
            ) : null}
            <h2 className="m-0 mt-1 text-ui-lg font-semibold text-[#1a2741]">
              {title}
            </h2>
          </div>
          <KitButton
            type="button"
            variant="ghost"
            size={24}
            className="size-10 rounded-full border border-red-200/80 bg-red-50/85 p-0 text-red-600 shadow-sm hover:border-red-300 hover:bg-red-100/90"
            aria-label={closeLabel}
            title={closeLabel}
            onClick={onClose}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M5 5 15 15" />
              <path d="M15 5 5 15" />
            </svg>
          </KitButton>
        </div>

        <div className="mt-4 text-ui-sm text-[#445775]">{children}</div>

        {footer ? (
          <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-[#dce4ef] pt-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
