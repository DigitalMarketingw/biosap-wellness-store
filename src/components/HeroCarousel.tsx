import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroCarousel = () => {
  const navigate = useNavigate();

  const handleBannerClick = () => {
    navigate('/products');
  };

  return (
    <section className="relative overflow-hidden mt-2">
      <div className="relative overflow-hidden h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[450px]">
        <button 
          onClick={handleBannerClick}
          className="w-full h-full flex items-center justify-center cursor-pointer group transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="View all products - CoolDetox Natural Healing"
        >
          <img 
            src="/lovable-uploads/94af4784-e6f1-4624-a62f-c83d6379aea1.png"
            alt="CoolDetox - Natural Healing for Modern Life"
            className="w-full h-full object-cover transition-brightness duration-300 group-hover:brightness-110"
          />
        </button>
      </div>
    </section>
  );
};

export default HeroCarousel;