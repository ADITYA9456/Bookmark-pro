"use client";

import { createClient } from "@/lib/supabase/client";
import { Bookmark, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BookmarkForm from "./BookmarkForm";
import BookmarkList from "./BookmarkList";
import ConfirmDialog from "./ConfirmDialog";
import EditBookmarkModal from "./EditBookmarkModal";
import Toast from "./Toast";

export default function Dashboard({ userId }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const searchRef = useRef(null);

  const supabase = useMemo(() => createClient(), []);

  const pushToast = useCallback((message, type) => {
    setToasts(prev => [...prev, { id: Date.now(), message, type }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (data) setBookmarks(data);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel("bm-changes")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "bookmarks",
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        if (payload.eventType === "INSERT") {
          setBookmarks(prev => {
            if (prev.some(b => b.id === payload.new.id)) return prev;
            return [payload.new, ...prev];
          });
        }
        if (payload.eventType === "DELETE") {
          setBookmarks(prev => prev.filter(b => b.id !== payload.old.id));
        }
        if (payload.eventType === "UPDATE") {
          setBookmarks(prev => prev.map(b => b.id === payload.new.id ? payload.new : b));
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId, supabase]);

  // Ctrl+K / Cmd+K keyboard shortcut for search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);


  const sortedBookmarks = useMemo(() => {
    const copy = [...bookmarks];
    copy.sort((a, b) => {
      if (a.is_favorite && !b.is_favorite) return -1;
      if (!a.is_favorite && b.is_favorite) return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });
    return copy;
  }, [bookmarks]);


  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return sortedBookmarks;
    const q = searchQuery.toLowerCase();
    return sortedBookmarks.filter(
      bm => bm.title.toLowerCase().includes(q) || bm.url.toLowerCase().includes(q)
    );
  }, [sortedBookmarks, searchQuery]);

  const handleAdd = useCallback(async (title, url) => {
    const { data, error } = await supabase
      .from("bookmarks")
      .insert({ title, url, user_id: userId })
      .select()
      .single();

    if (error) {
      pushToast("Couldn't save that one, try again", "error");
      return false;
    }

    if (data) {
      setBookmarks(prev => {
        if (prev.some(b => b.id === data.id)) return prev;
        return [data, ...prev];
      });
    }

    pushToast(`Saved "${title}"`, "success");
    return true;
  }, [supabase, userId, pushToast]);

  // delete with confirmation
  const askDelete = useCallback((id, title) => {
    setDeleteTarget({ id, title });
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const { id, title } = deleteTarget;
    setDeleteTarget(null);

    setBookmarks(prev => prev.filter(b => b.id !== id));
    pushToast(`Removed "${title}"`, "success");

    const { error } = await supabase.from("bookmarks").delete().eq("id", id);
    if (error) {
      pushToast("Delete failed, refreshing...", "error");
      const { data } = await supabase.from("bookmarks").select("*")
        .eq("user_id", userId).order("created_at", { ascending: false });
      if (data) setBookmarks(data);
    }
  }, [deleteTarget, supabase, userId, pushToast]);

 
  const confirmDeleteAll = useCallback(async () => {
    setShowDeleteAll(false);
    const count = bookmarks.length;
    setBookmarks([]);
    pushToast(`Cleared ${count} bookmark${count > 1 ? "s" : ""}`, "success");

    const { error } = await supabase.from("bookmarks").delete().eq("user_id", userId);
    if (error) {
      pushToast("Bulk delete failed, refreshing...", "error");
      const { data } = await supabase.from("bookmarks").select("*")
        .eq("user_id", userId).order("created_at", { ascending: false });
      if (data) setBookmarks(data);
    }
  }, [bookmarks.length, supabase, userId, pushToast]);

 
  const toggleFavorite = useCallback(async (id) => {
    const bm = bookmarks.find(b => b.id === id);
    if (!bm) return;

    const next = !bm.is_favorite;
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, is_favorite: next } : b));

    const { error } = await supabase
      .from("bookmarks")
      .update({ is_favorite: next })
      .eq("id", id);

    if (error) {
      setBookmarks(prev => prev.map(b => b.id === id ? { ...b, is_favorite: !next } : b));
      pushToast("Couldn't update favorite", "error");
    }
  }, [bookmarks, supabase, pushToast]);

  
  const handleEdit = useCallback(async (id, title, url) => {
    const { error } = await supabase
      .from("bookmarks")
      .update({ title, url })
      .eq("id", id);

    if (error) {
      pushToast("Update failed, try again", "error");
      return false;
    }

    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, title, url } : b));
    pushToast("Bookmark updated", "success");
    return true;
  }, [supabase, pushToast]);

  const favCount = bookmarks.filter(b => b.is_favorite).length;

  return (
    <>
     
      <div className="flex items-center gap-2.5 mb-5 animate-fade-up">
        <div className="stat-card flex-1 px-4 py-3.5 flex items-center gap-3 rounded-xl
                        bg-white/2.5 border border-white/5 backdrop-blur-sm">
          <div className="w-9 h-9 rounded-lg bg-linear-to-br from-violet-500/15 to-indigo-500/10
                          flex items-center justify-center ring-1 ring-violet-500/10">
            <Bookmark className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-white leading-none tracking-tight">{bookmarks.length}</p>
            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-medium">total saved</p>
          </div>
        </div>
        <div className="stat-card flex-1 px-4 py-3.5 flex items-center gap-3 rounded-xl
                        bg-white/2.5 border border-white/5 backdrop-blur-sm">
          <div className="w-9 h-9 rounded-lg bg-linear-to-br from-amber-500/15 to-orange-500/10
                          flex items-center justify-center ring-1 ring-amber-500/10">
            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-extrabold text-white leading-none tracking-tight">{favCount}</p>
            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-medium">favorites</p>
          </div>
        </div>
      </div>

      <BookmarkForm onAdd={handleAdd} />

      
      {bookmarks.length > 0 && (
        <div className="flex items-center gap-2 mb-5 animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600
                               group-focus-within:text-violet-400 transition-colors pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-glow w-full bg-white/3 border border-white/6 text-white text-xs
                         pl-9 pr-20 py-2.5 rounded-xl placeholder:text-gray-600 focus:outline-none
                         focus:border-violet-500/30 focus:bg-white/4 transition-all"
              aria-label="Search bookmarks"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400
                           transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5
                              text-[10px] text-gray-600 bg-white/4 px-1.5 py-0.5 rounded-md border border-white/6
                              font-mono pointer-events-none">
                Ctrl K
              </kbd>
            )}
          </div>
          <button
            onClick={() => setShowDeleteAll(true)}
            className="flex items-center gap-1.5 text-gray-600 hover:text-red-400 text-[11px] font-medium
                       px-3.5 py-2.5 rounded-xl border border-white/5 hover:border-red-500/20
                       hover:bg-red-500/6 active:scale-[0.97] transition-all cursor-pointer
                       whitespace-nowrap shrink-0"
          >
            <Trash2 className="w-3 h-3" />
            Clear all
          </button>
        </div>
      )}

      <BookmarkList
        bookmarks={filtered}
        loading={loading}
        onDelete={askDelete}
        onFavorite={toggleFavorite}
        onEdit={(bm) => setEditTarget(bm)}
        searchQuery={searchQuery}
      />

      <EditBookmarkModal
        key={editTarget?.id}
        bookmark={editTarget}
        open={!!editTarget}
        onSave={handleEdit}
        onClose={() => setEditTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete bookmark?"
        message={`"${deleteTarget?.title}" will be gone for good. You sure?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={showDeleteAll}
        title="Delete all bookmarks?"
        message={`This will permanently remove all ${bookmarks.length} bookmark${bookmarks.length > 1 ? "s" : ""}. Can't undo this.`}
        onConfirm={confirmDeleteAll}
        onCancel={() => setShowDeleteAll(false)}
      />

      <Toast toasts={toasts} onRemove={dismissToast} />
    </>
  );
}
