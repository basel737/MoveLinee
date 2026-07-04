import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext1';
import { Truck } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import heroHome from '@/assets/hero-home-moving.jpg';
import heroTruck from '@/assets/hero-truck-city.jpg';
import heroOffice from '@/assets/service-office.jpg';
import heroCity from '@/assets/hero-city-night.jpg';

const slides = [
  {
    id: 1,
    image: heroHome,
    titleKey: 'hero1.title',
    subtitleKey: 'hero1.subtitle',
    buttonKey: 'hero1.button',
  },
  {
    id: 2,
    image: heroTruck,
    titleKey: 'hero2.title',
    subtitleKey: 'hero2.subtitle',
    buttonKey: 'hero2.button',
  },
  {
    id: 3,
    image: heroOffice,
    titleKey: 'hero3.title',
    subtitleKey: 'hero3.subtitle',
    buttonKey: 'hero3.button',
  },
  {
    id: 4,
    image: heroCity,
    titleKey: 'hero4.title',
    subtitleKey: 'hero4.subtitle',
    buttonKey: 'hero4.button',
  },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [truckPosition, setTruckPosition] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = 0;
    const interval = 100;

    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= interval) {
        setTruckPosition((prev) => {
          const next = prev + 1;
          // When truck reaches ~80% of the screen, change slide
          if (next >= 80) {
            setCurrentSlide((current) => (current + 1) % slides.length);
            return 0; // Reset truck position
          }
          return next;
        });
        lastTime = currentTime;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        setCurrentSlide((current) => (current - 1 + slides.length) % slides.length);
        setTruckPosition(0);
      } else if (event.key === 'ArrowRight') {
        setCurrentSlide((current) => (current + 1) % slides.length);
        setTruckPosition(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center justify-center text-center px-4">
            <div className="max-w-4xl animate-fade-in-up">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg">
                {t(slide.titleKey)}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-lg">
                {t(slide.subtitleKey)}
              </p>
              <Link to="/quote">
                <Button
                  size="lg"
                  className="gradient-primary text-white hover:shadow-glow transition-all duration-300 text-lg px-8 py-6"
                >
                  {t(slide.buttonKey)}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Animated Truck at Bottom */}
      <div className="absolute bottom-8 left-0 right-0 z-10 pointer-events-none">
        <div className="relative h-16 overflow-hidden">
          {/* Road Line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20" />
          
          {/* Truck Icon */}
          <div
            className="absolute bottom-2 transition-all duration-100 ease-linear"
            style={{ left: `${truckPosition}%` }}
          >
            <Truck className="w-12 h-12 text-primary drop-shadow-lg" />
          </div>
        </div>
      </div>

      {/* Segmented Progress Bars */}
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        <TooltipProvider delayDuration={200}>
          {slides.map((slide, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setCurrentSlide(index);
                    setTruckPosition(0);
                  }}
                  className="group relative transition-smooth"
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden group-hover:h-1.5 transition-all duration-300 group-hover:shadow-glow">
                    <div
                      className={`h-full bg-primary transition-all duration-100 ease-linear ${
                        index === currentSlide ? '' : index < currentSlide ? 'w-full' : 'w-0'
                      }`}
                      style={{
                        width: index === currentSlide ? `${truckPosition * 1.25}%` : undefined,
                      }}
                    />
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-background/95 backdrop-blur-sm border-primary/20">
                <p className="text-sm font-medium">{t(slide.titleKey)}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </section>
  );
};

export default HeroSection;
