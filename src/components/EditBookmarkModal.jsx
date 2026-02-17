"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function EditBookmarkModal({ bookmark, open, onSave, onClose }) {
  const [title, setTitle] = useState(bookmark?.title || "");
  const [url, setUrl] = useState(bookmark?.url || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const overlayRef = useRef(null);
  const titleRef = useRef(null);

  
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => titleRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open || !bookmark) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !url.trim()) {
      setError("Both fields need a value");
      return;
    }

    try {
      new URL(url.trim());
    } catch {
      setError("That URL doesn't look right");
      return;
    }

    setSaving(true);
    const ok = await onSave(bookmark.id, title.trim(), url.trim());
    setSaving(false);

    if (ok) onClose();
    else setError("Save failed, give it another shot");
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-up"
      style={{ animationDuration: "0.15s" }}
    >
      <form onSubmit={handleSave} className="glass-card w-full max-w-md mx-4 p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold text-sm">Edit bookmark</h3>
          <button type="button" onClick={onClose} className="text-gray-600 hover:text-gray-400 cursor-pointer p-1 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="text-red-400 text-xs bg-red-500/6 border border-red-500/10 px-3.5 py-2 rounded-lg mb-4 font-medium">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-gray-500 text-[11px] mb-1.5 uppercase tracking-wider">Title</label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-glow w-full bg-white/3 border border-white/6 text-white text-sm
                         px-3.5 py-2.5 rounded-xl placeholder:text-gray-600 focus:outline-none
                         focus:border-violet-500/30 focus:bg-white/4 transition-all"
              disabled={saving}
            />
          </div>
          <div>
            <label className="block text-gray-500 text-[11px] mb-1.5 uppercase tracking-wider font-medium">URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input-glow w-full bg-white/3 border border-white/6 text-white text-sm
                         px-3.5 py-2.5 rounded-xl placeholder:text-gray-600 focus:outline-none
                         focus:border-violet-500/30 focus:bg-white/4 transition-all"
              disabled={saving}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-5">
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-4 py-2 rounded-lg border border-white/6 text-gray-400
                       hover:bg-white/4 hover:text-gray-300 active:scale-[0.97] transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="text-xs px-5 py-2 rounded-lg font-semibold bg-linear-to-r from-violet-600
                       to-indigo-500 text-white hover:brightness-110 disabled:opacity-40
                       active:scale-[0.97] transition-all cursor-pointer btn-glow
                       shadow-md shadow-violet-600/15 flex items-center gap-1.5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
