import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSeminarStore } from '../../store/seminarStore';
import { 
  Calendar, MapPin, Clock, Users, CheckCircle, AlertCircle, 
  ArrowLeft, User, Mail, Phone, Building2
} from 'lucide-react';

const SeminarRegistration = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { seminars, registerForSeminar, generateRegistrationLink } = useSeminarStore();
  
  const [seminar, setSeminar] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [registrationToken, setRegistrationToken] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    role: '',
    specialization: '',
    dietaryRequirements: '',
    agreeToTerms: false
  });

  useEffect(() => {
    const found = seminars.find(s => s.id === id);
    if (found) {
      setSeminar(found);
    }
  }, [id, seminars]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    if (seminar.registered >= seminar.capacity) {
      setError('This seminar is fully booked');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const token = registerForSeminar(id, formData);
      setRegistrationToken(token);
      setSuccess(true);
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!seminar) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Seminar Not Found</h1>
          <p className="text-gray-600 mb-8">The seminar you're looking for doesn't exist or has been removed.</p>
          <Link 
            to="/seminars"
            className="inline-flex items-center text-primary-600 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Seminars
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for registering for <strong>{seminar.title}</strong>
            </p>
            
            <div className="bg-primary-50 rounded-xl p-6 mb-6 text-left">
              <h3 className="font-semibold text-primary-800 mb-3">Registration Details</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Confirmation Number:</strong> {registrationToken.slice(0, 8).toUpperCase()}</p>
                <p><strong>Date:</strong> {new Date(seminar.date).toLocaleDateString('en-NG', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}</p>
                <p><strong>Time:</strong> {seminar.time}</p>
                <p><strong>Venue:</strong> {seminar.location}</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 mb-6">
              A confirmation email has been sent to <strong>{formData.email}</strong> with all the details.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/seminars"
                className="inline-flex items-center justify-center px-6 py-3 border border-primary-600 text-primary-600 rounded-lg font-medium hover:bg-primary-50"
              >
                View More Seminars
              </Link>
              <Link 
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const spotsLeft = seminar.capacity - seminar.registered;
  const isFullyBooked = spotsLeft <= 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Link */}
        <Link 
          to="/seminars"
          className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Seminars
        </Link>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Seminar Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-24">
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white p-6">
                <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm mb-3">
                  {seminar.type}
                </div>
                <h1 className="text-2xl font-bold mb-2">{seminar.title}</h1>
                <p className="text-primary-100 text-sm">{seminar.presenter}</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-3 text-primary-500" />
                  <span>
                    {new Date(seminar.date).toLocaleDateString('en-NG', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Clock className="w-5 h-5 mr-3 text-primary-500" />
                  <span>{seminar.time}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <MapPin className="w-5 h-5 mr-3 text-primary-500" />
                  <span>{seminar.location}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Users className="w-5 h-5 mr-3 text-primary-500" />
                  <span>
                    {isFullyBooked ? (
                      <span className="text-red-600 font-medium">Fully Booked</span>
                    ) : (
                      <span className={spotsLeft <= 10 ? 'text-orange-600 font-medium' : ''}>
                        {spotsLeft} spots remaining
                      </span>
                    )}
                  </span>
                </div>
                
                <hr className="my-4" />
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Registration Fee:</span>
                  <span className="text-2xl font-bold text-primary-700">
                    {seminar.price === 'Free' ? 'Free' : `₦${parseInt(seminar.price).toLocaleString()}`}
                  </span>
                </div>
                
                {seminar.cpdPoints && (
                  <div className="bg-accent-50 rounded-lg p-3 text-center">
                    <span className="text-accent-700 font-medium">
                      🏆 {seminar.cpdPoints} CPD Points
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Register for this Seminar</h2>
              
              {isFullyBooked ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">This Seminar is Fully Booked</h3>
                  <p className="text-gray-600 mb-6">Please check our other upcoming seminars.</p>
                  <Link 
                    to="/seminars"
                    className="inline-flex items-center text-primary-600 font-medium"
                  >
                    View Other Seminars
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      {error}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="+234 800 000 0000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Building2 className="w-4 h-4 inline mr-1" />
                        Organization/Hospital
                      </label>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Your workplace"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role/Position *
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select your role</option>
                        <option value="Nurse">Nurse</option>
                        <option value="Doctor">Doctor</option>
                        <option value="Pharmacist">Pharmacist</option>
                        <option value="Healthcare Administrator">Healthcare Administrator</option>
                        <option value="Student">Student</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., Wound Care, Diabetes Care"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dietary Requirements (if any)
                    </label>
                    <input
                      type="text"
                      name="dietaryRequirements"
                      value={formData.dietaryRequirements}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., Vegetarian, Halal, No dietary restrictions"
                    />
                  </div>

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="agreeToTerms" className="ml-3 text-sm text-gray-600">
                      I agree to the <Link to="/terms" className="text-primary-600 hover:underline">Terms and Conditions</Link> and 
                      understand that registration fees are non-refundable. I consent to receiving event-related communications.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        Complete Registration
                        <CheckCircle className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeminarRegistration;
