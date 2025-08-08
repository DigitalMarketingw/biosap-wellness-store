import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroCarousel = () => {
  const navigate = useNavigate();

  const handleBannerClick = () => {
    navigate('/products');
  };

  return (
    <section className="relative overflow-hidden mt-2" aria-label="Hero banner">
      <div className="relative overflow-hidden h-[220px] sm:h-[300px] md:h-[400px] lg:h-[500px] xl:h-[700px]">
        <button
          onClick={handleBannerClick}
          className="w-full h-full flex items-center justify-center cursor-pointer group transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="View all products - CoolDetox Natural Healing"
        >
          <img
            src="/lovable-uploads/b455fd03-ad68-4e39-bfae-01c255a5c997.png"
            alt="CoolDetox banner promoting natural healing for modern life"
            className="w-full h-full object-cover transition-[filter,transform] duration-300 group-hover:brightness-110"
            loading="eager"
          />
        </button>
      </div>
    </section>
  );
};

export default HeroCarousel;
