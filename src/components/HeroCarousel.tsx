import React from 'react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

const HeroCarousel = () => {
  const slides = [
    {
      id: 'cooldetox-promo',
      content: (
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/lovable-uploads/3b2ff640-d203-4685-828e-444598cbd3d9.png"
            alt="CoolDetox - Natural Healing for Modern Life"
            className="w-full h-full object-cover"
          />
        </div>
      )
    }
  ];

  return (
    <section className="relative overflow-hidden">
      <Carousel 
        className="w-full"
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
      </Carousel>
    </section>
  );
};

export default HeroCarousel;