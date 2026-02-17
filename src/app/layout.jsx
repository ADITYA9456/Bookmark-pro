import InstallPrompt from "@/components/InstallPrompt";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata = {
  title: "Smart Bookmark — Save & Organize Your Links",
  description: "A fast, real-time bookmark manager. Save, search, and organize your favorite links with Google sign-in. Works offline as a PWA.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://bookmark-pro-jet.vercel.app"),
  openGraph: {
    title: "Smart Bookmark — Save & Organize Your Links",
    description: "A fast, real-time bookmark manager with Google sign-in, favorites, search, and instant sync across tabs.",
    url: "https://bookmark-pro-jet.vercel.app",
    siteName: "Smart Bookmark",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Smart Bookmark",
    description: "Save, search, and organize your favorite links in one place.",
  },
  keywords: ["bookmark manager", "save links", "bookmark app", "next.js", "supabase", "realtime"],
  authors: [{ name: "Smart Bookmark" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Smart Bookmark",
  },
};

export const viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${dmSans.className} antialiased`}>
        {children}
        <InstallPrompt />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(reg) { console.log('SW registered:', reg.scope); })
                    .catch(function(err) { console.error('SW failed:', err); });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
