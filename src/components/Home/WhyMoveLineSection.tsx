import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext1';
import { ThumbsUp, Building2, Package, Brain, Satellite, DollarSign } from 'lucide-react';

const features = [
  {
    id: 1,
    icon: ThumbsUp,
    titleKey: 'why.feature1.title',
    textKey: 'why.feature1.text',
  },
  {
    id: 2,
    icon: Building2,
    titleKey: 'why.feature2.title',
    textKey: 'why.feature2.text',
  },
  {
    id: 3,
    icon: Package,
    titleKey: 'why.feature3.title',
    textKey: 'why.feature3.text',
  },
  {
    id: 4,
    icon: Brain,
    titleKey: 'why.feature4.title',
    textKey: 'why.feature4.text',
  },
  {
    id: 5,
    icon: Satellite,
    titleKey: 'why.feature5.title',
    textKey: 'why.feature5.text',
  },
  {
    id: 6,
    icon: DollarSign,
    titleKey: 'why.feature6.title',
    textKey: 'why.feature6.text',
  },
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const Icon = feature.icon;

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
      className={`group p-8 shadow-card hover:shadow-glow transition-all duration-500 cursor-pointer border-border/40 hover:border-primary/50 bg-card/50 backdrop-blur-sm ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
          <Icon className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
          {t(feature.titleKey)}
        </h3>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {t(feature.textKey)}
        </p>
      </div>
    </Card>
  );
};

const WhyMoveLineSection = () => {
  const { t } = useLanguage();

  return (
    <>
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-4xl mx-auto mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {t('why.title')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('why.subtitle')}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={feature.id} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Get Quote Banner */}
      <section className="py-16 px-4 bg-gradient-dark-vibrant relative overflow-hidden">
        <div className="absolute inset-0 bg-shimmer opacity-20" />
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 animate-fade-in drop-shadow-glow">
            {t('quote.text')}
          </h2>
          <Link to="/quote">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 hover:text-primary hover:shadow-glow-strong transition-all duration-300 hover:scale-105 text-lg px-12 py-6 font-bold"
            >
              {t('quote.button')}
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
};

export default WhyMoveLineSection;
