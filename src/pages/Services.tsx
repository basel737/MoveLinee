import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext1';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Truck, Building2, Package, Clock, Shield, ArrowRight } from 'lucide-react';

const Services = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const services = [
    {
      title: t('nav.homeMoving'),
      icon: Truck,
      description: t('householdMoving.about.title'),
      link: '/services/home-moving',
    },
    {
      title: t('nav.officeMoving'),
      icon: Building2,
      description: t('footer.services.office'),
      link: '/services/office-moving',
    },
    {
      title: t('nav.storage'),
      icon: Package,
      description: t('footer.services.storage'),
      link: '/services/storage',
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            {t('nav.services')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('about.hero.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card key={index} className="hover:shadow-glow transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-6">
                    {service.description}
                  </CardDescription>
                  <Link to={service.link}>
                    <Button className="w-full">
                      {t('about.hero.learnMore')}
                      <ArrowRight className={`${isRTL ? 'mr-2' : 'ml-2'} h-4 w-4`} />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Services;
