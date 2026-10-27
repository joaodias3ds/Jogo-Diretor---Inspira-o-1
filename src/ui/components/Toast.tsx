/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

export interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icon = {
          success: <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />,
          error: <XCircle className="text-red-400 shrink-0" size={18} />,
          warning: <AlertCircle className="text-amber-400 shrink-0" size={18} />,
          info: <Info className="text-cyan-400 shrink-0" size={18} />,
        }[toast.type];

        const border = {
          success: 'border-emerald-500/30',
          error: 'border-red-500/30',
          warning: 'border-amber-500/30',
          info: 'border-cyan-500/30',
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/95 backdrop-blur-md border ${border} shadow-xl shadow-black/40 text-slate-100 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2`}
          >
            {icon}
            <div className="flex-1 text-xs">
              <div className="font-semibold text-white">{toast.title}</div>
              {toast.message && <div className="text-slate-400 mt-0.5">{toast.message}</div>}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
