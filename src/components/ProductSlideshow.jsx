import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useProductStore } from '../store/productStore';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function ProductSlideshow({ variant = 'hero', autoPlay = true, interval = 4000 }) {
  const { products, getActiveProducts, fetchProducts } = useProductStore();
  const activeProducts = getActiveProducts();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState('right');

  // Fetch products from database on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Featured products for slideshow - prioritize featured products
  const slideshowProducts = activeProducts.filter(p => p.isFeatured).length >= 3
    ? activeProducts.filter(p => p.isFeatured)
    : activeProducts.slice(0, 8);

  const nextSlide = useCallback(() => {
    if (isTransitioning || slideshowProducts.length === 0) return;
    setDirection('right');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slideshowProducts.length);
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning, slideshowProducts.length]);

  const prevSlide = useCallback(() => {
    if (isTransitioning || slideshowProducts.length === 0) return;
    setDirection('left');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + slideshowProducts.length) % slideshowProducts.length);
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning, slideshowProducts.length]);

  const goToSlide = (index) => {
    if (isTransitioning || index === currentIndex) return;
    setDirection(index > currentIndex ? 'right' : 'left');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  useEffect(() => {
    if (!autoPlay || slideshowProducts.length <= 1) return;
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, nextSlide, slideshowProducts.length]);

  if (slideshowProducts.length === 0) {
    return null;
  }

  const currentProduct = slideshowProducts[currentIndex];

  // Hero variant - Large slideshow for homepage hero section
  if (variant === 'hero') {
    return (
      <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 rounded-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Content Container */}
        <div className="relative h-full flex items-center justify-center px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center w-full max-w-6xl">
            
            {/* Product Image */}
            <div className="relative flex justify-center order-2 md:order-1">
              <div 
                className={`relative transform transition-all duration-500 ease-out
                  ${isTransitioning 
                    ? direction === 'right' 
                      ? '-translate-x-full opacity-0 scale-90' 
                      : 'translate-x-full opacity-0 scale-90'
                    : 'translate-x-0 opacity-100 scale-100'
                  }`}
                style={{ viewTransitionName: 'product-image' }}
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-accent-500/20 rounded-full blur-3xl transform scale-150" />
                
                {/* Product Image */}
                <div className="relative w-64 h-64 md:w-80 md:h-80 bg-white/10 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20">
                  {currentProduct.image ? (
                    <img 
                      src={currentProduct.image} 
                      alt={currentProduct.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-24 h-24 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                          <svg className="w-12 h-12 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <p className="text-white/60 text-sm">{currentProduct.category}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price Tag */}
                <div className="absolute -bottom-4 -right-4 bg-accent-500 text-white px-4 py-2 rounded-xl shadow-lg">
                  <p className="text-xs text-accent-100">From</p>
                  <p className="text-xl font-bold">₦{currentProduct.prices?.retail?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="text-white order-1 md:order-2">
              <div 
                className={`transform transition-all duration-500 ease-out delay-100
                  ${isTransitioning 
                    ? 'opacity-0 translate-y-4' 
                    : 'opacity-100 translate-y-0'
                  }`}
              >
                <span className="inline-block px-3 py-1 bg-accent-500/20 text-accent-300 rounded-full text-sm mb-4">
                  {currentProduct.category}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                  {currentProduct.name}
                </h2>
                <p className="text-white/80 text-lg mb-6 line-clamp-3">
                  {currentProduct.description}
                </p>
                
                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {currentProduct.specifications?.slice(0, 3).map((spec, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80">
                      {spec}
                    </span>
                  ))}
                </div>

                <Link 
                  to="/products" 
                  className="bg-accent-500 hover:bg-accent-600 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg shadow-accent-500/30 inline-block"
                >
                  View Product
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all border border-white/20"
        >
          <ChevronLeftIcon className="w-6 h-6 text-white" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all border border-white/20"
        >
          <ChevronRightIcon className="w-6 h-6 text-white" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slideshowProducts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentIndex 
                  ? 'bg-accent-500 w-8' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  // Footer variant - Compact horizontal slideshow
  if (variant === 'footer') {
    return (
      <div className="w-full py-8 bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden">
        <h3 className="text-center text-white/60 text-sm uppercase tracking-wider mb-6">
          Featured Products
        </h3>
        
        <div className="relative px-12">
          {/* Products Strip */}
          <div className="flex items-center justify-center gap-4 overflow-hidden">
            {slideshowProducts.slice(0, 5).map((product, idx) => {
              const isActive = idx === currentIndex;
              const offset = idx - currentIndex;
              
              return (
                <div
                  key={product.id}
                  onClick={() => goToSlide(idx)}
                  className={`relative cursor-pointer transition-all duration-500 ease-out transform
                    ${isActive 
                      ? 'scale-110 opacity-100 z-10' 
                      : 'scale-90 opacity-50 hover:opacity-75'
                    }`}
                  style={{
                    transform: `translateX(${offset * 20}px) scale(${isActive ? 1.1 : 0.9})`
                  }}
                >
                  <div className={`w-20 h-20 bg-white/10 rounded-xl p-2 border-2 transition-all
                    ${isActive ? 'border-accent-500' : 'border-transparent'}`}
                  >
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/40">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Product Name */}
          <div className="text-center mt-4">
            <p className="text-white font-medium">{currentProduct.name}</p>
            <p className="text-accent-400 text-sm">₦{currentProduct.prices?.retail?.toLocaleString()}</p>
          </div>

          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
          >
            <ChevronLeftIcon className="w-4 h-4 text-white" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
          >
            <ChevronRightIcon className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    );
  }

  // Mini variant - Small inline slideshow
  if (variant === 'mini') {
    return (
      <div className="inline-flex items-center gap-4 bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {currentProduct.image ? (
              <img 
                src={currentProduct.image} 
                alt={currentProduct.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm line-clamp-1">{currentProduct.name}</p>
            <p className="text-accent-600 font-bold">₦{currentProduct.prices?.retail?.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={prevSlide} className="p-1 hover:bg-gray-100 rounded">
            <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={nextSlide} className="p-1 hover:bg-gray-100 rounded">
            <ChevronRightIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
