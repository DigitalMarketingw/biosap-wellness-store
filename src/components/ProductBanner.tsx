import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AspectRatio } from './ui/aspect-ratio';

const ProductBanner = () => {
  const navigate = useNavigate();

  const handleBannerClick = () => {
    navigate('/products');
  };

  return (
    <section className="relative mt-8 mb-8" aria-label="MindMuse promotional banner">
      <AspectRatio ratio={16 / 6}>
        <button
          onClick={handleBannerClick}
          className="w-full h-full flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-transform hover:scale-[1.02]"
          aria-label="Explore MindMuse products - Shop now"
        >
          <img
            src="/lovable-uploads/5279cbc0-962b-4b9a-8781-4fcc6e572940.png"
            alt="MindMuse promotional banner - Explore our premium product collection"
            className="w-full h-full object-contain"
            loading="lazy"
            decoding="async"
          />
        </button>
      </AspectRatio>
    </section>
  );
};

export default ProductBanner;