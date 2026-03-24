import { useUiStore } from '../store/uiStore';

export function useToast() {
  const addToast = useUiStore((state) => state.addToast);

  return {
    success: (message, title = 'Tudo certo') =>
      addToast({
        type: 'success',
        title,
        message,
      }),
    error: (message, title = 'Não foi possível concluir') =>
      addToast({
        type: 'error',
        title,
        message,
      }),
    info: (message, title = 'Aviso') =>
      addToast({
        type: 'info',
        title,
        message,
      }),
  };
}

