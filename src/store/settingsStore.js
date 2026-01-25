import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // Company Information
      companyInfo: {
        name: 'Bonnesante Medicals',
        slogan: 'Your Wound Care Partner',
        logo: '/logo.png',
        favicon: '/favicon.svg',
        email: 'astrobsm@gmail.com',
        phone: '+234 902 872 4839',
        phone2: '+234 702 575 5406',
        address: '17A Isuofia Street, Federal Housing Estate Trans Ekulu, Enugu',
        city: 'Enugu',
        state: 'Enugu State',
        country: 'Nigeria',
        website: 'www.bonnesantemedicals.com',
        socialMedia: {
          facebook: '',
          twitter: '',
          instagram: '',
          linkedin: '',
          whatsapp: '+2349028724839'
        }
      },

      // Theme and Appearance
      appearance: {
        primaryColor: '#287D4D',
        secondaryColor: '#4CAF50',
        accentColor: '#FFD700',
        fontFamily: 'Inter, system-ui, sans-serif',
        headingFont: 'Playfair Display, serif',
        fontSize: 'medium', // small, medium, large
        borderRadius: 'rounded', // none, rounded, pill
        darkMode: false
      },

      // Slideshow Settings
      slideshow: {
        enabled: true,
        autoPlay: true,
        interval: 5000, // ms
        showDots: true,
        showArrows: true,
        transition: 'fade', // fade, slide, zoom
        slides: [
          {
            id: 1,
            title: 'Premium Wound Care Solutions',
            subtitle: 'Professional grade medical supplies for healthcare providers',
            image: '/slides/slide1.jpg',
            buttonText: 'Explore Products',
            buttonLink: '/products',
            active: true
          },
          {
            id: 2,
            title: 'Partner With Us',
            subtitle: 'Join our network of distributors and wholesalers',
            image: '/slides/slide2.jpg',
            buttonText: 'Become a Partner',
            buttonLink: '/contact',
            active: true
          },
          {
            id: 3,
            title: 'Training & Education',
            subtitle: 'Professional wound care training programs',
            image: '/slides/slide3.jpg',
            buttonText: 'Learn More',
            buttonLink: '/education',
            active: true
          }
        ]
      },

      // Email Settings
      emailSettings: {
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
        fromEmail: 'noreply@bonnesantemedicals.com',
        fromName: 'Bonnesante Medicals',
        enableNotifications: true
      },

      // Order Settings
      orderSettings: {
        orderPrefix: 'BSM',
        minOrderAmount: 5000,
        enableCOD: true,
        enableBankTransfer: true,
        shippingFee: 2500,
        freeShippingThreshold: 50000,
        taxRate: 0,
        autoConfirmOrders: false
      },

      // Notification Settings
      notifications: {
        emailOnNewOrder: true,
        emailOnOrderStatus: true,
        smsOnNewOrder: false,
        smsOnDelivery: false,
        pushNotifications: true
      },

      // SEO Settings
      seo: {
        metaTitle: 'Bonnesante Medicals - Premium Wound Care Solutions',
        metaDescription: 'Leading provider of wound care products and medical supplies in Nigeria. Professional grade solutions for healthcare providers.',
        keywords: 'wound care, medical supplies, bandages, dressings, Nigeria, healthcare',
        googleAnalyticsId: '',
        facebookPixelId: ''
      },

      // Business Hours
      businessHours: {
        monday: { open: '08:00', close: '18:00', closed: false },
        tuesday: { open: '08:00', close: '18:00', closed: false },
        wednesday: { open: '08:00', close: '18:00', closed: false },
        thursday: { open: '08:00', close: '18:00', closed: false },
        friday: { open: '08:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '14:00', closed: false },
        sunday: { open: '00:00', close: '00:00', closed: true }
      },

      // Set all settings (for sync from server)
      setCompanyInfo: (info) => {
        if (!info || typeof info !== 'object') return;
        set((state) => ({
          companyInfo: { ...state.companyInfo, ...info }
        }));
        console.log('📥 Company info updated from server');
      },
      
      setAppearance: (settings) => {
        if (!settings || typeof settings !== 'object') return;
        set((state) => ({
          appearance: { ...state.appearance, ...settings }
        }));
        console.log('📥 Appearance settings updated from server');
      },

      // Update Company Info
      updateCompanyInfo: (info) => {
        set((state) => ({
          companyInfo: { ...state.companyInfo, ...info }
        }));
      },

      // Update Appearance
      updateAppearance: (settings) => {
        set((state) => ({
          appearance: { ...state.appearance, ...settings }
        }));
      },

      // Update Slideshow Settings
      updateSlideshow: (settings) => {
        set((state) => ({
          slideshow: { ...state.slideshow, ...settings }
        }));
      },

      // Add Slide
      addSlide: (slide) => {
        const newSlide = {
          ...slide,
          id: Date.now(),
          active: true
        };
        set((state) => ({
          slideshow: {
            ...state.slideshow,
            slides: [...state.slideshow.slides, newSlide]
          }
        }));
        return newSlide;
      },

      // Update Slide
      updateSlide: (id, updates) => {
        set((state) => ({
          slideshow: {
            ...state.slideshow,
            slides: state.slideshow.slides.map(s => 
              s.id === id ? { ...s, ...updates } : s
            )
          }
        }));
      },

      // Delete Slide
      deleteSlide: (id) => {
        set((state) => ({
          slideshow: {
            ...state.slideshow,
            slides: state.slideshow.slides.filter(s => s.id !== id)
          }
        }));
      },

      // Update Email Settings
      updateEmailSettings: (settings) => {
        set((state) => ({
          emailSettings: { ...state.emailSettings, ...settings }
        }));
      },

      // Update Order Settings
      updateOrderSettings: (settings) => {
        set((state) => ({
          orderSettings: { ...state.orderSettings, ...settings }
        }));
      },

      // Update Notifications
      updateNotifications: (settings) => {
        set((state) => ({
          notifications: { ...state.notifications, ...settings }
        }));
      },

      // Update SEO Settings
      updateSEO: (settings) => {
        set((state) => ({
          seo: { ...state.seo, ...settings }
        }));
      },

      // Update Business Hours
      updateBusinessHours: (hours) => {
        set((state) => ({
          businessHours: { ...state.businessHours, ...hours }
        }));
      },

      // Reset to Defaults
      resetToDefaults: () => {
        set({
          companyInfo: {
            name: 'Bonnesante Medicals',
            slogan: 'Your Wound Care Partner',
            logo: '/logo.png',
            favicon: '/favicon.svg',
            email: 'astrobsm@gmail.com',
            phone: '+234 902 872 4839',
            phone2: '+234 702 575 5406',
            address: '17A Isuofia Street, Federal Housing Estate Trans Ekulu, Enugu',
            city: 'Enugu',
            state: 'Enugu State',
            country: 'Nigeria',
            website: 'www.bonnesantemedicals.com',
            socialMedia: {
              facebook: '',
              twitter: '',
              instagram: '',
              linkedin: '',
              whatsapp: '+2349028724839'
            }
          },
          appearance: {
            primaryColor: '#287D4D',
            secondaryColor: '#4CAF50',
            accentColor: '#FFD700',
            fontFamily: 'Inter, system-ui, sans-serif',
            headingFont: 'Playfair Display, serif',
            fontSize: 'medium',
            borderRadius: 'rounded',
            darkMode: false
          }
        });
      }
    }),
    { name: 'settings-storage' }
  )
);
