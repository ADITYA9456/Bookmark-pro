"use client";

import { Check, Copy, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getFavicon(url) {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=32`;
  } catch {
    return null;
  }
}

function StarIcon({ filled, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-all cursor-pointer active:scale-90 ${
        filled
          ? "text-amber-400 hover:text-amber-300 star-pop"
          : "text-gray-700 hover:text-amber-400/60 hover:bg-amber-400/5"
      }`}
      aria-label={filled ? "Remove from favorites" : "Add to favorites"}
      title={filled ? "Unstar" : "Star"}
    >
      <svg
        className="w-3.5 h-3.5"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>
    </button>
  );
}

function CopyButton({ url }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-2 rounded-lg active:scale-90 transition-all cursor-pointer ${
        copied
          ? "text-emerald-400 bg-emerald-500/8"
          : "text-gray-600 hover:text-cyan-400 hover:bg-cyan-500/8"
      }`}
      title={copied ? "Copied!" : "Copy URL"}
      aria-label="Copy URL to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function BookmarkList({ bookmarks, loading, onDelete, onFavorite, onEdit, searchQuery }) {
  if (loading) {
    return (
      <div className="space-y-2.5">
        {[1, 2, 3].map(n => (
          <div key={n} className="glass-card p-4 flex items-center gap-3">
            <div className="skeleton w-9 h-9 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="skeleton h-3.5 w-2/5 rounded" />
              <div className="skeleton h-2.5 w-3/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!bookmarks.length) {
    if (searchQuery) {
      return (
        <div className="text-center py-16 animate-fade-up">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/2.5 border border-white/5
                          flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm font-semibold">No results found</p>
          <p className="text-gray-600 text-xs mt-1.5">Try a different search term</p>
        </div>
      );
    }
    return (
      <div className="text-center py-20 animate-fade-up">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/2.5 border border-white/5
                        flex items-center justify-center animate-gentle-bounce">
          <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <p className="text-gray-400 text-sm font-semibold">No bookmarks yet</p>
        <p className="text-gray-600 text-xs mt-1.5">Save your first link above</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1 mb-3">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Your links</span>
        <span className="text-[10px] text-gray-500 bg-white/4 px-2.5 py-0.5 rounded-full font-medium
                         border border-white/4">
          {bookmarks.length} result{bookmarks.length !== 1 ? "s" : ""}
        </span>
      </div>

      {bookmarks.map((bm, i) => {
        const favicon = getFavicon(bm.url);
        const starred = !!bm.is_favorite;

        return (
          <div
            key={bm.id}
            className="group card-hover-glow glass-card p-4 flex items-center gap-3
                       transition-all animate-fade-up"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            {/* star */}
            <StarIcon filled={starred} onClick={() => onFavorite(bm.id)} />

            {/* favicon */}
            {favicon && (
              <div className="w-9 h-9 rounded-lg bg-white/4 flex items-center justify-center shrink-0
                              border border-white/5 group-hover:border-white/8 transition-colors">
                <img src={favicon} alt="" className="w-4 h-4" loading="lazy" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-white text-sm font-semibold truncate">{bm.title}</h3>
                {starred && (
                  <span className="text-[9px] text-amber-400/80 bg-amber-500/8 px-1.5 py-0.5 rounded-md
                                   font-bold shrink-0 hidden sm:inline tracking-wide">
                    FAV
                  </span>
                )}
                {bm.created_at && (
                  <span className="text-[10px] text-gray-600 shrink-0 hidden sm:inline">
                    {timeAgo(bm.created_at)}
                  </span>
                )}
              </div>
              <a href={bm.url} target="_blank" rel="noopener noreferrer"
                 className="text-violet-400/50 text-xs truncate hover:text-violet-300
                            flex items-center gap-1 mt-1 max-w-full transition-colors">
                <span className="truncate">{bm.url}</span>
                <ExternalLink className="w-3 h-3 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity" />
              </a>
            </div>

            <div className="flex items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
              <CopyButton url={bm.url} />
              <button
                onClick={() => onEdit(bm)}
                className="p-2 text-gray-600 hover:text-violet-400 rounded-lg hover:bg-violet-500/8
                           active:scale-90 transition-all cursor-pointer"
                title="Edit"
                aria-label={`Edit ${bm.title}`}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(bm.id, bm.title)}
                className="p-2 text-gray-600 hover:text-red-400 rounded-lg hover:bg-red-500/8
                           active:scale-90 transition-all cursor-pointer"
                title="Delete"
                aria-label={`Delete ${bm.title}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
