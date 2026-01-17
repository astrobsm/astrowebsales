import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFeedbackStore = create(
  persist(
    (set, get) => ({
      feedbacks: [],
      
      // Add new feedback
      addFeedback: (feedbackData) => {
        const newFeedback = {
          id: `FB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: feedbackData.name,
          email: feedbackData.email,
          phone: feedbackData.phone || '',
          subject: feedbackData.subject,
          message: feedbackData.message,
          rating: feedbackData.rating || 0,
          type: feedbackData.type || 'general', // general, complaint, suggestion, praise
          status: 'new', // new, in-progress, resolved, closed
          priority: feedbackData.priority || 'normal', // low, normal, high, urgent
          assignedTo: null,
          responses: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        set((state) => ({
          feedbacks: [newFeedback, ...state.feedbacks]
        }));

        return { success: true, feedback: newFeedback };
      },

      // Get all feedbacks
      getAllFeedbacks: () => {
        return get().feedbacks;
      },

      // Get feedbacks by status
      getFeedbacksByStatus: (status) => {
        return get().feedbacks.filter(f => f.status === status);
      },

      // Get feedbacks by type
      getFeedbacksByType: (type) => {
        return get().feedbacks.filter(f => f.type === type);
      },

      // Get new feedbacks count
      getNewFeedbacksCount: () => {
        return get().feedbacks.filter(f => f.status === 'new').length;
      },

      // Get feedback by ID
      getFeedbackById: (id) => {
        return get().feedbacks.find(f => f.id === id);
      },

      // Update feedback status
      updateFeedbackStatus: (id, status, assignedTo = null) => {
        set((state) => ({
          feedbacks: state.feedbacks.map(f =>
            f.id === id
              ? { ...f, status, assignedTo, updatedAt: new Date().toISOString() }
              : f
          )
        }));
      },

      // Add response to feedback
      addResponse: (feedbackId, responseData) => {
        const response = {
          id: `RES-${Date.now()}`,
          staffId: responseData.staffId,
          staffName: responseData.staffName,
          staffRole: responseData.staffRole,
          message: responseData.message,
          isInternal: responseData.isInternal || false, // Internal notes vs customer-facing
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          feedbacks: state.feedbacks.map(f =>
            f.id === feedbackId
              ? { 
                  ...f, 
                  responses: [...f.responses, response],
                  status: f.status === 'new' ? 'in-progress' : f.status,
                  updatedAt: new Date().toISOString()
                }
              : f
          )
        }));

        return { success: true, response };
      },

      // Delete feedback
      deleteFeedback: (id) => {
        set((state) => ({
          feedbacks: state.feedbacks.filter(f => f.id !== id)
        }));
      },

      // Get analytics
      getFeedbackAnalytics: () => {
        const feedbacks = get().feedbacks;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const newCount = feedbacks.filter(f => f.status === 'new').length;
        const inProgressCount = feedbacks.filter(f => f.status === 'in-progress').length;
        const resolvedCount = feedbacks.filter(f => f.status === 'resolved').length;
        const closedCount = feedbacks.filter(f => f.status === 'closed').length;

        return {
          total: feedbacks.length,
          new: newCount,
          inProgress: inProgressCount,
          resolved: resolvedCount,
          closed: closedCount,
          byStatus: {
            'new': newCount,
            'in-progress': inProgressCount,
            'resolved': resolvedCount,
            'closed': closedCount
          },
          todayCount: feedbacks.filter(f => new Date(f.createdAt) >= today).length,
          weekCount: feedbacks.filter(f => new Date(f.createdAt) >= thisWeek).length,
          monthCount: feedbacks.filter(f => new Date(f.createdAt) >= thisMonth).length,
          byType: {
            general: feedbacks.filter(f => f.type === 'general').length,
            complaint: feedbacks.filter(f => f.type === 'complaint').length,
            suggestion: feedbacks.filter(f => f.type === 'suggestion').length,
            praise: feedbacks.filter(f => f.type === 'praise').length
          },
          averageRating: feedbacks.length > 0
            ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.filter(f => f.rating > 0).length) || 0
            : 0
        };
      }
    }),
    { name: 'feedback-storage' }
  )
);
