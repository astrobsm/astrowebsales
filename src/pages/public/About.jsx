import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Target, Eye, Award, Users, Building, Globe,
  CheckCircle, ArrowRight 
} from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Award,
      title: 'Quality Excellence',
      description: 'We maintain the highest standards in manufacturing and quality control.'
    },
    {
      icon: Users,
      title: 'Customer First',
      description: 'Our customers are at the heart of everything we do.'
    },
    {
      icon: Target,
      title: 'Innovation',
      description: 'Continuously improving our products with the latest technology.'
    },
    {
      icon: Globe,
      title: 'Accessibility',
      description: 'Making quality wound care products available across Nigeria.'
    }
  ];

  const milestones = [
    { year: '2014', event: 'Bonnesante Medicals founded in Lagos' },
    { year: '2016', event: 'NAFDAC certification achieved' },
    { year: '2018', event: 'Expanded to 18 states with regional distributors' },
    { year: '2020', event: 'Launched advanced wound care product line' },
    { year: '2022', event: 'ISO 13485 certification for medical devices' },
    { year: '2024', event: 'Full nationwide coverage with 36 state distributors' }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <img src="/logo.png" alt="Bonnesante Medicals" className="w-16 h-16 object-contain bg-white rounded-full p-2" />
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold">
                About Bonnesante Medicals
              </h1>
              <p className="text-xl text-primary-100 mt-2">
                Nigeria's leading wound care manufacturing company, committed to improving 
                patient outcomes through innovative, high-quality medical products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="card p-8 border-t-4 border-primary-500">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                  <Target className="w-7 h-7 text-primary-600" />
                </div>
                <h2 className="text-2xl font-display font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                To manufacture and distribute world-class wound care products that enhance 
                healing outcomes, while making quality healthcare accessible to every Nigerian. 
                We are committed to supporting healthcare professionals with reliable products 
                and comprehensive education.
              </p>
            </div>
            <div className="card p-8 border-t-4 border-accent-500">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-accent-100 rounded-full flex items-center justify-center mr-4">
                  <Eye className="w-7 h-7 text-accent-600" />
                </div>
                <h2 className="text-2xl font-display font-bold text-gray-900">Our Vision</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                To be Africa's most trusted wound care company, recognized for product excellence, 
                distribution efficiency, and commitment to healthcare education. We envision a 
                future where every patient has access to quality wound care solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title mb-6">Who We Are</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Bonnesante Medicals is a proudly Nigerian company specializing in the manufacturing 
                and distribution of premium wound care products. Founded in 2014, we have grown to 
                become the nation's leading wound care supplier, serving over 500 healthcare 
                facilities across all 36 states.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Our state-of-the-art manufacturing facility in Lagos produces a comprehensive range 
                of wound care products, from basic dressings to advanced therapeutic solutions. 
                Every product meets international quality standards and is approved by NAFDAC.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1" />
                  <span className="text-gray-700">NAFDAC Approved Products</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1" />
                  <span className="text-gray-700">ISO 13485 Certified Manufacturing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1" />
                  <span className="text-gray-700">Nationwide Distribution Network</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1" />
                  <span className="text-gray-700">24/7 Customer Support</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="bg-primary-100 rounded-2xl p-8">
                <div className="text-center mb-8">
                  <Building className="w-20 h-20 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900">Our Headquarters</h3>
                  <p className="text-gray-600">Lagos, Nigeria</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-3xl font-bold text-primary-600">50+</p>
                    <p className="text-sm text-gray-600">Products</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-3xl font-bold text-primary-600">36</p>
                    <p className="text-sm text-gray-600">States</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-3xl font-bold text-primary-600">200+</p>
                    <p className="text-sm text-gray-600">Employees</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-3xl font-bold text-primary-600">10+</p>
                    <p className="text-sm text-gray-600">Years</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Our Core Values</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Our Journey</h2>
            <p className="section-subtitle">Key milestones in our growth story</p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-primary-200"></div>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                    <div className="card p-4">
                      <p className="text-primary-600 font-bold text-lg">{milestone.year}</p>
                      <p className="text-gray-600">{milestone.event}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary-600 rounded-full border-4 border-white"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Partner With Us
          </h2>
          <p className="text-primary-200 text-lg mb-8 max-w-2xl mx-auto">
            Whether you're a healthcare facility, pharmacy, or interested in becoming 
            a distributor, we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact" 
              className="inline-flex items-center justify-center bg-white text-primary-700 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              Contact Us
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              to="/retail-access" 
              className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Start Ordering
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
