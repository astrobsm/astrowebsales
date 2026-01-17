import React, { useEffect, useState } from 'react';
import { usePWAStore } from '../../store/pwaStore';

const InstallPrompt = () => {
  const { 
    isInstallable, 
    isInstalled, 
    installDismissed,
    promptInstall, 
    dismissInstall,
    setDeferredPrompt,
    setInstalled
  } = usePWAStore();

  const [showBanner, setShowBanner] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Listen for beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setInstalled(true);
      setShowBanner(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [setDeferredPrompt, setInstalled]);

  useEffect(() => {
    // Show banner after a delay if installable and not dismissed
    if (isInstallable && !installDismissed && !isInstalled) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, installDismissed, isInstalled]);

  const handleInstall = async () => {
    setInstalling(true);
    try {
      const installed = await promptInstall();
      if (installed) {
        setShowBanner(false);
      }
    } catch (error) {
      console.error('Install error:', error);
    } finally {
      setInstalling(false);
    }
  };

  const handleDismiss = () => {
    dismissInstall();
    setShowBanner(false);
  };

  if (!showBanner || isInstalled) return null;

  return (
    <>
      {/* Mobile Banner (Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-blue-700 to-blue-900 shadow-lg md:hidden animate-slide-up">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <img 
              src="/logo.png" 
              alt="Bonnesante Medicals" 
              className="w-14 h-14 rounded-xl shadow-md bg-white p-1"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-sm truncate">
              Install Bonnesante App
            </h3>
            <p className="text-blue-200 text-xs truncate">
              Access offline, faster & notifications
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-blue-200 hover:text-white text-sm font-medium transition-colors"
            >
              Later
            </button>
            <button
              onClick={handleInstall}
              disabled={installing}
              className="px-4 py-2 bg-white text-blue-700 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors disabled:opacity-50 shadow-md"
            >
              {installing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </span>
              ) : 'Install'}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Banner (Top Right) */}
      <div className="hidden md:block fixed top-20 right-4 z-50 animate-slide-in-right">
        <div className="bg-white rounded-2xl shadow-2xl p-5 max-w-sm border border-gray-100">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="Bonnesante Medicals" 
                className="w-16 h-16 rounded-xl shadow-md"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">
                Install Bonnesante App
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Install our app for a better experience with offline access and instant notifications.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Offline Access
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Fast
              </span>
            </div>
            <button
              onClick={handleInstall}
              disabled={installing}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold text-sm hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              {installing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Installing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Install App
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.4s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default InstallPrompt;
