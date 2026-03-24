function FormField({ label, htmlFor, error, hint, required = false, children }) {
  return (
    <label htmlFor={htmlFor} className="block">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        {required ? (
          <span className="text-xs font-semibold uppercase tracking-wide text-accent-600">
            Obrigatório
          </span>
        ) : null}
      </div>
      {children}
      {error ? <p className="mt-2 text-sm font-medium text-red-600">{error}</p> : null}
      {!error && hint ? <p className="mt-2 text-sm text-slate-500">{hint}</p> : null}
    </label>
  );
}

export default FormField;
