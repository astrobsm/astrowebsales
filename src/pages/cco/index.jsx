// CCO (Customer Care Officer) Dashboard Pages
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore } from '../../store/orderStore';
import { useFeedbackStore } from '../../store/feedbackStore';
import { AlertTriangle, MessageSquare, Star, Clock, CheckCircle, Send, Filter, Eye, MessageCircle, ThumbsUp, AlertCircle, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';

export const CCODashboard = () => {
  const { user } = useAuthStore();
  const { getEscalatedOrders, fetchOrders } = useOrderStore();
  
  // Fetch fresh data on mount and periodically
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchOrders]);
  const { getAllFeedbacks, getNewFeedbacksCount, getFeedbackAnalytics } = useFeedbackStore();
  
  const escalatedOrders = getEscalatedOrders();
  const feedbacks = getAllFeedbacks();
  const newFeedbackCount = getNewFeedbacksCount();
  const analytics = getFeedbackAnalytics();

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <img src="/logo.png" alt="Bonnesante Medicals" className="w-12 h-12 object-contain" />
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Customer Care Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Escalated Orders</p>
              <p className="text-3xl font-bold text-gray-900">{escalatedOrders.length}</p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-white" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">New Feedbacks</p>
              <p className="text-3xl font-bold text-gray-900">{newFeedbackCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="text-white" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Feedbacks</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.total}</p>
            </div>
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
              <MessageCircle className="text-white" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Avg. Rating</p>
              <div className="flex items-center gap-1">
                <p className="text-3xl font-bold text-gray-900">{analytics.averageRating}</p>
                <Star className="text-yellow-400 fill-yellow-400" size={20} />
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Star className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Feedbacks */}
      <div className="card p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Customer Feedback</h2>
          <a href="/cco/feedback" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All →
          </a>
        </div>
        {feedbacks.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No feedback received yet</p>
        ) : (
          <div className="space-y-4">
            {feedbacks.slice(0, 3).map((feedback) => (
              <div key={feedback.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{feedback.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        feedback.type === 'complaint' ? 'bg-red-100 text-red-700' :
                        feedback.type === 'praise' ? 'bg-green-100 text-green-700' :
                        feedback.type === 'suggestion' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {feedback.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{feedback.message}</p>
                    {feedback.rating > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={star <= feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    feedback.status === 'new' ? 'bg-blue-100 text-blue-700' :
                    feedback.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {feedback.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Escalations */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Escalations</h2>
        {escalatedOrders.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No escalated orders at this time</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Order #</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Reason</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {escalatedOrders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="py-3 text-sm font-medium">{order.orderNumber}</td>
                    <td className="py-3 text-sm">{order.customerName}</td>
                    <td className="py-3 text-sm text-red-600">{order.escalationReason}</td>
                    <td className="py-3">
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export const CCOEscalations = () => {
  const { getEscalatedOrders } = useOrderStore();
  const escalatedOrders = getEscalatedOrders();

  return (
    <div>
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-6">Escalated Orders</h1>
      <div className="card p-6">
        {escalatedOrders.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No escalated orders</p>
        ) : (
          <div className="space-y-4">
            {escalatedOrders.map((order) => (
              <div key={order.id} className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">Order #{order.orderNumber}</p>
                    <p className="text-sm text-gray-600 mt-1">{order.customerName} - {order.customerPhone}</p>
                    <p className="text-sm text-red-600 mt-2">⚠️ {order.escalationReason}</p>
                  </div>
                  <button className="btn-primary">Take Action</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const CCOCommunications = () => {
  const { user } = useAuthStore();
  const { orders, fetchOrders } = useOrderStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState('general');
  const [communications, setCommunications] = useState(() => {
    const saved = localStorage.getItem('cco_communications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    localStorage.setItem('cco_communications', JSON.stringify(communications));
  }, [communications]);

  // Extract unique customers from orders
  const customers = React.useMemo(() => {
    const customerMap = new Map();
    orders.forEach(order => {
      const key = order.customerEmail || order.customerPhone || order.customerName;
      if (key && !customerMap.has(key)) {
        customerMap.set(key, {
          id: key,
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
          orderCount: 0,
          lastOrder: null
        });
      }
      if (customerMap.has(key)) {
        const customer = customerMap.get(key);
        customer.orderCount++;
        if (!customer.lastOrder || new Date(order.createdAt) > new Date(customer.lastOrder)) {
          customer.lastOrder = order.createdAt;
        }
      }
    });
    return Array.from(customerMap.values());
  }, [orders]);

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  const customerCommunications = selectedCustomer 
    ? communications.filter(c => c.customerId === selectedCustomer.id)
    : [];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedCustomer) {
      toast.error('Please select a customer and enter a message');
      return;
    }

    const comm = {
      id: Date.now().toString(),
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      type: messageType,
      message: newMessage,
      direction: 'outbound',
      staffName: user?.name || 'CCO Staff',
      createdAt: new Date().toISOString()
    };

    setCommunications(prev => [comm, ...prev]);
    toast.success('Message logged successfully');
    setNewMessage('');
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'complaint': return 'bg-red-100 text-red-700';
      case 'inquiry': return 'bg-blue-100 text-blue-700';
      case 'follow-up': return 'bg-yellow-100 text-yellow-700';
      case 'resolution': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <img src="/logo.png" alt="Bonnesante Medicals" className="w-12 h-12 object-contain" />
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Communications</h1>
          <p className="text-gray-600">Manage customer communications and follow-ups</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-gray-600">Total Customers</p>
          <p className="text-2xl font-bold">{customers.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">Communications Today</p>
          <p className="text-2xl font-bold">
            {communications.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">This Week</p>
          <p className="text-2xl font-bold">
            {communications.filter(c => {
              const d = new Date(c.createdAt);
              const now = new Date();
              const weekAgo = new Date(now.setDate(now.getDate() - 7));
              return d >= weekAgo;
            }).length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">Total Logs</p>
          <p className="text-2xl font-bold">{communications.length}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="card p-4">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No customers found</p>
            ) : (
              filteredCustomers.map(customer => (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`p-3 border rounded-lg cursor-pointer transition ${
                    selectedCustomer?.id === customer.id 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <p className="font-medium text-gray-900">{customer.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">{customer.phone || customer.email}</p>
                  <p className="text-xs text-gray-500">{customer.orderCount} order(s)</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Communication Panel */}
        <div className="lg:col-span-2 card p-4">
          {selectedCustomer ? (
            <div>
              <div className="border-b pb-4 mb-4">
                <h2 className="text-lg font-semibold">{selectedCustomer.name}</h2>
                <p className="text-sm text-gray-600">{selectedCustomer.phone} | {selectedCustomer.email}</p>
              </div>

              {/* Message Form */}
              <form onSubmit={handleSendMessage} className="mb-6">
                <div className="flex gap-2 mb-2">
                  <select
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="general">General</option>
                    <option value="inquiry">Inquiry</option>
                    <option value="complaint">Complaint</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="resolution">Resolution</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Log communication details..."
                    rows={3}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  <button type="submit" className="btn-primary self-end">
                    <Send size={18} />
                  </button>
                </div>
              </form>

              {/* Communication History */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Communication History</h3>
                {customerCommunications.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No communications logged</p>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {customerCommunications.map(comm => (
                      <div key={comm.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${getTypeColor(comm.type)}`}>
                            {comm.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comm.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comm.message}</p>
                        <p className="text-xs text-gray-500 mt-2">By: {comm.staffName}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
              <MessageSquare size={48} className="mb-4 opacity-50" />
              <p>Select a customer to view and log communications</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Feedback Management Page - visible to all staff and admin
export const CCOFeedback = () => {
  const { user } = useAuthStore();
  const { 
    getAllFeedbacks, 
    getFeedbacksByStatus, 
    getFeedbacksByType,
    updateFeedbackStatus, 
    addResponse,
    getFeedbackAnalytics 
  } = useFeedbackStore();
  
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  
  const analytics = getFeedbackAnalytics();
  
  // Get filtered feedbacks
  let feedbacks = getAllFeedbacks();
  if (filter !== 'all') {
    feedbacks = getFeedbacksByStatus(filter);
  }
  if (typeFilter !== 'all') {
    feedbacks = feedbacks.filter(f => f.type === typeFilter);
  }

  const handleStatusUpdate = (feedbackId, newStatus) => {
    updateFeedbackStatus(feedbackId, newStatus);
    toast.success(`Status updated to ${newStatus}`);
  };

  const handleAddResponse = (e) => {
    e.preventDefault();
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }
    
    addResponse(selectedFeedback.id, responseText, user?.name || 'Staff', isInternal);
    toast.success('Response added successfully');
    setResponseText('');
    setIsInternal(false);
    
    // Refresh selected feedback
    const updated = getAllFeedbacks().find(f => f.id === selectedFeedback.id);
    setSelectedFeedback(updated);
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'complaint': return <AlertCircle className="text-red-500" size={18} />;
      case 'praise': return <ThumbsUp className="text-green-500" size={18} />;
      case 'suggestion': return <Lightbulb className="text-blue-500" size={18} />;
      default: return <MessageCircle className="text-gray-500" size={18} />;
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <img src="/logo.png" alt="Bonnesante Medicals" className="w-12 h-12 object-contain" />
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Customer Feedback</h1>
          <p className="text-gray-600">Manage and respond to customer feedback</p>
        </div>
      </div>

      {/* Analytics Cards */}
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Feedback List */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Feedback List ({feedbacks.length})</h2>
          {feedbacks.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No feedback found</p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {feedbacks.map((feedback) => (
                <div 
                  key={feedback.id}
                  onClick={() => setSelectedFeedback(feedback)}
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    selectedFeedback?.id === feedback.id 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(feedback.type)}
                      <span className="font-medium text-gray-900">{feedback.name}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      feedback.status === 'new' ? 'bg-blue-100 text-blue-700' :
                      feedback.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {feedback.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{feedback.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      {feedback.rating > 0 && [1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          className={star <= feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {feedback.responses?.length > 0 && (
                    <div className="mt-2 text-xs text-primary-600">
                      {feedback.responses.length} response(s)
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feedback Detail */}
        <div className="card p-6">
          {selectedFeedback ? (
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{selectedFeedback.name}</h2>
                  <p className="text-sm text-gray-600">{selectedFeedback.email}</p>
                  {selectedFeedback.phone && (
                    <p className="text-sm text-gray-600">{selectedFeedback.phone}</p>
                  )}
                </div>
                <select
                  value={selectedFeedback.status}
                  onChange={(e) => handleStatusUpdate(selectedFeedback.id, e.target.value)}
                  className={`text-sm rounded-lg px-3 py-1 border ${
                    selectedFeedback.status === 'new' ? 'bg-blue-50 border-blue-200' :
                    selectedFeedback.status === 'in-progress' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-green-50 border-green-200'
                  }`}
                >
                  <option value="new">New</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <span className={`px-2 py-1 rounded text-sm ${
                  selectedFeedback.type === 'complaint' ? 'bg-red-100 text-red-700' :
                  selectedFeedback.type === 'praise' ? 'bg-green-100 text-green-700' :
                  selectedFeedback.type === 'suggestion' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {selectedFeedback.type}
                </span>
                {selectedFeedback.rating > 0 && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={star <= selectedFeedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                )}
                <span className="text-sm text-gray-500">
                  <Clock size={14} className="inline mr-1" />
                  {new Date(selectedFeedback.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-800">{selectedFeedback.message}</p>
              </div>

              {/* Responses */}
              {selectedFeedback.responses?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Responses</h3>
                  <div className="space-y-3">
                    {selectedFeedback.responses.map((response) => (
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

              {/* Add Response */}
              <form onSubmit={handleAddResponse}>
                <h3 className="font-medium text-gray-900 mb-3">Add Response</h3>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your response..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <div className="flex items-center justify-between mt-3">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Internal note (not visible to customer)
                  </label>
                  <button type="submit" className="btn-primary flex items-center gap-2">
                    <Send size={16} />
                    Send Response
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
              <Eye size={48} className="mb-4 opacity-50" />
              <p>Select a feedback to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
