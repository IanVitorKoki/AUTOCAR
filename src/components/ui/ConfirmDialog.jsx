import { AlertTriangle } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import Button from './Button';

export function ConfirmDialog() {
  const dialog = useUiStore((state) => state.confirmDialog);

  if (!dialog.open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="panel w-full max-w-md p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-red-50 p-3 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900">{dialog.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{dialog.description}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={dialog.onCancel}>
            {dialog.cancelLabel}
          </Button>
          <Button variant={dialog.tone === 'danger' ? 'danger' : 'primary'} onClick={dialog.onConfirm}>
            {dialog.confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

