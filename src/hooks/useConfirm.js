import { useUiStore } from '../store/uiStore';

export function useConfirm() {
  return useUiStore((state) => state.askConfirmation);
}

