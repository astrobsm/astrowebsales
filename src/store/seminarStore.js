import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// Seminars are now managed through the admin panel and synced from database
const INITIAL_SEMINARS = [];

// Past seminars are loaded from database
const PAST_SEMINARS = [];

export const useSeminarStore = create(
  persist(
    (set, get) => ({
      seminars: INITIAL_SEMINARS,
      pastSeminars: PAST_SEMINARS,
      registrations: [],

      getUpcomingSeminars: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().seminars.filter(s => s.date >= today && s.registration_open);
      },

      getFeaturedSeminars: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().seminars.filter(s => s.date >= today && s.featured).slice(0, 3);
      },

      getSeminarById: (id) => {
        return get().seminars.find(s => s.id === id);
      },

      getPastSeminars: () => {
        return get().pastSeminars || [];
      },

      generateRegistrationLink: (seminarId) => {
        const token = uuidv4().substring(0, 8);
        return `/seminar-register/${seminarId}?token=${token}`;
      },

      registerForSeminar: (seminarId, registrationData) => {
        const seminar = get().getSeminarById(seminarId);
        if (!seminar) return { success: false, message: 'Seminar not found' };
        
        if (seminar.registered_count >= seminar.capacity) {
          return { success: false, message: 'Seminar is full' };
        }

        const registration = {
          id: uuidv4(),
          seminarId,
          ...registrationData,
          registrationToken: uuidv4().substring(0, 12).toUpperCase(),
          confirmed: true,
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          registrations: [...state.registrations, registration],
          seminars: state.seminars.map(s =>
            s.id === seminarId
              ? { ...s, registered_count: s.registered_count + 1 }
              : s
          )
        }));

        return { success: true, message: 'Registration successful', registration };
      },

      addSeminar: (seminar) => {
        const newSeminar = {
          ...seminar,
          id: `sem-${Date.now()}`,
          registered_count: 0,
          registration_open: true,
          createdAt: new Date().toISOString()
        };
        set((state) => ({ seminars: [...state.seminars, newSeminar] }));
        return newSeminar;
      },

      updateSeminar: (seminarId, updates) => {
        set((state) => ({
          seminars: state.seminars.map((s) =>
            s.id === seminarId ? { ...s, ...updates } : s
          )
        }));
      },

      deleteSeminar: (seminarId) => {
        set((state) => ({
          seminars: state.seminars.filter((s) => s.id !== seminarId)
        }));
      },

      getRegistrations: (seminarId) => {
        return get().registrations.filter(r => r.seminarId === seminarId);
      }
    }),
    { name: 'seminar-storage' }
  )
);
