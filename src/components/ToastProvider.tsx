"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  toast: {
    success: (message: string, title?: string, duration?: number) => void;
    error: (message: string, title?: string, duration?: number) => void;
    warning: (message: string, title?: string, duration?: number) => void;
    info: (message: string, title?: string, duration?: number) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", title?: string, duration = 3500) => {
      const id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      const newToast: ToastItem = { id, type, message, title, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toastHelpers = {
    success: (message: string, title?: string, duration?: number) =>
      showToast(message, "success", title, duration),
    error: (message: string, title?: string, duration?: number) =>
      showToast(message, "error", title, duration),
    warning: (message: string, title?: string, duration?: number) =>
      showToast(message, "warning", title, duration),
    info: (message: string, title?: string, duration?: number) =>
      showToast(message, "info", title, duration),
  };

  return (
    <ToastContext.Provider value={{ showToast, toast: toastHelpers, removeToast }}>
      {children}

      {/* FLOATING TOAST CONTAINER */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[99999] flex flex-col gap-2.5 max-w-[92vw] sm:max-w-md w-full pointer-events-none"
      >
        {toasts.map((t) => {
          const isSuccess = t.type === "success";
          const isError = t.type === "error";
          const isWarning = t.type === "warning";

          const bgBorder = isSuccess
            ? "bg-white/95 border-emerald-500/30 text-slate-800 shadow-emerald-500/10"
            : isError
            ? "bg-white/95 border-rose-500/30 text-slate-800 shadow-rose-500/10"
            : isWarning
            ? "bg-white/95 border-amber-500/30 text-slate-800 shadow-amber-500/10"
            : "bg-white/95 border-sky-500/30 text-slate-800 shadow-sky-500/10";

          const iconBg = isSuccess
            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
            : isError
            ? "bg-rose-50 text-rose-600 border border-rose-200"
            : isWarning
            ? "bg-amber-50 text-amber-600 border border-amber-200"
            : "bg-sky-50 text-sky-600 border border-sky-200";

          const defaultTitle = isSuccess
            ? "Thành công"
            : isError
            ? "Đã có lỗi xảy ra"
            : isWarning
            ? "Cảnh báo"
            : "Thông báo";

          return (
            <div
              key={t.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 transform animate-in fade-in slide-in-from-top-4 ${bgBorder}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold ${iconBg}`}>
                {isSuccess && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {isError && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {isWarning && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                {!isSuccess && !isError && !isWarning && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                  {t.title || defaultTitle}
                </div>
                <div className="text-sm font-medium text-slate-800 leading-snug break-words whitespace-pre-line">
                  {t.message}
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-700 p-1 -mr-1 rounded-lg transition shrink-0 cursor-pointer"
                title="Đóng"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
