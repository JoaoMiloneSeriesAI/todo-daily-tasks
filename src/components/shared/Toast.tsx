import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    // Timer is handled solely in the ToastItem component — no store-level timer
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

// Helper function for easy toast usage
export const toast = {
  success: (message: string, duration?: number) => {
    useToastStore.getState().addToast({ type: 'success', message, duration });
  },
  error: (message: string, duration?: number) => {
    useToastStore.getState().addToast({ type: 'error', message, duration });
  },
  warning: (message: string, duration?: number) => {
    useToastStore.getState().addToast({ type: 'warning', message, duration });
  },
  info: (message: string, duration?: number) => {
    useToastStore.getState().addToast({ type: 'info', message, duration });
  },
};

const ToastIcon = ({ type }: { type: ToastType }) => {
  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  };
  return icons[type];
};

/// <summary>
/// Individual toast item with auto-dismiss, pause-on-hover, and dark mode support.
/// Timer is managed solely here — no duplicate timer in the store.
/// </summary>
const ToastItem = ({ toast: toastItem }: { toast: Toast }) => {
  const { removeToast } = useToastStore();
  const [isPaused, setIsPaused] = useState(false);
  const duration = toastItem.duration || 3000;

  const styles = {
    success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100',
    error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
    warning: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100',
    info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
  };

  const iconColors = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  useEffect(() => {
    if (isPaused) return;

    const timer = setTimeout(() => {
      removeToast(toastItem.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toastItem.id, duration, removeToast, isPaused]);

  const handleMouseEnter = useCallback(() => setIsPaused(true), []);
  const handleMouseLeave = useCallback(() => setIsPaused(false), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role={toastItem.type === 'error' ? 'alert' : 'status'}
      aria-live={toastItem.type === 'error' ? 'assertive' : 'polite'}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-sm ${styles[toastItem.type]}`}
    >
      <div className={iconColors[toastItem.type]}>
        <ToastIcon type={toastItem.type} />
      </div>
      <p className="flex-1 text-sm font-medium">{toastItem.message}</p>
      <button
        onClick={() => removeToast(toastItem.id)}
        className="opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

export function ToastContainer() {
  const { toasts } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none" aria-live="polite">
      <AnimatePresence>
        {toasts.map((toastItem) => (
          <div key={toastItem.id} className="pointer-events-auto">
            <ToastItem toast={toastItem} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
