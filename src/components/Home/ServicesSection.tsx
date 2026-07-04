import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext1';

import serviceHomeMoving from '@/assets/service-home-moving.jpg';
import serviceIntercity from '@/assets/service-intercity.jpg';
import serviceStorage from '@/assets/service-storage.jpg';
import serviceOffice from '@/assets/service-office.jpg';

const services = [
  {
    id: 1,
    image: serviceHomeMoving,
    titleKey: 'service1.title',
    descriptionKey: 'service1.description',
    buttonKey: 'service1.button',
    link: '/services/home-moving',
  },
  {
    id: 2,
    image: serviceIntercity,
    titleKey: 'service2.title',
    descriptionKey: 'service2.description',
    buttonKey: 'service2.button',
    link: '/services/intercity-moving',
  },
  {
    id: 3,
    image: serviceStorage,
    titleKey: 'service3.title',
    descriptionKey: 'service3.description',
    buttonKey: 'service3.button',
    link: '/services/storage',
  },
  {
    id: 4,
    image: serviceOffice,
    titleKey: 'service4.title',
    descriptionKey: 'service4.description',
    buttonKey: 'service4.button',
    link: '/services/office-moving',
  },
];

const ServiceCard = ({ service, index }: { service: typeof services[0]; index: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <Card
      ref={cardRef}
      className={`group relative overflow-hidden shadow-card hover:shadow-glow transition-all duration-700 cursor-pointer border-border/50 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Image Background */}
      <div className="relative h-[500px] overflow-hidden">
        <img
          src={service.image}
          alt={t(service.titleKey)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent group-hover:from-black/80" />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 p-8 flex flex-col justify-end">
          <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-primary-glow transition-colors duration-300">
            {t(service.titleKey)}
          </h3>
          <p className="text-white/95 mb-8 leading-relaxed text-base">
            {t(service.descriptionKey)}
          </p>
          <Link to={service.link}>
            <Button
              size="lg"
              className="w-full bg-primary text-white hover:bg-primary-glow shadow-glow transition-all duration-300 group-hover:scale-105"
            >
              {t(service.buttonKey)}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

const ServicesSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 px-4 bg-background">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t('services.title')}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t('services.subtitle')}
          </p>
        </div>

        {/* Services Grid - 2x2 Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
