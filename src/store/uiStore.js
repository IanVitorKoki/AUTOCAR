import { create } from 'zustand';

const emptyConfirmDialog = {
  open: false,
  title: '',
  description: '',
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
  tone: 'danger',
  onConfirm: null,
  onCancel: null,
};

export const useUiStore = create((set, get) => ({
  toasts: [],
  confirmDialog: emptyConfirmDialog,

  addToast: ({ type = 'info', title, message, duration = 4200 }) => {
    const id = crypto.randomUUID();

    set((state) => ({
      toasts: [...state.toasts, { id, type, title, message }],
    }));

    globalThis.setTimeout(() => {
      get().dismissToast(id);
    }, duration);

    return id;
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  askConfirmation: ({ title, description, confirmLabel, cancelLabel, tone }) =>
    new Promise((resolve) => {
      const closeDialog = () => {
        set({ confirmDialog: emptyConfirmDialog });
      };

      set({
        confirmDialog: {
          open: true,
          title,
          description,
          confirmLabel: confirmLabel ?? 'Confirmar',
          cancelLabel: cancelLabel ?? 'Cancelar',
          tone: tone ?? 'danger',
          onConfirm: () => {
            resolve(true);
            closeDialog();
          },
          onCancel: () => {
            resolve(false);
            closeDialog();
          },
        },
      });
    }),
}));

