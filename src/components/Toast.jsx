"use client";

import { CheckCircle, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function Toast({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={onRemove} />)}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 10);
    const t2 = setTimeout(() => {
      setShow(false);
      setTimeout(() => onRemove(toast.id), 250);
    }, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [toast.id, onRemove]);

  const isOk = toast.type === "success";

  return (
    <div className={`relative overflow-hidden flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm border backdrop-blur-xl
                     transition-all duration-250 min-w-64 max-w-90 shadow-lg
                     ${show ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}
                     ${isOk ? "bg-emerald-500/8 border-emerald-500/12 text-emerald-400 shadow-emerald-900/10"
                            : "bg-red-500/8 border-red-500/12 text-red-400 shadow-red-900/10"}`}>
      {isOk ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
      <span className="flex-1 text-xs font-medium">{toast.message}</span>
      <button onClick={() => { setShow(false); setTimeout(() => onRemove(toast.id), 250); }}
              className="text-gray-600 hover:text-gray-400 cursor-pointer">
        <X className="w-3.5 h-3.5" />
      </button>

      
      <div className={`absolute bottom-0 left-0 h-0.5 toast-progress ${isOk ? "bg-emerald-500/40" : "bg-red-500/40"}`} />
    </div>
  );
}
