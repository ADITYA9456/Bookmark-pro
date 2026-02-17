# Smart Bookmark App

A real-time bookmark manager built with **Next.js 16** (App Router), **Supabase**, and **Tailwind CSS v4**.

**Live URL:** https://bookmark-pro-jet.vercel.app

---

## Features

- **Google OAuth Login** — Sign in with Google (no email/password)
- **Add / Edit / Delete Bookmarks** — Full CRUD with optimistic UI updates
- **Favorites** — Star important bookmarks, favorites always sorted on top
- **Real-time Sync** — Changes reflect instantly across multiple tabs (Supabase Realtime)
- **Search** — Filter bookmarks by title or URL with `Ctrl+K` shortcut
- **Copy URL** — One-click copy to clipboard on any bookmark
- **Private by Default** — Each user can only see their own data (Row Level Security)
- **PWA Support** — Installable as a native app on mobile & desktop
- **Error Boundary** — Graceful error recovery without full page crash
- **Responsive Design** — Optimized for desktop, tablet, and mobile
- **Keyboard Accessible** — Full keyboard navigation & shortcuts

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 16** (App Router) | Framework — server & client components |
| **React 19** | UI library with hooks |
| **Supabase** | Auth (Google OAuth), PostgreSQL, Realtime subscriptions |
| **Tailwind CSS v4** | Utility-first styling |
| **Lucide React** | Icon library |
| **Vercel** | Deployment & hosting |

---

## Architecture

```
src/
├── app/
│   ├── auth/callback/route.js   # OAuth callback handler
│   ├── login/page.jsx            # Google login page
│   ├── page.jsx                  # Main dashboard (server component)
│   ├── layout.jsx                # Root layout with SEO meta
│   └── globals.css               # Global styles & animations
├── components/
│   ├── BookmarkForm.jsx          # Add bookmark form (client)
│   ├── BookmarkList.jsx          # Bookmark list with favicons (client)
│   ├── ConfirmDialog.jsx         # Reusable confirmation modal
│   ├── Dashboard.jsx             # Main dashboard logic + realtime (client)
│   ├── EditBookmarkModal.jsx     # Edit bookmark modal
│   ├── ErrorBoundary.jsx         # React error boundary
│   ├── InstallPrompt.jsx         # PWA install banner
│   └── Toast.jsx                 # Toast notification system
├── lib/supabase/
│   ├── client.js                 # Browser-side Supabase client
│   ├── server.js                 # Server-side Supabase client
│   └── middleware.js             # Auth middleware helper
└── middleware.js                 # Route protection middleware
```

---

## How Realtime Works

1. When the dashboard loads, `Dashboard` subscribes to a Supabase Realtime channel
2. The channel listens for `postgres_changes` on the `bookmarks` table, filtered by `user_id`
3. On `INSERT` → the new bookmark is prepended to the list state
4. On `DELETE` → the bookmark is removed from the list state
5. On `UPDATE` → the bookmark is replaced in-place (edit, favorite toggle)
6. React re-renders the UI automatically — no manual refresh needed

This means: if you open the app in two tabs and add a bookmark in one, it appears in the other tab instantly.

---

## Database Schema

```sql
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Row Level Security Policies:**
- `SELECT` — Users can only view their own bookmarks
- `INSERT` — Users can only insert bookmarks with their own `user_id`
- `UPDATE` — Users can only update their own bookmarks
- `DELETE` — Users can only delete their own bookmarks

---

## Problems Faced & Solutions

### 1. Folder Name with Spaces (npm restriction)
**Problem:** The workspace folder had spaces and uppercase letters (`Smart bookmark`), which caused `create-next-app` to fail due to npm naming restrictions.
**Solution:** Created the project in a properly named subfolder and moved files to the workspace root.

### 2. Cookie Handling in App Router
**Problem:** Next.js App Router requires different Supabase client configurations for browser vs server vs middleware. Using the wrong client causes authentication failures.
**Solution:** Created three separate Supabase client files — `client.js` (browser), `server.js` (server components/actions), and `middleware.js` (route protection) — following Supabase's official SSR guide.

### 3. Realtime Channel Cleanup
**Problem:** Without proper cleanup, switching pages or re-rendering components created multiple duplicate realtime channels, causing performance issues and duplicate bookmark entries.
**Solution:** Used `useEffect` cleanup function with `supabase.removeChannel(channel)` to unsubscribe when the component unmounts.

### 4. RLS + Realtime Filter
**Problem:** Even with RLS enabled, the Realtime channel would receive events for all rows in the table unless explicitly filtered.
**Solution:** Added `filter: 'user_id=eq.${userId}'` to the channel subscription so each user only receives events for their own bookmarks.

### 5. OAuth Redirect URI Configuration
**Problem:** Google OAuth requires exact redirect URIs. Mismatched URIs cause login failures.
**Solution:** Configured the correct callback URL (`https://<project>.supabase.co/auth/v1/callback`) in both Google Cloud Console and Supabase dashboard. For Vercel deployment, also added the production URL to Supabase's allowed redirect URLs.

### 6. Optimistic Updates & Rollback
**Problem:** Waiting for server response before updating UI makes interactions feel sluggish.
**Solution:** Implemented optimistic updates for delete, favorite toggle, and edit operations. If the server request fails, the UI rolls back to the previous state and shows an error toast.

---

## Local Development

```bash
# Clone the repo
git clone <repo-url>
cd smart-bookmark

# Install dependencies
npm install

# Create .env.local with your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment

1. Push code to GitHub (public repo)
2. Import repo in [Vercel](https://vercel.com)
3. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy
5. Add Vercel production URL to Supabase → Authentication → URL Configuration → Redirect URLs
