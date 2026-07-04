import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext1';

import featureNoWorries from '@/assets/feature-no-worries.jpg';
import featureAI from '@/assets/feature-ai-estimator.jpg';
import featureFAQ from '@/assets/feature-faq.jpg';
import featureStorage from '@/assets/feature-storage.jpg';

const features = [
  {
    id: 1,
    image: featureNoWorries,
    titleKey: 'feature1.title',
    textKey: 'feature1.text',
    buttonKey: 'feature1.button',
  },
  {
    id: 2,
    image: featureAI,
    titleKey: 'feature2.title',
    textKey: 'feature2.text',
    buttonKey: 'feature2.button',
  },
  {
    id: 3,
    image: featureFAQ,
    titleKey: 'feature3.title',
    textKey: 'feature3.text',
    buttonKey: 'feature3.button',
  },
  {
    id: 4,
    image: featureStorage,
    titleKey: 'feature4.title',
    textKey: 'feature4.text',
    buttonKey: 'feature4.button',
  },
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
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
      className={`group overflow-hidden shadow-card hover:shadow-elegant transition-all duration-500 cursor-pointer ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={feature.image}
            alt={t(feature.titleKey)}
            loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
          {t(feature.titleKey)}
        </h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {t(feature.textKey)}
        </p>
        {feature.id === 1 ? (
          <Button
            asChild
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
          >
            <Link to="/no-worries">{t(feature.buttonKey)}</Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
          >
            {t(feature.buttonKey)}
          </Button>
        )}
      </div>
    </Card>
  );
};

const FeaturesSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('features.title')}
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
