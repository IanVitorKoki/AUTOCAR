import { CarFront, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { navItems } from '../../utils/constants';
import Button from '../ui/Button';

function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const handleLogout = async () => {
    await signOut();
    toast.success('Sessão encerrada com segurança.');
    navigate('/login', { replace: true });
  };

  const currentSection =
    navItems.find((item) =>
      item.label === 'Dashboard'
        ? location.pathname === item.to
        : location.pathname.startsWith(item.to),
    )?.label ?? 'AutoCare';

  const renderNavItems = () =>
    navItems.map((item, index) => {
      const Icon = item.icon;
      const isRootDashboard = item.to === '/dashboard';

      return (
        <NavLink
          key={`${item.label}-${index}`}
          to={item.to}
          end={isRootDashboard}
          onClick={() => setIsMenuOpen(false)}
          className={({ isActive }) =>
            `group flex items-start gap-3 rounded-2xl border px-4 py-3 transition ${
              isActive
                ? 'border-brand-200 bg-brand-50 text-brand-800'
                : 'border-transparent bg-transparent text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-900'
            }`
          }
        >
          <div className="rounded-2xl bg-white/80 p-2 shadow-sm">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">{item.label}</p>
            <p className="mt-1 text-sm text-current/70">{item.description}</p>
          </div>
        </NavLink>
      );
    });

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-[320px] shrink-0 border-r border-white/70 bg-slate-50/80 p-6 backdrop-blur xl:block">
          <div className="flex h-full flex-col">
            <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-panel">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3 text-brand-300">
                  <CarFront className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-bold">AutoCare</p>
                  <p className="text-sm text-slate-300">Gestão automotiva pessoal</p>
                </div>
              </div>
              <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-300">Perfil conectado</p>
                <p className="mt-2 text-xl font-semibold text-white">{userProfile?.name ?? 'Motorista'}</p>
                <p className="mt-1 text-sm text-slate-300">{userProfile?.email}</p>
              </div>
            </div>

            <nav className="mt-6 space-y-3">{renderNavItems()}</nav>

            <div className="mt-auto rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-sm font-semibold text-slate-500">Operação segura</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Seus dados ficam isolados por usuário com autenticação Firebase e regras de segurança no Firestore.
              </p>
              <Button className="mt-5 w-full" variant="secondary" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </aside>

        {isMenuOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-950/40 xl:hidden"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Fechar menu"
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[300px] transform border-r border-slate-200 bg-white p-5 transition duration-200 xl:hidden ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-slate-900">AutoCare</p>
              <p className="text-sm text-slate-500">{userProfile?.name ?? 'Motorista'}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-full bg-slate-100 p-2 text-slate-600"
              aria-label="Fechar navegação"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-8 space-y-3">{renderNavItems()}</nav>
          <Button className="mt-8 w-full" variant="secondary" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(true)}
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm xl:hidden"
                  aria-label="Abrir menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">AutoCare</p>
                  <h1 className="text-xl font-bold text-slate-900">{currentSection}</h1>
                </div>
              </div>

              <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:block">
                <p className="text-sm font-semibold text-slate-900">{userProfile?.name ?? 'Motorista'}</p>
                <p className="text-sm text-slate-500">{userProfile?.email}</p>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;

