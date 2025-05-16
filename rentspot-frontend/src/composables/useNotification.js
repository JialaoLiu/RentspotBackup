import { useToast } from 'vue-toastification';

export function useNotification() {
  const toast = useToast();

  return {
    success: (msg, opts = {}) => toast.success(msg, opts),
    error: (msg, opts = {}) => toast.error(msg, opts),
    info: (msg, opts = {}) => toast.info(msg, opts),
    warning: (msg, opts = {}) => toast.warning(msg, opts),
    show: (msg, opts = {}) => toast(msg, opts)
  };
}