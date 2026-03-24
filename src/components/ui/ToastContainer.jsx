import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const toneMap = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-slate-200 bg-white text-slate-900',
};

export function ToastContainer() {
  const toasts = useUiStore((state) => state.toasts);
  const dismissToast = useUiStore((state) => state.dismissToast);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex justify-center px-4">
      <div className="flex w-full max-w-xl flex-col gap-3">
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type] ?? TriangleAlert;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 shadow-soft ${toneMap[toast.type]}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{toast.title}</p>
                  <p className="mt-1 text-sm opacity-80">{toast.message}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-full p-1 text-current/60 transition hover:bg-black/5 hover:text-current"
                aria-label="Fechar notificação"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

