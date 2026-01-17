import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Voice Announcement Service
class VoiceAnnouncementService {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.enabled = true;
    this.volume = 1;
    this.rate = 0.9;
    this.pitch = 1;
    this.voice = null;
    this.queue = [];
    this.speaking = false;
  }

  init() {
    // Load voices
    if (this.synthesis) {
      this.synthesis.onvoiceschanged = () => {
        const voices = this.synthesis.getVoices();
        // Prefer English voices
        this.voice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female')) ||
                     voices.find(v => v.lang.startsWith('en')) ||
                     voices[0];
      };
      // Trigger voice loading
      this.synthesis.getVoices();
    }
  }

  speak(text, priority = 'normal') {
    if (!this.enabled || !this.synthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    utterance.volume = this.volume;
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    utterance.onend = () => {
      this.speaking = false;
      this.processQueue();
    };

    utterance.onerror = () => {
      this.speaking = false;
      this.processQueue();
    };

    if (priority === 'high') {
      this.synthesis.cancel();
      this.synthesis.speak(utterance);
      this.speaking = true;
    } else {
      this.queue.push(utterance);
      if (!this.speaking) {
        this.processQueue();
      }
    }
  }

  processQueue() {
    if (this.queue.length > 0 && !this.speaking) {
      const utterance = this.queue.shift();
      this.synthesis.speak(utterance);
      this.speaking = true;
    }
  }

  stop() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.queue = [];
      this.speaking = false;
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setRate(rate) {
    this.rate = Math.max(0.5, Math.min(2, rate));
  }
}

// Create singleton instance
export const voiceService = new VoiceAnnouncementService();

// Initialize on load
if (typeof window !== 'undefined') {
  voiceService.init();
}

// PWA Store
export const usePWAStore = create(
  persist(
    (set, get) => ({
      // PWA Install State
      deferredPrompt: null,
      isInstallable: false,
      isInstalled: false,
      installDismissed: false,

      // Voice Settings
      voiceEnabled: true,
      voiceVolume: 1,
      voiceRate: 0.9,

      // Notification Settings
      notificationsEnabled: false,
      notificationPermission: 'default',

      // Service Worker
      swRegistration: null,
      swUpdateAvailable: false,

      // Actions
      setDeferredPrompt: (prompt) => set({ deferredPrompt: prompt, isInstallable: !!prompt }),
      
      setInstalled: (installed) => set({ isInstalled: installed, isInstallable: false }),
      
      dismissInstall: () => set({ installDismissed: true }),

      promptInstall: async () => {
        const { deferredPrompt } = get();
        if (!deferredPrompt) return false;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        set({ deferredPrompt: null, isInstallable: false });
        
        if (outcome === 'accepted') {
          set({ isInstalled: true });
          return true;
        }
        return false;
      },

      // Voice controls
      setVoiceEnabled: (enabled) => {
        voiceService.setEnabled(enabled);
        set({ voiceEnabled: enabled });
      },

      setVoiceVolume: (volume) => {
        voiceService.setVolume(volume);
        set({ voiceVolume: volume });
      },

      setVoiceRate: (rate) => {
        voiceService.setRate(rate);
        set({ voiceRate: rate });
      },

      // Announce order (for staff)
      announceOrder: (order) => {
        const { voiceEnabled } = get();
        if (!voiceEnabled) return;

        const customerName = order.customerName || order.customer?.name || 'A customer';
        const itemCount = order.items?.length || 0;
        const total = order.total || 0;

        const message = `Attention! New order received. ${customerName} has placed an order with ${itemCount} item${itemCount !== 1 ? 's' : ''}, totaling ${total.toLocaleString()} Naira. Please process this order promptly.`;
        
        voiceService.speak(message, 'high');
      },

      // Announce custom message
      announce: (message, priority = 'normal') => {
        const { voiceEnabled } = get();
        if (!voiceEnabled) return;
        voiceService.speak(message, priority);
      },

      // Stop speaking
      stopAnnouncement: () => {
        voiceService.stop();
      },

      // Notification controls
      requestNotificationPermission: async () => {
        if (!('Notification' in window)) {
          return 'unsupported';
        }

        const permission = await Notification.requestPermission();
        set({ 
          notificationPermission: permission,
          notificationsEnabled: permission === 'granted'
        });
        return permission;
      },

      showNotification: (title, options = {}) => {
        const { notificationsEnabled, swRegistration } = get();
        if (!notificationsEnabled) return;

        const defaultOptions = {
          icon: '/logo.png',
          badge: '/logo.png',
          vibrate: [100, 50, 100],
          ...options
        };

        if (swRegistration) {
          swRegistration.showNotification(title, defaultOptions);
        } else if ('Notification' in window) {
          new Notification(title, defaultOptions);
        }
      },

      // Service Worker
      setSWRegistration: (registration) => set({ swRegistration: registration }),
      
      setSWUpdateAvailable: (available) => set({ swUpdateAvailable: available }),

      updateServiceWorker: () => {
        const { swRegistration } = get();
        if (swRegistration && swRegistration.waiting) {
          swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }
    }),
    { 
      name: 'pwa-storage',
      partialize: (state) => ({
        isInstalled: state.isInstalled,
        installDismissed: state.installDismissed,
        voiceEnabled: state.voiceEnabled,
        voiceVolume: state.voiceVolume,
        voiceRate: state.voiceRate,
        notificationsEnabled: state.notificationsEnabled
      })
    }
  )
);

// Apply saved settings on load
if (typeof window !== 'undefined') {
  const savedState = JSON.parse(localStorage.getItem('pwa-storage') || '{}');
  if (savedState.state) {
    if (savedState.state.voiceEnabled !== undefined) {
      voiceService.setEnabled(savedState.state.voiceEnabled);
    }
    if (savedState.state.voiceVolume !== undefined) {
      voiceService.setVolume(savedState.state.voiceVolume);
    }
    if (savedState.state.voiceRate !== undefined) {
      voiceService.setRate(savedState.state.voiceRate);
    }
  }
}

export default usePWAStore;
