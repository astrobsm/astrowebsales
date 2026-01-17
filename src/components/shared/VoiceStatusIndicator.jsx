import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, X, AlertCircle } from 'lucide-react';
import { usePWAStore } from '../../store/pwaStore';
import { useAuthStore } from '../../store/authStore';

const VoiceStatusIndicator = () => {
  const { voiceEnabled, setVoiceEnabled, announce } = usePWAStore();
  const { user, isAuthenticated } = useAuthStore();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Only show for staff users
  const isStaffUser = isAuthenticated && user && 
    ['admin', 'distributor', 'wholesaler', 'cco', 'marketer', 'sales'].includes(user.role);

  useEffect(() => {
    // Show voice prompt after login if not already enabled
    if (isStaffUser && !voiceEnabled && !dismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isStaffUser, voiceEnabled, dismissed]);

  const handleEnableVoice = () => {
    setVoiceEnabled(true);
    announce('Voice announcements are now enabled. You will hear alerts when new orders are placed.', 'high');
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowPrompt(false);
  };

  // Only render for staff
  if (!isStaffUser) return null;

  return (
    <>
      {/* Voice Enable Prompt */}
      {showPrompt && (
        <div className="fixed bottom-20 right-4 z-50 animate-slide-in-right">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-xl shadow-2xl p-4 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm mb-1">Enable Voice Announcements</h4>
                <p className="text-xs text-white/80 mb-3">
                  Get voice alerts when new orders are placed. Never miss an order!
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleEnableVoice}
                    className="flex-1 px-3 py-1.5 bg-white text-primary-700 rounded-lg text-xs font-bold hover:bg-primary-50 transition-colors"
                  >
                    Enable Now
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-1.5 bg-white/10 text-white rounded-lg text-xs font-medium hover:bg-white/20 transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white/60 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Status Indicator */}
      <button
        onClick={() => setVoiceEnabled(!voiceEnabled)}
        className={`fixed bottom-20 left-4 z-40 p-3 rounded-full shadow-lg transition-all duration-300 ${
          voiceEnabled 
            ? 'bg-green-500 hover:bg-green-600 text-white' 
            : 'bg-gray-300 hover:bg-gray-400 text-gray-600'
        }`}
        title={voiceEnabled ? 'Voice ON - Click to disable' : 'Voice OFF - Click to enable'}
      >
        {voiceEnabled ? (
          <Volume2 size={24} className="animate-pulse" />
        ) : (
          <VolumeX size={24} />
        )}
      </button>
    </>
  );
};

export default VoiceStatusIndicator;
