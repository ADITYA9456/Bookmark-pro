"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center noise-bg grid-pattern relative overflow-hidden"
         style={{ background: "linear-gradient(145deg, #08080d 0%, #0f071e 50%, #08080d 100%)" }}>

      {/* bg blobs */}
      <div className="absolute top-[-25%] left-[-15%] w-150 h-150 bg-violet-600/8 rounded-full blur-[140px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-125 h-125 bg-cyan-500/6 rounded-full blur-[120px]" />
      <div className="absolute top-[40%] right-[20%] w-75 h-75 bg-indigo-600/5 rounded-full blur-[100px]" />

      
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${2 + i % 3}px`,
            height: `${2 + i % 3}px`,
            background: i % 2 === 0 ? "rgba(124, 58, 237, 0.3)" : "rgba(6, 182, 212, 0.25)",
            top: `${15 + i * 13}%`,
            left: `${8 + i * 16}%`,
            animation: `float ${3.5 + i * 0.6}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-sm mx-4 animate-fade-up">
        <div className="glass-card p-9 text-center">

          
          <div className="logo-ring logo-breathe w-16 h-16 mx-auto mb-6 rounded-2xl bg-linear-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-xl shadow-violet-500/15">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">Smart Bookmark</h1>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">Your links, always within reach</p>

         
          <div className="h-px bg-linear-to-r from-transparent via-white/8 to-transparent my-7" />

          
          <button
            onClick={handleGoogleLogin}
            className="btn-shimmer flex items-center gap-3 w-full justify-center bg-white/93 text-gray-800
                       px-5 py-3.5 rounded-xl font-semibold hover:bg-white transition-all
                       cursor-pointer text-[15px] hover:shadow-xl hover:shadow-white/5
                       active:scale-[0.98]"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-gray-600 text-xs mt-6">
            We only use Google to verify your identity
          </p>
        </div>
      </div>
    </div>
  );
}
