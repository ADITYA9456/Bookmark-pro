# Smart Bookmark App

A real-time bookmark manager where users can sign in with Google, save bookmarks, and see changes sync instantly across tabs.

**Live:** [https://bookmark-pro-jet.vercel.app](https://bookmark-pro-jet.vercel.app)

---

## What It Does

1. **Google Sign-in** — Users log in via Google OAuth (no email/password flow)
2. **Add Bookmarks** — Enter a URL + title and it's saved instantly
3. **Private Data** — Each user only sees their own bookmarks (Row-Level Security in Supabase)
4. **Real-time Sync** — Open two tabs, add a bookmark in one → it appears in the other without refreshing
5. **Delete Bookmarks** — Remove any bookmark you own
6. **Deployed on Vercel** — Live and working at the URL above

**Bonus features I added:** Edit bookmarks, favorite/star system, search with `Ctrl+K`, copy URL to clipboard, PWA install support, and an error boundary for crash recovery.

---

## Tech Stack

- **Next.js 16** (App Router) — Framework with server and client components
- **Supabase** — Auth (Google OAuth), PostgreSQL database, Realtime subscriptions
- **Tailwind CSS v4** — Styling
- **Vercel** — Deployment

---

## Problems I Ran Into & How I Solved Them

### Problem 1: Supabase needs 3 different clients in Next.js App Router

This was confusing at first. You can't just create one Supabase client and use it everywhere. Server components, client components, and middleware all handle cookies differently, and Supabase auth depends on cookies.

**What went wrong:** I initially used a single `createClient()` everywhere. Login would work, but then `supabase.auth.getUser()` would return `null` in server components — the session cookies weren't being read properly on the server side.

**How I fixed it:** I created three separate client files:
- `lib/supabase/client.js` → uses `createBrowserClient` (for client components)
- `lib/supabase/server.js` → uses `createServerClient` with `cookies()` from `next/headers` (for server components)
- `lib/supabase/middleware.js` → uses `createServerClient` with request/response cookie handling (for middleware)

Each one handles cookies in the way that works for its environment. The middleware one is especially tricky because it has to both read cookies from the request AND write updated cookies to the response.

---

### Problem 2: Realtime was showing other users' bookmarks

Even with RLS enabled on the database, the Supabase Realtime channel was broadcasting `INSERT`/`DELETE` events for ALL rows in the table — not just the current user's.

**What went wrong:** I set up the channel like this:
```js
supabase.channel("bookmarks").on("postgres_changes", {
  event: "*",
  schema: "public",
  table: "bookmarks"
}, callback)
```
This listens to every change on the table. RLS only protects direct queries, not realtime broadcasts.

**How I fixed it:** Added a `filter` to the subscription:
```js
filter: `user_id=eq.${userId}`
```
Now each user's browser only receives events for their own bookmarks.

---

### Problem 3: Duplicate bookmarks appearing from Realtime

When I added a bookmark, it would sometimes show up twice in the list — once from the optimistic update (instant UI feedback) and once from the Realtime event.

**What went wrong:** The flow was: user clicks "Add" → I immediately push the bookmark into state (optimistic) → Supabase INSERT completes → Realtime fires an INSERT event → the same bookmark gets added again.

**How I fixed it:** In the Realtime INSERT handler, I check if the bookmark already exists:
```js
if (payload.eventType === "INSERT") {
  setBookmarks(prev => {
    if (prev.some(b => b.id === payload.new.id)) return prev;
    return [payload.new, ...prev];
  });
}
```
This deduplicates — if the optimistic update already added it, the Realtime event is ignored.

---

### Problem 4: OAuth redirect URL mismatch after deploying to Vercel

Login worked perfectly on `localhost:3000` but broke completely after deploying to Vercel.

**What went wrong:** Google OAuth requires exact redirect URIs. My Supabase project was configured with `http://localhost:3000` as the only allowed redirect, so when the deployed app tried to redirect back after Google login, Supabase rejected it.

**How I fixed it:**
1. Added my Vercel URL (`https://bookmark-pro-jet.vercel.app`) to Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
2. Made sure the callback route (`/auth/callback/route.js`) uses `origin` from the request URL instead of a hardcoded URL:
```js
const { origin } = new URL(request.url);
return NextResponse.redirect(`${origin}${next}`);
```
This way it works on both localhost and production without any code changes.

---

### Problem 5: Channel cleanup on component unmount

**What went wrong:** Every time the Dashboard component re-rendered (like when navigating back), a new Realtime channel was created without removing the old one. This led to multiple active subscriptions, which caused bookmarks to appear multiple times.

**How I fixed it:** Used the `useEffect` cleanup function:
```js
useEffect(() => {
  const channel = supabase.channel("bm-changes").on(...).subscribe();
  return () => supabase.removeChannel(channel);
}, []);
```
When the component unmounts, the channel is properly removed. No more ghost subscriptions.

---

### Problem 6: Middleware cookie handling in Next.js 16

The `cookies()` API in Next.js App Router is async now (since Next.js 15+). Also, `setAll` can throw in server components because you can't set cookies during render.

**What went wrong:** I was calling `cookies()` without `await`, which caused a runtime error. And when `setAll` was called inside a server component, it threw an exception that crashed the page.

**How I fixed it:**
- Used `await cookies()` in the server client
- Wrapped `setAll` in a try/catch — if it fails (like in a server component), it's fine because the middleware handles cookie refresh anyway:
```js
setAll(cookiesToSet) {
  try {
    cookiesToSet.forEach(({ name, value, options }) =>
      cookieStore.set(name, value, options)
    );
  } catch {
    // Middleware handles cookie refresh, safe to ignore here
  }
}
```

---

## Database Setup

```sql
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies (enable RLS on the table first)
-- SELECT: users can only read their own bookmarks
-- INSERT: users can only insert with their own user_id
-- UPDATE: users can only update their own bookmarks
-- DELETE: users can only delete their own bookmarks
```

---

## How to Run Locally

```bash
git clone <repo-url>
cd smart-bookmark
npm install
```

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
