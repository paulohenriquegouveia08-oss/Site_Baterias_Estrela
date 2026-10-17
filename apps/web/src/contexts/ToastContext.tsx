import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Trash2,
  HelpCircle,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ConfirmModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void | Promise<void>;
}

interface ToastContextValue {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  confirm: (options: ConfirmModalOptions) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalOptions | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 4500) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => showToast('success', title, message),
    [showToast]
  );
  const error = useCallback(
    (title: string, message?: string) => showToast('error', title, message),
    [showToast]
  );
  const warning = useCallback(
    (title: string, message?: string) => showToast('warning', title, message),
    [showToast]
  );
  const info = useCallback(
    (title: string, message?: string) => showToast('info', title, message),
    [showToast]
  );

  const confirm = useCallback((options: ConfirmModalOptions) => {
    setConfirmModal(options);
  }, []);

  // Intercepta window.alert nativo para que nada mostre pop-up cinza feio do navegador
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message: any) => {
      const text = typeof message === 'string' ? message : JSON.stringify(message);
      showToast('info', 'Aviso da Loja', text);
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [showToast]);

  const handleConfirmAction = async () => {
    if (!confirmModal) return;
    try {
      setConfirmLoading(true);
      await confirmModal.onConfirm();
      setConfirmModal(null);
    } catch (err: any) {
      error('Falha na operação', err?.message || 'Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, confirm }}>
      {children}

      {/* RECIPIENTE FLUTUANTE DE NOTIFICAÇÕES (TOASTS) COM IDENTIDADE DO SITE */}
      <div
        className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const isError = t.type === 'error';
          const isSuccess = t.type === 'success';
          const isWarning = t.type === 'warning';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-3 flex items-start gap-3.5 ${
                isError
                  ? 'bg-[#18181B]/95 border-estrela-red/80 shadow-estrela-red/20 text-white'
                  : isSuccess
                  ? 'bg-[#18181B]/95 border-emerald-500/80 shadow-emerald-500/20 text-white'
                  : isWarning
                  ? 'bg-[#18181B]/95 border-amber-500/80 shadow-amber-500/20 text-white'
                  : 'bg-[#18181B]/95 border-blue-500/80 shadow-blue-500/20 text-white'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isError && <AlertTriangle className="w-5 h-5 text-estrela-red" />}
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isWarning && <AlertCircle className="w-5 h-5 text-amber-400" />}
                {t.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <h5 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-snug">
                  {t.title}
                </h5>
                {t.message && (
                  <p className="text-xs text-estrela-gray-300 mt-0.5 leading-relaxed break-words">
                    {t.message}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="text-estrela-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10 shrink-0"
                title="Fechar notificação"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL DE CONFIRMAÇÃO COM A IDENTIDADE DO SITE (SUBSTITUI window.confirm) */}
      {confirmModal && (
        <div className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-estrela-dark border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  confirmModal.isDanger !== false
                    ? 'bg-estrela-red/20 text-estrela-red border border-estrela-red/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {confirmModal.isDanger !== false ? (
                  <Trash2 className="w-6 h-6" />
                ) : (
                  <HelpCircle className="w-6 h-6" />
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-white">{confirmModal.title}</h4>
                <p className="text-xs text-estrela-gray-300 leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                disabled={confirmLoading}
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2.5 rounded-xl bg-estrela-card hover:bg-white/10 text-xs font-semibold text-estrela-gray-300 hover:text-white transition"
              >
                {confirmModal.cancelText || 'Cancelar'}
              </button>

              <button
                type="button"
                disabled={confirmLoading}
                onClick={handleConfirmAction}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center gap-2 shadow-lg ${
                  confirmModal.isDanger !== false
                    ? 'bg-estrela-red hover:bg-estrela-red-hover shadow-estrela-red/20'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {confirmLoading ? (
                  <span className="animate-spin text-xs">↻ Processando...</span>
                ) : (
                  confirmModal.confirmText || 'Confirmar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser utilizado dentro de um ToastProvider');
  }
  return context;
};
