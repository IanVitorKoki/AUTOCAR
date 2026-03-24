import { Compass, Home, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonStyles } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';

function NotFound() {
  usePageTitle('Página não encontrada');

  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="panel max-w-2xl p-8 text-center sm:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-brand-50 text-brand-700">
          <Compass className="h-10 w-10" />
        </div>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">Erro 404</p>
        <h1 className="mt-4 text-4xl font-bold text-slate-900">Página não encontrada</h1>
        <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
          O endereço informado não existe ou pode ter sido movido. Use um dos atalhos abaixo para voltar ao fluxo principal.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {isAuthenticated ? (
            <Link to="/dashboard" className={buttonStyles({ variant: 'primary' })}>
              <Home className="h-4 w-4" />
              Ir para o dashboard
            </Link>
          ) : (
            <Link to="/login" className={buttonStyles({ variant: 'primary' })}>
              <LogIn className="h-4 w-4" />
              Ir para o login
            </Link>
          )}
          <Link to="/vehicles" className={buttonStyles({ variant: 'secondary' })}>
            Ver veículos
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
