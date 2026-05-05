type FieldMetaProps = {
  error?: string;
  hint?: string;
};

export function FieldMeta({ error, hint }: FieldMetaProps) {
  if (error) return <small className="field-error mt-1 block text-ui-xs text-red-400">{error}</small>;
  if (hint) return <small className="field-hint mt-1 block text-ui-xs text-muted">{hint}</small>;
  return null;
}

