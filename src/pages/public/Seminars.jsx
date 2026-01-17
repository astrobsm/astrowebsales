import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ArrowRight, CheckCircle, Award, Video } from 'lucide-react';
import { useSeminarStore } from '../../store/seminarStore';

const Seminars = () => {
  const { getUpcomingSeminars, getPastSeminars, pastSeminars: storedPastSeminars } = useSeminarStore();
  const upcomingSeminars = getUpcomingSeminars();
  const pastSeminars = getPastSeminars ? getPastSeminars() : storedPastSeminars || [];

  const benefits = [
    'Free attendance for healthcare professionals',
    'Hands-on practical sessions',
    'Certificate of attendance',
    'CPD points for nurses and doctors',
    'Networking opportunities',
    'Access to educational materials'
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSpotsLeft = (seminar) => seminar.capacity - seminar.registered;

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <img src="/logo.png" alt="Bonnesante Medicals" className="w-16 h-16 object-contain bg-white rounded-full p-2" />
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold">
                Seminars & Workshops
              </h1>
              <p className="text-xl text-primary-100 mt-2">
                Free professional development seminars for healthcare workers. 
                Enhance your wound care knowledge and earn CPD points.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-gray-700 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Seminars */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Upcoming Seminars</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Register for our free professional development seminars
            </p>
          </div>

          {upcomingSeminars.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No upcoming seminars at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="grid gap-8">
              {upcomingSeminars.map((seminar) => (
                <div key={seminar.id} className="card overflow-hidden">
                  <div className="md:flex">
                    {/* Date Badge */}
                    <div className="md:w-48 bg-gradient-to-br from-primary-600 to-primary-700 text-white p-6 flex flex-col justify-center items-center">
                      <span className="text-5xl font-bold">
                        {new Date(seminar.date).getDate()}
                      </span>
                      <span className="text-lg uppercase tracking-wide">
                        {new Date(seminar.date).toLocaleDateString('en-NG', { month: 'short' })}
                      </span>
                      <span className="text-sm text-primary-200">
                        {new Date(seminar.date).getFullYear()}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                          {seminar.type}
                        </span>
                        <span className="inline-block px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-xs font-medium">
                          {seminar.level}
                        </span>
                        {seminar.cpdPoints && (
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center">
                            <Award className="w-3 h-3 mr-1" />
                            {seminar.cpdPoints} CPD Points
                          </span>
                        )}
                      </div>

                      <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">
                        {seminar.title}
                      </h3>
                      
                      <p className="text-sm text-gray-500 mb-3">
                        Presented by {seminar.presenter}
                      </p>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {seminar.description}
                      </p>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-primary-500" />
                          {seminar.time}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                          {seminar.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-primary-500" />
                          {getSpotsLeft(seminar)} spots left
                        </div>
                        <div className="flex items-center text-sm font-semibold text-primary-700">
                          {seminar.price === 'Free' ? (
                            <span className="text-green-600">Free</span>
                          ) : (
                            <span>₦{parseInt(seminar.price).toLocaleString()}</span>
                          )}
                        </div>
                      </div>

                      {/* Topics */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Topics covered:</p>
                        <div className="flex flex-wrap gap-2">
                          {seminar.topics.slice(0, 4).map((topic, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                          <div 
                            className="bg-primary-500 h-2 rounded-full transition-all"
                            style={{ width: `${(seminar.registered / seminar.capacity) * 100}%` }}
                          ></div>
                        </div>
                        <Link 
                          to={`/seminars/register/${seminar.id}`}
                          className="flex-shrink-0 inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                          Register Now
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Past Seminars */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Past Seminars</h2>
            <p className="section-subtitle">A look at our previous training events</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pastSeminars.map((seminar) => (
              <div key={seminar.id} className="card p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(seminar.date)}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{seminar.title}</h3>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  {seminar.location}
                </div>
                <div className="flex items-center text-sm text-primary-600">
                  <Users className="w-4 h-4 mr-2" />
                  {seminar.attendees} attendees
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Host a Seminar in Your City
          </h2>
          <p className="text-primary-200 text-lg mb-8 max-w-2xl mx-auto">
            Want us to organize a wound care seminar at your hospital, nursing school, 
            or healthcare facility? Get in touch with our training team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact"
              className="inline-flex items-center justify-center bg-white text-primary-700 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              Request a Seminar
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Seminars;
