type KitLoaderProps = {
  label?: string;
  className?: string;
};

export function KitLoader({ label = "Загрузка...", className = "" }: KitLoaderProps) {
  return (
    <div className={`kit-loader inline-flex items-center gap-2 text-ui-sm text-muted ${className}`.trim()} role="status" aria-live="polite" aria-busy="true">
      <span className="kit-loader__spinner inline-block size-4 animate-spin rounded-full border-2 border-line border-t-accent" aria-hidden="true" />
      <span className="kit-loader__label">{label}</span>
    </div>
  );
}

