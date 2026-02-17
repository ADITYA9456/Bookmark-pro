import Dashboard from "@/components/Dashboard";
import { createClient } from "@/lib/supabase/server";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const handleSignOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  };

  const firstName = user.user_metadata?.full_name?.split(" ")[0] || "there";
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen noise-bg grid-pattern relative"
         style={{ background: "linear-gradient(160deg, #08080d 0%, #0e091c 40%, #08080d 100%)" }}>

      {/* decorative blobs */}
      <div className="fixed top-0 left-0 w-150 h-100 bg-violet-700/4 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-125 h-87.5 bg-cyan-600/3 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-100 bg-indigo-600/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto py-8 px-4">

        {/* header */}
        <header className="flex items-center justify-between mb-8 py-3 px-4 rounded-2xl
                           bg-white/2 border border-white/4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="logo-ring w-9 h-9 rounded-lg bg-linear-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-md shadow-violet-600/15">
              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight tracking-tight">Smart Bookmark</h1>
              <p className="text-[11px] text-gray-500 mt-0.5">Hey {firstName} 👋</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full ring-2 ring-white/8" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-violet-600/40 to-indigo-500/40 flex items-center justify-center text-[10px] font-bold text-violet-200 ring-2 ring-white/8">
                {user.email?.[0]?.toUpperCase()}
              </div>
            )}
            <form action={handleSignOut}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300
                           text-[11px] px-3 py-1.5 rounded-lg border border-white/6
                           hover:border-white/12 hover:bg-white/5 transition-all cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                Sign out
              </button>
            </form>
          </div>
        </header>

        <Dashboard userId={user.id} />
      </div>
    </div>
  );
}
