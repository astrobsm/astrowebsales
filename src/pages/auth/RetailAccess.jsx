import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, MapPin, Mail, ArrowRight, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDistributorStore } from '../../store/distributorStore';
import { NIGERIAN_STATES } from '../../store/distributorStore';
import toast from 'react-hot-toast';

const RetailAccess = () => {
  const navigate = useNavigate();
  const { retailLogin } = useAuthStore();
  const { getDistributorForState } = useDistributorStore();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    state: '',
    landmark: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get assigned distributor based on state
    const distributor = getDistributorForState(formData.state);
    
    // Create retail user session
    const user = retailLogin({
      ...formData,
      assignedDistributor: distributor
    });
    
    toast.success(`Welcome ${formData.name}! You're connected to ${distributor.name}`);
    navigate('/shop');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-display font-bold text-xl">B</span>
            </div>
            <h1 className="font-display font-bold text-2xl text-primary-800">
              Bonnesante Medicals
            </h1>
          </Link>
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Start Your Order
          </h2>
          <p className="text-gray-600">
            No account or password needed. Just enter your details to get started.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 text-center">
            <Shield className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Secure</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <User className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">No Password</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <ArrowRight className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Fast Checkout</p>
          </div>
        </div>

        {/* Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="+234 800 000 0000"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">We'll use this for order updates</p>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address (Optional)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                >
                  <option value="">Select your state</option>
                  {NIGERIAN_STATES.map((state) => (
                    <option key={state.name} value={state.name}>
                      {state.name} ({state.zone})
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                We'll assign you to your local distributor
              </p>
            </div>

            {/* Delivery Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Enter your full delivery address"
              ></textarea>
            </div>

            {/* Landmark (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Landmark (Optional)
              </label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="E.g., Near Central Mosque, Opposite Police Station"
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="w-full btn-primary flex items-center justify-center text-lg py-4">
              Continue to Shop
              <ArrowRight className="ml-2" size={20} />
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-6 p-4 bg-primary-50 rounded-lg">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-primary-900">Secure & Private</p>
                <p className="text-xs text-primary-700 mt-1">
                  Your information is secure and will only be used for order processing. 
                  No account creation or password required.
                </p>
              </div>
            </div>
          </div>

          {/* Partner Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Are you a distributor or partner?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RetailAccess;
