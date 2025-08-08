import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AspectRatio } from './ui/aspect-ratio';

const HeroCarousel = () => {
  const navigate = useNavigate();

  const handleBannerClick = () => {
    navigate('/products');
  };

  return (
    <section className="relative mt-2" aria-label="Hero banner">
      <AspectRatio ratio={16 / 7}>
        <button
          onClick={handleBannerClick}
          className="w-full h-full flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="View all products - CoolDetox Natural Healing"
        >
          <img
            src="/lovable-uploads/b455fd03-ad68-4e39-bfae-01c255a5c997.png"
            alt="CoolDetox banner promoting natural healing for modern life"
            className="w-full h-full object-contain"
            loading="eager"
            decoding="async"
          />
        </button>
      </AspectRatio>
    </section>
  );
};

export default HeroCarousel;
