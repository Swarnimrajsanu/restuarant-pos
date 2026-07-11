'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

// ─── Toast Types ───────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  exiting?: boolean;
}

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ─── Toast Icon & Style Mapping ────────────────────────────────

const toastConfig: Record<ToastType, {
  icon: React.ElementType;
  bg: string;
  border: string;
  text: string;
  iconColor: string;
}> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    iconColor: 'text-emerald-500',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    iconColor: 'text-red-500',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    iconColor: 'text-blue-500',
  },
};

// ─── Single Toast Component ────────────────────────────────────

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  return (
    <div
      className={`
        flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg
        ${config.bg} ${config.border}
        ${toast.exiting ? 'animate-toast-exit' : 'animate-toast-enter'}
        min-w-[300px] max-w-[420px]
      `}
      role="alert"
    >
      <Icon className={`size-5 shrink-0 ${config.iconColor}`} />
      <p className={`flex-1 text-sm font-medium ${config.text}`}>
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className={`shrink-0 rounded-md p-1 transition-colors hover:bg-black/5 ${config.text}`}
        aria-label="Dismiss notification"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

// ─── Toast Provider ────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    // Trigger exit animation first
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    // Remove after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType) => {
      const id = `toast-${++counterRef.current}-${Date.now()}`;
      setToasts((prev) => [...prev, { id, message, type }]);

      // Auto-dismiss after 3 seconds
      setTimeout(() => dismiss(id), 3000);
    },
    [dismiss]
  );

  const success = useCallback(
    (message: string) => addToast(message, 'success'),
    [addToast]
  );
  const error = useCallback(
    (message: string) => addToast(message, 'error'),
    [addToast]
  );
  const info = useCallback(
    (message: string) => addToast(message, 'info'),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}

      {/* Toast container — fixed bottom-right */}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>

      {/* Inline keyframe styles for toast animations */}
      <style jsx global>{`
        @keyframes toast-enter {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes toast-exit {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
        }

        .animate-toast-enter {
          animation: toast-enter 0.3s ease-out forwards;
        }

        .animate-toast-exit {
          animation: toast-exit 0.2s ease-in forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
