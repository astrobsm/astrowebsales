import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, ShoppingCart, Phone, Mail, MapPin, 
  Facebook, Twitter, Instagram, Linkedin, Youtube 
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import ProductSlideshow from '../components/ProductSlideshow';

const PublicLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const cartItemCount = useCartStore((state) => state.getItemCount());

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/products', label: 'Products' },
    { path: '/education', label: 'Health Education' },
    { path: '/seminars', label: 'Seminars' },
    { path: '/user-guides', label: 'User Guides' },
    { path: '/contact', label: 'Contact' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="bg-primary-800 text-white py-2 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <a href="https://wa.me/2349028724839?text=Hello,%20I%20would%20like%20to%20inquire%20about%20your%20products." target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-primary-200">
                <Phone size={14} className="mr-1" />
                +234 902 872 4839
              </a>
              <a href="mailto:astrobsm@gmail.com" className="hidden sm:flex items-center hover:text-primary-200">
                <Mail size={14} className="mr-1" />
                astrobsm@gmail.com
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <Link to="/retail-access" className="hover:text-primary-200">
                Order Now
              </Link>
              <span className="mx-2">|</span>
              <Link to="/login" className="hover:text-primary-200">
                Partner Login
              </Link>
              <span className="mx-2">|</span>
              <Link to="/staff-login" className="hover:text-primary-200">
                Staff Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Bonnesante Medicals" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="font-display font-bold text-xl text-primary-800">
                  BONNESANTE MEDICALS
                </h1>
                <p className="text-xs text-gray-500">WoundCare Solutions</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-primary-600'
                      : 'text-gray-600 hover:text-primary-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/cart" 
                className="relative p-2 text-gray-600 hover:text-primary-600"
              >
                <ShoppingCart size={24} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              
              <Link 
                to="/retail-access" 
                className="hidden sm:inline-block btn-primary"
              >
                Order Now
              </Link>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 text-gray-600"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t">
              <nav className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      isActive(link.path)
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/retail-access"
                  className="mx-4 btn-primary text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Order Now
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        {/* Featured Products Slideshow */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProductSlideshow variant="footer" autoPlay={true} interval={3000} />
        </div>

        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-display font-bold text-xl">B</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-white">
                    Bonnesante
                  </h3>
                  <p className="text-xs text-gray-400">Medicals</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6">
                Nigeria's leading wound care manufacturing company, providing premium 
                products for healthcare professionals and institutions.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary-400"><Facebook size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-primary-400"><Twitter size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-primary-400"><Instagram size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-primary-400"><Linkedin size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-primary-400"><Youtube size={20} /></a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display font-semibold text-white mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link to="/products" className="hover:text-primary-400">Products</Link></li>
                <li><Link to="/education" className="hover:text-primary-400">Health Education</Link></li>
                <li><Link to="/seminars" className="hover:text-primary-400">Seminars & Training</Link></li>
                <li><Link to="/about" className="hover:text-primary-400">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-primary-400">Contact</Link></li>
              </ul>
            </div>

            {/* For Partners */}
            <div>
              <h4 className="font-display font-semibold text-white mb-6">For Partners</h4>
              <ul className="space-y-3">
                <li><Link to="/login" className="hover:text-primary-400">Distributor Portal</Link></li>
                <li><Link to="/login" className="hover:text-primary-400">Wholesaler Access</Link></li>
                <li><Link to="/retail-access" className="hover:text-primary-400">Place Order</Link></li>
                <li><Link to="/become-distributor" className="hover:text-primary-400">Become a Distributor</Link></li>
                <li><Link to="/contact" className="hover:text-primary-400">Partner Resources</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display font-semibold text-white mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <MapPin size={20} className="text-primary-400 mr-3 mt-1 flex-shrink-0" />
                  <span>17A Isuofia Street Federal Housing Estate Trans Ekulu, Enugu, Nigeria</span>
                </li>
                <li className="flex items-center">
                  <Phone size={20} className="text-primary-400 mr-3 flex-shrink-0" />
                  <a href="https://wa.me/2349028724839?text=Hello,%20I%20would%20like%20to%20inquire%20about%20your%20products." target="_blank" rel="noopener noreferrer" className="hover:text-primary-400">
                    +234 902 872 4839 | +234 702 575 5406
                  </a>
                </li>
                <li className="flex items-center">
                  <Mail size={20} className="text-primary-400 mr-3 flex-shrink-0" />
                  <a href="mailto:astrobsm@gmail.com" className="hover:text-primary-400">
                    astrobsm@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} Bonnesante Medicals. All rights reserved.
              </p>
              <p className="text-gray-500 text-sm mt-2 md:mt-0">
                Powered by <span className="text-primary-400 font-semibold">ASTROBSM Sales Platform</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
