// Shared Feedback Component for all Staff and Admin
import React, { useState } from 'react';
import { useFeedbackStore } from '../../store/feedbackStore';
import { useAuthStore } from '../../store/authStore';
import { 
  Star, Clock, Filter, Eye, MessageCircle, ThumbsUp, 
  AlertCircle, Lightbulb, Send, ChevronDown, ChevronUp 
} from 'lucide-react';
import toast from 'react-hot-toast';

const StaffFeedback = ({ canRespond = false }) => {
  const { user } = useAuthStore();
  const { 
    getAllFeedbacks, 
    getFeedbacksByStatus, 
    updateFeedbackStatus, 
    addResponse,
    getFeedbackAnalytics 
  } = useFeedbackStore();
  
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [isInternal, setIsInternal] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  
  const analytics = getFeedbackAnalytics();
  
  // Get filtered feedbacks
  let feedbacks = getAllFeedbacks();
  if (filter !== 'all') {
    feedbacks = getFeedbacksByStatus(filter);
  }
  if (typeFilter !== 'all') {
    feedbacks = feedbacks.filter(f => f.type === typeFilter);
  }

  const handleAddResponse = (feedbackId) => {
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }
    
    addResponse(feedbackId, responseText, user?.name || 'Staff', isInternal);
    toast.success('Response added successfully');
    setResponseText('');
    setExpandedId(null);
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'complaint': return <AlertCircle className="text-red-500" size={18} />;
      case 'praise': return <ThumbsUp className="text-green-500" size={18} />;
      case 'suggestion': return <Lightbulb className="text-blue-500" size={18} />;
      default: return <MessageCircle className="text-gray-500" size={18} />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'complaint': return 'bg-red-100 text-red-700';
      case 'praise': return 'bg-green-100 text-green-700';
      case 'suggestion': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <img src="/logo.png" alt="Bonnesante Medicals" className="w-12 h-12 object-contain" />
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Customer Feedback</h1>
          <p className="text-gray-600">View customer feedback and responses</p>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{analytics.total}</p>
          <p className="text-sm text-gray-600">Total</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{analytics.byStatus.new}</p>
          <p className="text-sm text-gray-600">New</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{analytics.byStatus['in-progress']}</p>
          <p className="text-sm text-gray-600">In Progress</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{analytics.byStatus.resolved}</p>
          <p className="text-sm text-gray-600">Resolved</p>
        </div>
        <div className="card p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <p className="text-2xl font-bold text-yellow-500">{analytics.averageRating}</p>
            <Star className="text-yellow-400 fill-yellow-400" size={18} />
          </div>
          <p className="text-sm text-gray-600">Avg Rating</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <select 
          value={typeFilter} 
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Types</option>
          <option value="general">General</option>
          <option value="complaint">Complaint</option>
          <option value="praise">Praise</option>
          <option value="suggestion">Suggestion</option>
        </select>
      </div>

      {/* Feedback List */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">All Feedback ({feedbacks.length})</h2>
        {feedbacks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p>No feedback found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div 
                key={feedback.id}
                className="border rounded-lg overflow-hidden"
              >
                {/* Feedback Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(expandedId === feedback.id ? null : feedback.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTypeIcon(feedback.type)}
                        <span className="font-medium text-gray-900">{feedback.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getTypeColor(feedback.type)}`}>
                          {feedback.type}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          feedback.status === 'new' ? 'bg-blue-100 text-blue-700' :
                          feedback.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {feedback.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{feedback.message}</p>
                      <div className="flex items-center gap-4 mt-2">
                        {feedback.rating > 0 && (
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={12}
                                className={star <= feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                        )}
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </span>
                        {feedback.responses?.length > 0 && (
                          <span className="text-xs text-primary-600">
                            {feedback.responses.length} response(s)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      {expandedId === feedback.id ? (
                        <ChevronUp size={20} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedId === feedback.id && (
                  <div className="border-t p-4 bg-gray-50">
                    {/* Contact Info */}
                    <div className="mb-4 text-sm">
                      <p><span className="text-gray-500">Email:</span> {feedback.email}</p>
                      {feedback.phone && <p><span className="text-gray-500">Phone:</span> {feedback.phone}</p>}
                    </div>

                    {/* Full Message */}
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <p className="text-gray-800">{feedback.message}</p>
                    </div>

                    {/* Responses */}
                    {feedback.responses?.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Responses</h4>
                        <div className="space-y-2">
                          {feedback.responses.map((response) => (
                            <div 
                              key={response.id}
                              className={`p-3 rounded-lg ${
                                response.isInternal 
                                  ? 'bg-yellow-50 border border-yellow-200' 
                                  : 'bg-primary-50 border border-primary-200'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-sm">{response.respondedBy}</span>
                                {response.isInternal && (
                                  <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">
                                    Internal Note
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700">{response.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(response.respondedAt).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Response (if allowed) */}
                    {canRespond && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Add Response</h4>
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Type your response or internal note..."
                          rows={2}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        />
                        <div className="flex items-center justify-between mt-2">
                          <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                              type="checkbox"
                              checked={isInternal}
                              onChange={(e) => setIsInternal(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            Internal note only
                          </label>
                          <button 
                            onClick={() => handleAddResponse(feedback.id)}
                            className="btn-primary flex items-center gap-2 text-sm"
                          >
                            <Send size={14} />
                            Add Response
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffFeedback;
