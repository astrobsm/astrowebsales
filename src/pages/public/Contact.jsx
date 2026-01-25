import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFeedbackStore } from '../../store/feedbackStore';

const Contact = () => {
  const { addFeedback } = useFeedbackStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [feedbackData, setFeedbackData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'general',
    rating: 0,
    message: ''
  });

  const [activeTab, setActiveTab] = useState('contact');

  // WhatsApp helper function
  const getWhatsAppLink = (phone, message = '') => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}${message ? `?text=${encodedMessage}` : ''}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, this would send to backend
    toast.success('Message sent successfully! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFeedbackChange = (e) => {
    setFeedbackData({
      ...feedbackData,
      [e.target.name]: e.target.value
    });
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackData.message) {
      toast.error('Please enter your feedback');
      return;
    }
    const result = addFeedback({
      ...feedbackData,
      subject: `${feedbackData.type.charAt(0).toUpperCase() + feedbackData.type.slice(1)} Feedback`
    });
    
    if (result.success) {
      toast.success('Thank you for your feedback! We appreciate your input.');
      setFeedbackData({ name: '', email: '', phone: '', type: 'general', rating: 0, message: '' });
    }
  };

  const offices = [
    {
      title: 'Head Office',
      address: '17A Isuofia Street Federal Housing Estate Trans Ekulu, Enugu',
      phone: '+2349028724839',
      phoneDisplay: '+234 902 872 4839 | +234 702 575 5406',
      email: 'astrobsm@gmail.com',
      hours: 'Mon - Fri: 8:00 AM - 5:00 PM'
    },
    {
      title: 'Lagos Office',
      address: '39 Bamgboye Street, Agiliti Estate, Mile 12, Lagos',
      phone: '+2348037325194',
      phoneDisplay: '+234 803 732 5194',
      email: 'lagos@bonnesante.com',
      hours: 'Mon - Fri: 8:00 AM - 5:00 PM'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <img src="/logo.png" alt="Bonnesante Medicals" className="w-16 h-16 object-contain bg-white rounded-full p-2" />
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold">
                Get in Touch
              </h1>
              <p className="text-xl text-primary-100">
                Have questions about our products or services? We're here to help!
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow inline-flex">
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'contact'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Contact Us
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'feedback'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Give Feedback
            </button>
          </div>
        </div>

        {activeTab === 'contact' ? (
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <h2 className="text-2xl font-display font-bold mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select a subject</option>
                      <option value="product_inquiry">Product Inquiry</option>
                      <option value="distributor">Become a Distributor</option>
                      <option value="seminar">Seminar Registration</option>
                      <option value="support">Technical Support</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>

                <button type="submit" className="w-full btn-primary flex items-center justify-center">
                  <Send size={18} className="mr-2" />
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <div className="space-y-6">
              {/* Quick Contact */}
              <div className="card p-6">
                <h3 className="font-display font-semibold text-lg mb-4">Quick Contact</h3>
                <div className="space-y-4">
                  <a 
                    href={getWhatsAppLink('2349028724839', 'Hello, I would like to inquire about your products.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-700 hover:text-green-600 transition-colors"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <MessageCircle size={18} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">WhatsApp</p>
                      <p className="font-medium">+234 902 872 4839</p>
                    </div>
                  </a>
                  <a 
                    href={getWhatsAppLink('2347025755406', 'Hello, I need assistance.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-700 hover:text-green-600 transition-colors"
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <Phone size={18} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone/WhatsApp</p>
                      <p className="font-medium">+234 702 575 5406</p>
                    </div>
                  </a>
                  <a href="mailto:astrobsm@gmail.com" className="flex items-center text-gray-700 hover:text-primary-600 transition-colors">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <Mail size={18} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">astrobsm@gmail.com</p>
                    </div>
                  </a>
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-1">
                      <Clock size={18} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Business Hours</p>
                      <p className="font-medium">Mon - Fri: 8AM - 5PM</p>
                      <p className="text-sm text-gray-600">Sat: 9AM - 1PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Support */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-2">24/7 Emergency Support</h3>
                <p className="text-sm text-green-700 mb-3">
                  For urgent inquiries and emergency orders
                </p>
                <a 
                  href={getWhatsAppLink('2347025755406', 'URGENT: I need emergency assistance with an order.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  <MessageCircle size={16} className="mr-2" />
                  +234 702 575 5406
                </a>
              </div>
            </div>
          </div>
        </div>
        ) : (
          /* Feedback Form */
          <div className="max-w-2xl mx-auto">
            <div className="card p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-display font-bold mb-2">Share Your Feedback</h2>
                <p className="text-gray-600">Help us improve our products and services</p>
              </div>
              
              <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={feedbackData.name}
                      onChange={handleFeedbackChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={feedbackData.email}
                      onChange={handleFeedbackChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={feedbackData.phone}
                      onChange={handleFeedbackChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback Type *
                    </label>
                    <select
                      name="type"
                      value={feedbackData.type}
                      onChange={handleFeedbackChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="general">General Feedback</option>
                      <option value="praise">Praise / Compliment</option>
                      <option value="suggestion">Suggestion</option>
                      <option value="complaint">Complaint</option>
                    </select>
                  </div>
                </div>

                {/* Star Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rate Your Experience
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                        className="focus:outline-none"
                      >
                        <Star
                          size={32}
                          className={`${
                            star <= feedbackData.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          } hover:text-yellow-400 transition`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Feedback *
                  </label>
                  <textarea
                    name="message"
                    value={feedbackData.message}
                    onChange={handleFeedbackChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Tell us about your experience..."
                  ></textarea>
                </div>

                <button type="submit" className="w-full btn-primary flex items-center justify-center">
                  <Send size={18} className="mr-2" />
                  Submit Feedback
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Offices */}
        <div className="mt-16">
          <h2 className="section-title mb-8">Our Offices</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {offices.map((office, index) => (
              <div key={index} className="card p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">{office.title}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start text-gray-600">
                    <MapPin size={16} className="mr-2 mt-1 flex-shrink-0 text-primary-500" />
                    <span>{office.address}</span>
                  </div>
                  <a 
                    href={getWhatsAppLink(office.phone, `Hello, I'm contacting the ${office.title}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-green-600"
                  >
                    <MessageCircle size={16} className="mr-2 text-green-500" />
                    <span>{office.phoneDisplay}</span>
                  </a>
                  <a href={`mailto:${office.email}`} className="flex items-center text-gray-600 hover:text-primary-600">
                    <Mail size={16} className="mr-2 text-primary-500" />
                    <span>{office.email}</span>
                  </a>
                  <div className="flex items-center text-gray-600">
                    <Clock size={16} className="mr-2 text-primary-500" />
                    <span>{office.hours}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
