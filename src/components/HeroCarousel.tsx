import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";

const HeroCarousel = () => {
  const navigate = useNavigate();

  const handleBannerClick = () => {
    navigate('/products');
  };

  const slides = [
    {
      id: 'cooldetox-promo',
      content: (
        <button 
          onClick={handleBannerClick}
          className="w-full h-full flex items-center justify-center cursor-pointer group transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="View all products - CoolDetox Natural Healing"
        >
          <img 
            src="/lovable-uploads/3b2ff640-d203-4685-828e-444598cbd3d9.png"
            alt="CoolDetox - Natural Healing for Modern Life"
            className="w-full h-full object-contain transition-brightness duration-300 group-hover:brightness-110"
          />
        </button>
      )
    },
    {
      id: 'mindmuse-promo',
      content: (
        <button 
          onClick={handleBannerClick}
          className="w-full h-full flex items-center justify-center cursor-pointer group transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="View all products - BioSAP MindMuse"
        >
          <img 
            src="/lovable-uploads/1ee52376-40c5-46ea-b044-6cff687f2d18.png"
            alt="BioSAP MindMuse - Ayurvedic Brain Health Supplement"
            className="w-full h-full object-contain transition-brightness duration-300 group-hover:brightness-110"
          />
        </button>
      )
    }
  ];

  return (
    <section className="relative overflow-hidden mt-2">
      <Carousel 
        className="w-full"
        plugins={[
          Autoplay({
            delay: 4000,
          }),
        ]}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-0">
          {slides.map((slide) => (
            <CarouselItem key={slide.id} className="pl-0">
              <div className="relative overflow-hidden h-[400px] sm:h-[500px] lg:h-[600px] xl:h-[700px]">
                {slide.content}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </section>
  );
};

export default HeroCarousel;