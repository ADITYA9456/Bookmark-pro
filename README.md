# Smart Bookmark App

A simple, real-time bookmark manager built with Next.js (App Router), Supabase, and Tailwind CSS as part of a fullstack screening task.

**Live URL:**  https://bookmark-pro-jet.vercel.app

---

## Features

- **Google OAuth Login** — Sign in with Google only (no email/password)
- **Add Bookmarks** — Save any URL with a title
- **Private Bookmarks** — Each user can only see their own bookmarks (Row Level Security)
- **Real-time Updates** — Changes reflect instantly across multiple tabs without page refresh
- **Delete Bookmarks** — Remove bookmarks with one click
- **Responsive Design** — Works on desktop and mobile

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 16** (App Router) | Frontend framework with server components |
| **Supabase** | Authentication (Google OAuth), PostgreSQL Database, Realtime subscriptions |
| **Tailwind CSS** | Utility-first styling |
| **Vercel** | Deployment platform |
| **TypeScript** | Type safety |

---

## Architecture

```
src/
├── app/
│   ├── auth/callback/route.ts   # OAuth callback handler
│   ├── login/page.tsx            # Google login page
│   ├── page.tsx                  # Main dashboard (server component)
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── BookmarkForm.tsx          # Add bookmark form (client component)
│   └── BookmarkList.tsx          # Bookmark list + realtime + delete (client component)
├── lib/supabase/
│   ├── client.ts                 # Browser-side Supabase client
│   ├── server.ts                 # Server-side Supabase client
│   └── middleware.ts             # Auth middleware helper
└── middleware.ts                 # Route protection middleware
```

---

## How Realtime Works

1. When the dashboard loads, `BookmarkList` subscribes to a Supabase Realtime channel
2. The channel listens for `postgres_changes` on the `bookmarks` table, filtered by `user_id`
3. On `INSERT` → the new bookmark is prepended to the list state
4. On `DELETE` → the bookmark is removed from the list state
5. React re-renders the UI automatically — no manual refresh needed

This means: if you open the app in two tabs and add a bookmark in one, it appears in the other tab instantly.

---

## Database Schema

```sql
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Row Level Security Policies:**
- `SELECT`: Users can only view their own bookmarks
- `INSERT`: Users can only insert bookmarks with their own user_id
- `DELETE`: Users can only delete their own bookmarks

---

## Problems Faced & Solutions

### 1. Folder Name with Spaces (npm restriction)
**Problem:** The workspace folder had spaces and uppercase letters (`Smart bookmark`), which caused `create-next-app` to fail due to npm naming restrictions.
**Solution:** Created the project in a properly named subfolder and moved files to the workspace root.

### 2. Cookie Handling in App Router
**Problem:** Next.js App Router requires different Supabase client configurations for browser vs server vs middleware. Using the wrong client causes authentication failures.
**Solution:** Created three separate Supabase client files — `client.ts` (browser), `server.ts` (server components/actions), and `middleware.ts` (route protection) — following Supabase's official SSR guide.

### 3. Realtime Channel Cleanup
**Problem:** Without proper cleanup, switching pages or re-rendering components created multiple duplicate realtime channels, causing performance issues and duplicate bookmark entries.
**Solution:** Used `useEffect` cleanup function with `supabase.removeChannel(channel)` to unsubscribe when the component unmounts.

### 4. RLS + Realtime Filter
**Problem:** Even with RLS enabled, the Realtime channel would receive events for all rows in the table unless explicitly filtered.
**Solution:** Added `filter: 'user_id=eq.${userId}'` to the channel subscription so each user only receives events for their own bookmarks.

### 5. OAuth Redirect URI Configuration
**Problem:** Google OAuth requires exact redirect URIs. Mismatched URIs cause login failures.
**Solution:** Configured the correct callback URL (`https://<project>.supabase.co/auth/v1/callback`) in both Google Cloud Console and Supabase dashboard. For Vercel deployment, also added the production URL to Supabase's allowed redirect URLs.

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
