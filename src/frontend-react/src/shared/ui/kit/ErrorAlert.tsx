type ErrorAlertProps = {
  message: string;
  className?: string;
};

export function ErrorAlert({ message, className = "" }: ErrorAlertProps) {
  return (
    <div className={`error mb-3 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200 ${className}`.trim()}>
      {message}
    </div>
  );
}

