import React from 'react';

const HeroCarousel = () => {
  const slides = [
    {
      id: 'cooldetox-promo',
      content: (
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/lovable-uploads/0bee6fc9-62a6-4b25-8ddd-b4d494c1117f.png"
            alt="CoolDetox - Natural Herbal Detox Blend Promotion"
            className="w-full h-full object-cover"
          />
        </div>
      )
    }
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="w-full h-[400px] sm:h-[500px] lg:h-[600px] xl:h-[700px]">
        {slides.map((slide) => (
          <div key={slide.id} className="w-full h-full">
            {slide.content}
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;