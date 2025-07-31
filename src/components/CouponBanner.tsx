import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CouponBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem('coupon-banner-dismissed');
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('coupon-banner-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-2 px-4 relative overflow-hidden">
      <div className="container mx-auto flex items-center justify-center relative">
        <div className="text-center">
          <span className="text-sm md:text-base font-semibold animate-pulse">
            🎉 LIMITED TIME OFFER: Get 10% OFF on your first order! Use code: GLOWPASS10 🎉
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="absolute right-0 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Close banner"
        >
          <X size={16} />
        </button>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
    </div>
  );
};

export default CouponBanner;