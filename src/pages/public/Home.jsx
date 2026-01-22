import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Shield, Heart, Users, Truck, Award, 
  CheckCircle, Star, PlayCircle, ChevronRight, Calendar, MapPin, Clock,
  Smartphone, ExternalLink
} from 'lucide-react';
import ProductSlideshow from '../../components/ProductSlideshow';
import { useSeminarStore } from '../../store/seminarStore';
import { useContentStore } from '../../store/contentStore';

const Home = () => {
  const { getUpcomingSeminars } = useSeminarStore();
  const { getFeaturedApps, clinicalApps, fetchContentFromServer } = useContentStore();
  const upcomingSeminars = getUpcomingSeminars().slice(0, 3);
  const featuredApps = getFeaturedApps().slice(0, 4);

  // Fetch content from server on mount to ensure latest data
  useEffect(() => {
    fetchContentFromServer();
  }, [fetchContentFromServer]);

  const features = [
    {
      icon: Shield,
      title: 'Quality Products',
      description: 'Premium wound care products manufactured to international standards'
    },
    {
      icon: Truck,
      title: 'Nationwide Delivery',
      description: 'Fast and reliable delivery across all 36 states of Nigeria'
    },
    {
      icon: Users,
      title: 'Expert Support',
      description: 'Dedicated customer care team to assist with all your needs'
    },
    {
      icon: Award,
      title: 'Certified Excellence',
      description: 'NAFDAC approved products with ISO quality certification'
    }
  ];

  const stats = [
    { value: '500+', label: 'Healthcare Partners' },
    { value: '36', label: 'States Covered' },
    { value: '50K+', label: 'Products Delivered' },
    { value: '10+', label: 'Years Experience' }
  ];

  const categories = [
    { 
      name: 'Wound Dressings', 
      image: '🩹', 
      count: 25,
      description: 'Advanced dressings for optimal wound healing'
    },
    { 
      name: 'Antiseptics', 
      image: '🧴', 
      count: 12,
      description: 'Effective solutions for wound cleaning'
    },
    { 
      name: 'Bandages & Gauze', 
      image: '🩺', 
      count: 18,
      description: 'Quality wrapping and protective materials'
    },
    { 
      name: 'First Aid Kits', 
      image: '🧰', 
      count: 8,
      description: 'Complete wound care solutions'
    }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section with Product Slideshow */}
      <section className="relative gradient-hero text-white py-12 lg:py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <div className="inline-flex items-center bg-white/20 rounded-full px-4 py-2 mb-6">
                <Star className="w-4 h-4 text-yellow-400 mr-2" />
                <span className="text-sm font-medium">Nigeria's Leading Wound Care Company</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
                Premium Wound Care 
                <span className="block text-primary-200">Solutions for Africa</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-xl">
                Bonnesante Medicals provides high-quality wound care products to healthcare 
                professionals, clinics, and pharmacies across Nigeria.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/retail-access" 
                  className="inline-flex items-center justify-center bg-white text-primary-700 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                >
                  Order Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link 
                  to="/products" 
                  className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  View Products
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-96 h-96 bg-white/10 rounded-full absolute -top-10 -right-10"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl p-8">
                  <div className="text-center mb-6">
                    <span className="text-6xl">🏥</span>
                  </div>
                  <h3 className="text-primary-800 text-xl font-semibold text-center mb-4">
                    Easy Ordering Process
                  </h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      No account required for retail orders
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      Auto-assigned local distributor
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      Real-time order tracking
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      Multiple delivery options
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Slideshow */}
          <div className="mt-8">
            <ProductSlideshow variant="hero" autoPlay={true} interval={5000} />
          </div>
        </div>
        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl md:text-5xl font-display font-bold text-primary-600 mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Why Choose Bonnesante?</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              We're committed to providing the best wound care solutions with exceptional service
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h2 className="section-title">Product Categories</h2>
              <p className="section-subtitle">Explore our range of wound care products</p>
            </div>
            <Link 
              to="/products" 
              className="mt-4 md:mt-0 inline-flex items-center text-primary-600 font-semibold hover:text-primary-700"
            >
              View All Products
              <ChevronRight className="ml-1 w-5 h-5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link 
                key={index} 
                to="/products"
                className="card p-6 hover:border-primary-200 border-2 border-transparent transition-all"
              >
                <div className="text-5xl mb-4">{category.image}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{category.description}</p>
                <p className="text-primary-600 font-medium">{category.count} Products</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Health Education CTA */}
      <section className="py-20 bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                Wound Care Education Hub
              </h2>
              <p className="text-primary-200 text-lg mb-8">
                Access free educational resources on wound care management, diabetic foot care, 
                pressure sore prevention, and more. Empower yourself with knowledge.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/education" 
                  className="inline-flex items-center justify-center bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                >
                  <Heart className="mr-2 w-5 h-5" />
                  Explore Resources
                </Link>
                <Link 
                  to="/seminars" 
                  className="inline-flex items-center justify-center border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  <PlayCircle className="mr-2 w-5 h-5" />
                  View Seminars
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary-800 rounded-xl p-6">
                <span className="text-4xl">📚</span>
                <h4 className="font-semibold mt-3 mb-1">Articles</h4>
                <p className="text-sm text-primary-300">Expert-written guides</p>
              </div>
              <div className="bg-primary-800 rounded-xl p-6">
                <span className="text-4xl">🎥</span>
                <h4 className="font-semibold mt-3 mb-1">Videos</h4>
                <p className="text-sm text-primary-300">Step-by-step tutorials</p>
              </div>
              <div className="bg-primary-800 rounded-xl p-6">
                <span className="text-4xl">🎓</span>
                <h4 className="font-semibold mt-3 mb-1">Training</h4>
                <p className="text-sm text-primary-300">Professional courses</p>
              </div>
              <div className="bg-primary-800 rounded-xl p-6">
                <span className="text-4xl">📋</span>
                <h4 className="font-semibold mt-3 mb-1">Downloads</h4>
                <p className="text-sm text-primary-300">Free PDF resources</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Apps Section */}
      {featuredApps.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-primary-100 rounded-full px-4 py-2 mb-4">
                <Smartphone className="w-4 h-4 text-primary-600 mr-2" />
                <span className="text-sm font-medium text-primary-700">Clinical Tools</span>
              </div>
              <h2 className="section-title">Recommended Clinical Apps</h2>
              <p className="section-subtitle max-w-2xl mx-auto">
                Essential mobile and web applications for wound care professionals
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredApps.map((app) => (
                <a
                  key={app.id}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-primary-300 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{app.icon}</span>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {app.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{app.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">
                      {app.platform}
                    </span>
                    <div className="flex items-center text-sm">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="text-gray-600">{app.rating}</span>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    {app.price === 'Free' ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      <span className="text-gray-600">{app.price}</span>
                    )}
                  </div>
                </a>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link 
                to="/education?tab=apps"
                className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700"
              >
                View All Clinical Apps
                <ChevronRight className="ml-1 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Seminars Section */}
      {upcomingSeminars.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-accent-50 to-primary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="section-title">Upcoming Seminars & Workshops</h2>
              <p className="section-subtitle max-w-2xl mx-auto">
                Join our professional development seminars and earn continuing education credits
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingSeminars.map((seminar) => (
                <div 
                  key={seminar.id} 
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4">
                    <div className="flex items-center gap-2 text-primary-100 text-sm mb-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(seminar.date).toLocaleDateString('en-NG', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                    <h3 className="text-xl font-bold">{seminar.title}</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                        {seminar.location}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Clock className="w-4 h-4 mr-2 text-primary-500" />
                        {seminar.time}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Users className="w-4 h-4 mr-2 text-primary-500" />
                        {seminar.registered}/{seminar.capacity} registered
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {seminar.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-700">
                        {seminar.price === 'Free' ? 'Free' : `₦${parseInt(seminar.price).toLocaleString()}`}
                      </span>
                      <Link 
                        to={`/seminars/register/${seminar.id}`}
                        className="inline-flex items-center bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Register Now
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link 
                to="/seminars"
                className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700"
              >
                View All Seminars
                <ChevronRight className="ml-1 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title mb-4">Ready to Order?</h2>
          <p className="section-subtitle mb-8 max-w-2xl mx-auto">
            Get started with our simple, no-password-required ordering process. 
            Just enter your details and we'll connect you with your local distributor.
          </p>
          <Link 
            to="/retail-access" 
            className="inline-flex items-center btn-primary text-lg px-8 py-4"
          >
            Start Ordering Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
