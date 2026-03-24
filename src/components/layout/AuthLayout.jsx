import { Link } from 'react-router-dom';

function AuthLayout({ title, subtitle, footerText, footerLinkLabel, footerTo, children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.32),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.22),transparent_25%),linear-gradient(180deg,#020617,#0f172a)]" />
      <div className="absolute inset-0 section-grid opacity-20" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-4 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div className="hidden rounded-[2rem] border border-white/10 bg-white/5 p-10 text-white shadow-panel backdrop-blur lg:block">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold tracking-wide text-slate-100">
            <span className="h-2.5 w-2.5 rounded-full bg-accent-400" />
            AutoCare Portfolio App
          </div>

          <div className="mt-12 max-w-xl">
            <h1 className="text-balance text-5xl font-bold leading-tight">
              Controle total da vida útil do seu veículo em uma interface pronta para produto real.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Acompanhe gastos, manutenções e desempenho da sua garagem com uma experiência limpa, rápida e organizada.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-300">Gestão</p>
              <p className="mt-3 text-2xl font-bold">Veículos</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-300">Histórico</p>
              <p className="mt-3 text-2xl font-bold">Manutenções</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-300">Saúde financeira</p>
              <p className="mt-3 text-2xl font-bold">Gastos</p>
            </div>
          </div>
        </div>

        <div className="panel mx-auto w-full max-w-lg p-6 sm:p-8">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
              AutoCare
            </Link>
            <h2 className="mt-8 text-3xl font-bold text-slate-900">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">{subtitle}</p>
          </div>

          <div className="mt-8">{children}</div>

          <p className="mt-8 text-center text-sm text-slate-500">
            {footerText}{' '}
            <Link to={footerTo} className="font-semibold text-brand-700 transition hover:text-brand-800">
              {footerLinkLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;

