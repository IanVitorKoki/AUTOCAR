function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="panel-muted section-grid flex min-h-[280px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-5 rounded-3xl bg-white p-4 text-brand-600 shadow-soft">
        <Icon className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export default EmptyState;

