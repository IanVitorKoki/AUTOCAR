import { LoaderCircle } from 'lucide-react';

function LoadingSpinner({ label = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="rounded-full bg-brand-50 p-4 text-brand-600">
        <LoaderCircle className="h-6 w-6 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

export default LoadingSpinner;

