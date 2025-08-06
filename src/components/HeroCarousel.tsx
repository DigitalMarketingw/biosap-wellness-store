import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { Leaf, Heart, Zap, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroCarousel = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });

    // Auto-play functionality
    const autoPlay = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(autoPlay);
  }, [api]);

  const slides = [
    // Slide 1: Natural Healing for Modern Life
    {
      id: 'natural-healing',
      background: 'bg-gradient-to-r from-green-600 via-green-500 to-emerald-500',
      content: (
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
              <Leaf className="h-5 w-5" />
              <span className="text-sm font-medium">Natural Herbal Blend</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Natural Healing
              <span className="block text-yellow-300">for Modern Life</span>
            </h1>
            
            <p className="text-xl text-green-50 max-w-lg">
              Experience the refreshing detox blend of Coriander, Mint, and Ginger. 
              Nature's perfect combination for cleansing and cooling wellness.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 px-8">
                  Shop Now
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600 px-8">
                  Learn More
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center space-x-6 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">Instant</div>
                <div className="text-sm text-green-100">Preparation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm text-green-100">Natural</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">Cooling</div>
                <div className="text-sm text-green-100">Effect</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square bg-white/10 rounded-full blur-3xl absolute inset-0 transform scale-150"></div>
            <img 
              src="/lovable-uploads/1aa37669-de0f-422b-81df-fabede344482.png" 
              alt="CoolDetox - Natural Herbal Detox Blend"
              className="relative z-10 w-full h-64 lg:h-80 object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )
    },
    
    // Slide 2: Digestive Comfort & Wellness
    {
      id: 'digestive-wellness',
      background: 'bg-gradient-to-r from-teal-600 via-cyan-500 to-blue-500',
      content: (
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
              <Zap className="h-5 w-5" />
              <span className="text-sm font-medium">Digestive Wellness</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Digestive Comfort
              <span className="block text-cyan-200">& Wellness</span>
            </h1>
            
            <p className="text-xl text-teal-50 max-w-lg">
              Gentle herbal infusion designed for digestive comfort. Instant preparation 
              meets traditional wellness in every refreshing sip.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-white text-teal-600 hover:bg-teal-50 px-8">
                  Start Wellness Journey
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-teal-600 px-8">
                Discover Benefits
              </Button>
            </div>
            
            <div className="flex items-center space-x-6 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">Gentle</div>
                <div className="text-sm text-teal-100">Formula</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">Herbal</div>
                <div className="text-sm text-teal-100">Infusion</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">Daily</div>
                <div className="text-sm text-teal-100">Wellness</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square bg-white/10 rounded-full blur-3xl absolute inset-0 transform scale-150"></div>
            <img 
              src="/lovable-uploads/1aa37669-de0f-422b-81df-fabede344482.png" 
              alt="CoolDetox - Digestive Comfort Blend"
              className="relative z-10 w-full h-64 lg:h-80 object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="relative overflow-hidden">
      <Carousel 
        setApi={setApi} 
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-0">
          {slides.map((slide, index) => (
            <CarouselItem key={slide.id} className="pl-0">
              <div className={`relative overflow-hidden h-[700px] lg:h-[800px] ${slide.background}`}>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative container mx-auto px-4 h-full flex items-center">
                  {slide.content}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 border-white/20 text-white hover:bg-white/30" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 border-white/20 text-white hover:bg-white/30" />
        
        {/* Dots Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                current === index ? 'bg-white' : 'bg-white/40'
              }`}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </section>
  );
};

export default HeroCarousel;