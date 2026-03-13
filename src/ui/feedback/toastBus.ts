export type ToastPayload = {
  message: string;
  severity?: "success" | "info" | "warning" | "error";
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
};

type Listener = (payload: ToastPayload) => void;

const listeners = new Set<Listener>();

export const toastBus = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  show(payload: ToastPayload) {
    listeners.forEach((listener) => listener(payload));
  },
};
