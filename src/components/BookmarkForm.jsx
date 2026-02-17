"use client";

import { Loader2, Plus } from "lucide-react";
import { useState } from "react";

export default function BookmarkForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !url.trim()) {
      setError("Both fields are required");
      return;
    }

    setLoading(true);
    const ok = await onAdd(title.trim(), url.trim());

    if (ok) {
      setTitle("");
      setUrl("");
    } else {
      setError("Something went wrong, try again");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-5 mb-5 animate-fade-up" style={{ animationDelay: "40ms" }}>
      {error && (
        <div className="text-red-400 text-xs bg-red-500/6 border border-red-500/10 px-3.5 py-2 rounded-lg mb-4 font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-glow flex-1 bg-white/3 border border-white/6 text-white text-sm px-3.5 py-2.5
                     rounded-xl placeholder:text-gray-600 focus:outline-none focus:border-violet-500/30
                     focus:bg-white/4 transition-all"
          required
          disabled={loading}
        />
        <input
          type="url"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="input-glow flex-1 bg-white/3 border border-white/6 text-white text-sm px-3.5 py-2.5
                     rounded-xl placeholder:text-gray-600 focus:outline-none focus:border-violet-500/30
                     focus:bg-white/4 transition-all"
          required
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-linear-to-r from-violet-600 to-indigo-500 text-white text-sm px-5 py-2.5
                     rounded-xl font-semibold hover:brightness-110 disabled:opacity-40
                     active:scale-[0.97] transition-all flex items-center justify-center gap-1.5
                     cursor-pointer whitespace-nowrap btn-glow shadow-md shadow-violet-600/15"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Add
            </>
          )}
        </button>
      </div>
    </form>
  );
}
