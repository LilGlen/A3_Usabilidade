import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-error" />;
      case 'info':
        return <Info className="w-5 h-5 text-accent-purple" />;
      default:
        return <Info className="w-5 h-5 text-accent-purple" />;
    }
  };

  const getBgColor = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'border-success';
      case 'error':
        return 'border-error';
      case 'info':
        return 'border-accent-purple';
      default:
        return 'border-accent-purple';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div 
        className="fixed top-4 right-4 z-50 space-y-2"
        role="region"
        aria-label="Notificações"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`bg-secondary-bg border-l-4 ${getBgColor(toast.type)} p-4 rounded-lg shadow-lg max-w-sm animate-in slide-in-from-right duration-300`}
            role="alert"
            aria-describedby={`toast-${toast.id}-message`}
          >
            <div className="flex items-start space-x-3">
              {getIcon(toast.type)}
              <div className="flex-1">
                <h4 className="text-main-text font-medium">{toast.title}</h4>
                {toast.message && (
                  <p 
                    id={`toast-${toast.id}-message`}
                    className="text-secondary-text text-sm mt-1"
                  >
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-secondary-text hover:text-main-text transition-colors p-1 rounded"
                aria-label="Fechar notificação"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}