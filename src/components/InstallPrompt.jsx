"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installing, setInstalling] = useState(false);

  // Check if already installed as PWA
  const [isInstalled] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(display-mode: standalone)").matches;
  });

  useEffect(() => {
    if (isInstalled) return;

    const dismissed = localStorage.getItem("pwa-dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 3 * 24 * 60 * 60 * 1000) {
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Small delay so page loads first
      setTimeout(() => setShowBanner(true), 1500);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // For iOS Safari (no beforeinstallprompt support)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    if (isIOS && isSafari) {
      setTimeout(() => setShowBanner(true), 1500);
    }

    window.addEventListener("appinstalled", () => {
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setInstalling(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-dismissed", String(Date.now()));
  };

  if (isInstalled || !showBanner) return null;

  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  return (
    <div className="install-banner-container">
      <div className="install-banner">
        {/* Close */}
        <button onClick={handleDismiss} className="install-close" aria-label="Close">
          <X className="w-4 h-4" />
        </button>

        <div className="install-content">
          {/* Icon */}
          <div className="install-icon">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>

          <div className="install-text">
            <h3>Install Smart Bookmark</h3>
            {isIOS ? (
              <p>
                Tap <span className="install-ios-icon">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 inline" fill="currentColor">
                    <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 012-2h3v2H6v11h12V10h-3V8h3a2 2 0 012 2z"/>
                  </svg>
                </span> then <strong>&quot;Add to Home Screen&quot;</strong>
              </p>
            ) : (
              <p>Add to home screen for a better experience</p>
            )}
          </div>
        </div>

        {!isIOS && (
          <button onClick={handleInstall} disabled={installing} className="install-button">
            <Download className="w-4 h-4" />
            {installing ? "Installing..." : "Install App"}
          </button>
        )}
      </div>
    </div>
  );
}
