"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect, useRef } from "react";

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = true }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onCancel(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-up"
      style={{ animationDuration: "0.15s" }}
    >
      <div className="glass-card w-full max-w-sm mx-4 p-6 animate-scale-in">
        <div className="flex items-start gap-3 mb-5">
          <div className={`p-2.5 rounded-xl shrink-0 ${danger ? "bg-red-500/8 ring-1 ring-red-500/10" : "bg-violet-500/8 ring-1 ring-violet-500/10"}`}>
            <AlertTriangle className={`w-5 h-5 ${danger ? "text-red-400" : "text-violet-400"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-sm">{title}</h3>
            <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">{message}</p>
          </div>
          <button onClick={onCancel} className="text-gray-600 hover:text-gray-400 cursor-pointer p-1 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="text-xs px-4 py-2 rounded-lg border border-white/6 text-gray-400
                       hover:bg-white/4 hover:text-gray-300 active:scale-[0.97] transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`text-xs px-5 py-2 rounded-lg font-semibold active:scale-[0.97] transition-all cursor-pointer
                       ${danger
                         ? "bg-red-500/12 text-red-400 hover:bg-red-500/20 border border-red-500/15"
                         : "bg-violet-500/12 text-violet-400 hover:bg-violet-500/20 border border-violet-500/15"}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
