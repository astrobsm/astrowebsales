import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

const INITIAL_SEMINARS = [
  {
    id: 'sem-001',
    title: 'Advanced Wound Dressing Techniques',
    description: 'Learn advanced wound dressing techniques from industry experts. This comprehensive workshop covers modern wound dressing materials, application techniques for different wound types, dressing change protocols, and managing complications.',
    date: '2026-02-15',
    time: '10:00 AM - 3:00 PM',
    location: 'Lagos Continental Hotel, Victoria Island',
    venue_type: 'physical',
    capacity: 50,
    registered_count: 45,
    speaker: 'Dr. Chioma Okonkwo',
    level: 'Intermediate',
    price: 'Free',
    topics: [
      'Modern wound dressing materials',
      'Application techniques for different wound types',
      'Dressing change protocols',
      'Managing complications'
    ],
    image: '/images/seminars/wound-dressing.jpg',
    registration_open: true,
    featured: true,
    createdAt: '2026-01-01'
  },
  {
    id: 'sem-002',
    title: 'Diabetic Foot Care Workshop',
    description: 'Comprehensive training on diabetic foot wound pathophysiology, prevention strategies, treatment protocols, and patient education methods. Essential for healthcare professionals managing diabetic patients.',
    date: '2026-02-22',
    time: '9:00 AM - 4:00 PM',
    location: 'Transcorp Hilton, Abuja',
    venue_type: 'physical',
    capacity: 40,
    registered_count: 32,
    speaker: 'Prof. Adebayo Adeleke',
    level: 'All Levels',
    price: 'Free',
    topics: [
      'Diabetic wound pathophysiology',
      'Prevention strategies',
      'Treatment protocols',
      'Patient education methods'
    ],
    image: '/images/seminars/diabetic-care.jpg',
    registration_open: true,
    featured: true,
    createdAt: '2026-01-01'
  },
  {
    id: 'sem-003',
    title: 'Pressure Ulcer Prevention & Management',
    description: 'Evidence-based training on pressure ulcer risk assessment, prevention strategies in healthcare settings, treatment options, and documentation best practices.',
    date: '2026-03-05',
    time: '10:00 AM - 2:00 PM',
    location: 'Hotel Presidential, Port Harcourt',
    venue_type: 'physical',
    capacity: 45,
    registered_count: 28,
    speaker: 'Dr. Ngozi Eze',
    level: 'Beginner',
    price: 'Free',
    topics: [
      'Risk assessment tools',
      'Prevention strategies in healthcare settings',
      'Treatment options',
      'Documentation best practices'
    ],
    image: '/images/seminars/pressure-ulcer.jpg',
    registration_open: true,
    featured: true,
    createdAt: '2026-01-01'
  },
  {
    id: 'sem-004',
    title: 'Advanced Wound Care for Nurses',
    description: 'Intensive full-day training covering complex wound assessment, advanced treatment modalities, negative pressure wound therapy (NPWT), and case studies with practical sessions.',
    date: '2026-03-18',
    time: '9:00 AM - 5:00 PM',
    location: 'Ibom Hotel & Golf Resort, Uyo',
    venue_type: 'physical',
    capacity: 35,
    registered_count: 15,
    speaker: 'Dr. Emeka Obi & Nurse Mary Adeyemi',
    level: 'Advanced',
    price: 'Free',
    topics: [
      'Complex wound assessment',
      'Advanced treatment modalities',
      'Negative pressure wound therapy',
      'Case studies and practical sessions'
    ],
    image: '/images/seminars/nursing-workshop.jpg',
    registration_open: true,
    featured: true,
    createdAt: '2026-01-01'
  }
];

const PAST_SEMINARS = [
  {
    id: 'past-001',
    title: 'Introduction to Wound Care Management',
    date: '2026-01-10',
    location: 'Lagos',
    attended: 50
  },
  {
    id: 'past-002',
    title: 'Infection Control in Wound Care',
    date: '2025-12-15',
    location: 'Abuja',
    attended: 42
  },
  {
    id: 'past-003',
    title: 'Burn Wound Management',
    date: '2025-11-20',
    location: 'Kano',
    attended: 38
  }
];

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
