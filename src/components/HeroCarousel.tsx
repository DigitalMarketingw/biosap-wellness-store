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
    // Slide 1: Original Hero Banner
    {
      id: 'original',
      background: 'bg-gradient-to-r from-green-600 via-green-500 to-emerald-500',
      content: (
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
              <Leaf className="h-5 w-5" />
              <span className="text-sm font-medium">Pure Ayurvedic Wellness</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Natural Healing
              <span className="block text-yellow-300">for Modern Life</span>
            </h1>
            
            <p className="text-xl text-green-50 max-w-lg">
              Discover premium Ayurvedic products crafted with ancient wisdom and modern science. 
              Your journey to holistic wellness starts here.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 px-8">
                  Shop Now
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" className="border-white text-white hover:bg-white hover:text-green-600 px-8">
                  Learn More
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center space-x-6 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm text-green-100">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm text-green-100">Natural Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">5★</div>
                <div className="text-sm text-green-100">Average Rating</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square bg-white/10 rounded-full blur-3xl absolute inset-0 transform scale-150"></div>
            <img 
              src="/lovable-uploads/1aa37669-de0f-422b-81df-fabede344482.png" 
              alt="BIOSAP CoolDetox - Natural Detox Solution"
              className="relative z-10 w-full h-64 lg:h-80 object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )
    },
    
    // Slide 2: Women's Wellness Focus
    {
      id: 'womens-wellness',
      background: 'bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600',
      content: (
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
              <Heart className="h-5 w-5" />
              <span className="text-sm font-medium">Women's Wellness</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Empower Your
              <span className="block text-yellow-200">Feminine Strength</span>
            </h1>
            
            <p className="text-xl text-pink-50 max-w-lg">
              FEMVIT BRU provides comprehensive support for women's health with carefully selected natural ingredients for every stage of life.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-white text-pink-600 hover:bg-pink-50 px-8">
                  Explore Women's Range
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-pink-600 px-8">
                Learn Benefits
              </Button>
            </div>
            
            <div className="flex items-center space-x-6 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">98%</div>
                <div className="text-sm text-pink-100">Women Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">Natural</div>
                <div className="text-sm text-pink-100">Herbal Formula</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">Safe</div>
                <div className="text-sm text-pink-100">Daily Use</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square bg-white/10 rounded-full blur-3xl absolute inset-0 transform scale-150"></div>
            <img 
              src="/lovable-uploads/df78a984-412e-4645-b1d7-1ed1b8aacd7b.png" 
              alt="FEMVIT BRU - Women's Wellness Support"
              className="relative z-10 w-full h-64 lg:h-80 object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )
    },
    
    // Slide 3: Digestive Wellness Journey
    {
      id: 'digestive-wellness',
      background: 'bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-500',
      content: (
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
              <Zap className="h-5 w-5" />
              <span className="text-sm font-medium">Digestive Wellness</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Revitalize Your
              <span className="block text-orange-100">Digestive Journey</span>
            </h1>
            
            <p className="text-xl text-orange-50 max-w-lg">
              SmokyGinger's Green Tea and Ginger blend supports healthy digestion and provides soothing thermal comfort throughout your day.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 px-8">
                  Discover Digestive Range
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600 px-8">
                Health Benefits
              </Button>
            </div>
            
            <div className="flex items-center space-x-6 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">Fast</div>
                <div className="text-sm text-orange-100">Acting Formula</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">Gentle</div>
                <div className="text-sm text-orange-100">On Stomach</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">Herbal</div>
                <div className="text-sm text-orange-100">Tea Blend</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square bg-white/10 rounded-full blur-3xl absolute inset-0 transform scale-150"></div>
            <img 
              src="/lovable-uploads/1b0830d9-a2f7-49d9-9dbf-f738f13913fc.png" 
              alt="SmokyGinger - Digestive Health Tea"
              className="relative z-10 w-full h-64 lg:h-80 object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )
    },
    
    // Slide 4: Natural Detox & Cleansing
    {
      id: 'natural-detox',
      background: 'bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-600',
      content: (
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">Natural Detox</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Pure Body
              <span className="block text-violet-200">Natural Cleanse</span>
            </h1>
            
            <p className="text-xl text-purple-50 max-w-lg">
              CoolDetox features Coriander, Mint, and Ginger for natural cleansing and rejuvenation. Experience the power of gentle detoxification.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 px-8">
                  Start Detox Journey
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600 px-8">
                Detox Guide
              </Button>
            </div>
            
            <div className="flex items-center space-x-6 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">3-Day</div>
                <div className="text-sm text-purple-100">Gentle Cleanse</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">Refresh</div>
                <div className="text-sm text-purple-100">Mind & Body</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">Pure</div>
                <div className="text-sm text-purple-100">Natural Herbs</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square bg-white/10 rounded-full blur-3xl absolute inset-0 transform scale-150"></div>
            <img 
              src="/lovable-uploads/1aa37669-de0f-422b-81df-fabede344482.png" 
              alt="CoolDetox - Natural Cleansing Solution"
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
              <div className={`relative overflow-hidden h-[500px] lg:h-[600px] ${slide.background}`}>
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