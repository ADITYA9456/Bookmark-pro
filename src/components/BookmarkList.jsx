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
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function getFavicon(url) {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=32`;
  } catch {
    return null;
  }
}

// Color from string hash for favicon fallback
function getDomainColor(domain) {
  const colors = [
    "from-violet-500/20 to-violet-600/10 text-violet-400",
    "from-blue-500/20 to-blue-600/10 text-blue-400",
    "from-cyan-500/20 to-cyan-600/10 text-cyan-400",
    "from-emerald-500/20 to-emerald-600/10 text-emerald-400",
    "from-amber-500/20 to-amber-600/10 text-amber-400",
    "from-rose-500/20 to-rose-600/10 text-rose-400",
    "from-pink-500/20 to-pink-600/10 text-pink-400",
    "from-indigo-500/20 to-indigo-600/10 text-indigo-400",
  ];
  let hash = 0;
  for (let i = 0; i < domain.length; i++) hash = domain.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function FaviconBox({ url }) {
  const [failed, setFailed] = useState(false);
  const favicon = getFavicon(url);
  const domain = getDomain(url);
  const color = getDomainColor(domain);
  const letter = domain[0]?.toUpperCase() || "?";

  if (!favicon || failed) {
    return (
      <div className={`w-9 h-9 rounded-lg bg-linear-to-br ${color} flex items-center justify-center shrink-0
                        border border-white/5 text-xs font-bold`}>
        {letter}
      </div>
    );
  }

  return (
    <div className="w-9 h-9 rounded-lg bg-white/4 flex items-center justify-center shrink-0
                    border border-white/5">
      <img
        src={favicon}
        alt=""
        className="w-4 h-4"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function StarIcon({ filled, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
        filled
          ? "text-amber-400 hover:text-amber-300"
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
      className={`p-2 rounded-lg transition-colors cursor-pointer ${
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
        <div className="text-center py-16">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/2.5 border border-white/5
                          flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm font-semibold">No matches for &ldquo;{searchQuery}&rdquo;</p>
          <p className="text-gray-600 text-xs mt-1.5">Try a different search term</p>
        </div>
      );
    }
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/2.5 border border-white/5
                        flex items-center justify-center">
          <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <p className="text-gray-400 text-sm font-semibold">No bookmarks yet</p>
        <p className="text-gray-600 text-xs mt-1.5">Save your first link above to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1 mb-3">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
          {searchQuery ? "Search results" : "Your links"}
        </span>
        <span className="text-[10px] text-gray-500 bg-white/4 px-2.5 py-0.5 rounded-full font-medium
                         border border-white/4">
          {bookmarks.length} {bookmarks.length === 1 ? "link" : "links"}
        </span>
      </div>

      {bookmarks.map((bm) => {
        const domain = getDomain(bm.url);
        const starred = !!bm.is_favorite;

        return (
          <div
            key={bm.id}
            className="group card-hover-glow glass-card p-4 flex items-center gap-3 transition-colors"
          >
            {/* star */}
            <StarIcon filled={starred} onClick={() => onFavorite(bm.id)} />

            {/* favicon with fallback */}
            <FaviconBox url={bm.url} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-white text-sm font-semibold truncate">{bm.title}</h3>
                {starred && (
                  <span className="text-[9px] text-amber-400/80 bg-amber-500/8 px-1.5 py-0.5 rounded-md
                                   font-bold shrink-0 hidden sm:inline tracking-wide">
                    FAV
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <a href={bm.url} target="_blank" rel="noopener noreferrer"
                   className="text-violet-400/50 text-xs truncate hover:text-violet-300
                              flex items-center gap-1 transition-colors">
                  <span className="truncate">{domain}</span>
                  <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
                {bm.created_at && (
                  <>
                    <span className="text-gray-700 text-[10px] hidden sm:inline">&middot;</span>
                    <span className="text-[10px] text-gray-600 shrink-0 hidden sm:inline">
                      {timeAgo(bm.created_at)}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-0.5 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <CopyButton url={bm.url} />
              <button
                onClick={() => onEdit(bm)}
                className="p-2 text-gray-600 hover:text-violet-400 rounded-lg hover:bg-violet-500/8
                           transition-colors cursor-pointer"
                title="Edit"
                aria-label={`Edit ${bm.title}`}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(bm.id, bm.title)}
                className="p-2 text-gray-600 hover:text-red-400 rounded-lg hover:bg-red-500/8
                           transition-colors cursor-pointer"
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
