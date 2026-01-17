import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { usePWAStore } from './store/pwaStore';

// Initialize PWA store and listen for events
const initPWA = () => {
  const store = usePWAStore.getState();

  // Listen for beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    store.setDeferredPrompt(e);
  });

  // Listen for app installed
  window.addEventListener('appinstalled', () => {
    store.setInstalled(true);
  });

  // Listen for SW update available
  window.addEventListener('swUpdate', (e) => {
    store.setSWRegistration(e.detail);
    store.setSWUpdateAvailable(true);
  });

  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    store.setInstalled(true);
  }

  // Request notification permission after user interaction
  document.addEventListener('click', () => {
    if (Notification.permission === 'default') {
      store.requestNotificationPermission();
    }
  }, { once: true });
};

// Initialize PWA
initPWA();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Toaster position="top-right" />
    <App />
  </React.StrictMode>
);

