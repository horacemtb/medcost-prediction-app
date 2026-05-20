import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      closeButton
      richColors
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "toast-card border border-line/70 bg-white text-txt shadow-lg",
          content: "toast-card__content",
          icon: "toast-card__icon",
          title: "text-ui-sm font-semibold",
          description: "toast-card__description scroll-transparent text-ui-xs text-muted",
          closeButton: "toast-card__close",
        },
      }}
    />
  );
}
