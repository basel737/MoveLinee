import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext1';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'react-router-dom';
import { Shield, Truck, Users, Package, MoveRight, CheckCircle2, ArrowRight, Box, Home, PackageOpen, PackageCheck, TruckIcon, PackageMinus, Boxes, Wrench, Warehouse, Star, Heart, Award } from 'lucide-react';
import heroImage from '@/assets/hero-household-moving.jpg';
import packingImage from '@/assets/home-moving-packing.jpg';
import transportImage from '@/assets/home-moving-transport.jpg';
import loadingImage from '@/assets/home-moving-loading.jpg';
import familyImage from '@/assets/home-moving-family.jpg';
import suppliesImage from '@/assets/home-moving-supplies.jpg';

const HomeMoving = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const whyChooseCards = [
    {
      icon: Shield,
      title: t('householdMoving.whyChoose.card1.title'),
      description: t('householdMoving.whyChoose.card1.description'),
    },
    {
      icon: Truck,
      title: t('householdMoving.whyChoose.card2.title'),
      description: t('householdMoving.whyChoose.card2.description'),
    },
    {
      icon: Users,
      title: t('householdMoving.whyChoose.card3.title'),
      description: t('householdMoving.whyChoose.card3.description'),
    },
  ];

  const processSteps = [
    {
      icon: Package,
      title: t('householdMoving.process.step1.title'),
      description: t('householdMoving.process.step1.description'),
    },
    {
      icon: Box,
      title: t('householdMoving.process.step2.title'),
      description: t('householdMoving.process.step2.description'),
    },
    {
      icon: Truck,
      title: t('householdMoving.process.step3.title'),
      description: t('householdMoving.process.step3.description'),
    },
    {
      icon: MoveRight,
      title: t('householdMoving.process.step4.title'),
      description: t('householdMoving.process.step4.description'),
    },
    {
      icon: Home,
      title: t('householdMoving.process.step5.title'),
      description: t('householdMoving.process.step5.description'),
    },
  ];

  const relatedServices = [
    {
      title: t('householdMoving.relatedServices.service1.title'),
      description: t('householdMoving.relatedServices.service1.description'),
      link: '/services/office-moving',
    },
    {
      title: t('householdMoving.relatedServices.service2.title'),
      description: t('householdMoving.relatedServices.service2.description'),
      link: '/services/intercity-moving',
    },
    {
      title: t('householdMoving.relatedServices.service3.title'),
      description: t('householdMoving.relatedServices.service3.description'),
      link: '/services/storage',
    },
  ];

  const faqs = [
    { q: 'householdMoving.faq.q1', a: 'householdMoving.faq.a1' },
    { q: 'householdMoving.faq.q2', a: 'householdMoving.faq.a2' },
    { q: 'householdMoving.faq.q3', a: 'householdMoving.faq.a3' },
    { q: 'householdMoving.faq.q4', a: 'householdMoving.faq.a4' },
    { q: 'householdMoving.faq.q5', a: 'householdMoving.faq.a5' },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="MoveLine Household Moving"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(212,175,55,0.1),transparent_50%)]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl animate-fade-in-up text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
              {t('householdMoving.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-white/95 mb-8 leading-relaxed drop-shadow-lg max-w-3xl">
              {t('householdMoving.hero.subtitle')}
            </p>
            <div className="flex">
              <Link to="/quote" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-lg px-10 py-7 shadow-glow-strong hover:shadow-elegant transition-all duration-500 hover:scale-105">
                  {t('householdMoving.hero.cta')}
                  <ArrowRight className={`${isRTL ? 'mr-2' : 'ml-2'} h-5 w-5`} />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/70 rounded-full" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <img
                src={packingImage}
                alt="Professional packing services"
                className="w-full h-[400px] object-cover rounded-2xl shadow-glow"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 animate-fade-in">
                {t('householdMoving.about.title')}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed animate-fade-in">
                {t('householdMoving.about.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Request Estimate Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={transportImage} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 animate-fade-in">
            {t('householdMoving.requestEstimate.title')}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed animate-fade-in">
            {t('householdMoving.requestEstimate.description')}
          </p>
          <Link to="/quote">
            <Button size="lg" className="text-lg px-8 py-6 shadow-glow hover:shadow-elegant transition-all duration-300">
              {t('householdMoving.requestEstimate.cta')}
              <ArrowRight className={`${isRTL ? 'mr-2' : 'ml-2'} h-5 w-5`} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Detailed Process Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 animate-fade-in">
              {t('householdMoving.detailedProcess.title')}
            </h2>
            <p className="text-lg text-muted-foreground mb-4 leading-relaxed max-w-4xl mx-auto animate-fade-in">
              {t('householdMoving.detailedProcess.subtitle')}
            </p>
            <p className="text-lg text-foreground mb-8 leading-relaxed font-semibold max-w-4xl mx-auto animate-fade-in">
              {t('householdMoving.detailedProcess.subtitle2')}
            </p>
            <img
              src={loadingImage}
              alt="Professional loading services"
              className="w-full max-w-4xl mx-auto h-[400px] object-cover rounded-2xl shadow-glow mb-12"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Package, title: t('householdMoving.detailedProcess.step1.title'), description: t('householdMoving.detailedProcess.step1.description') },
              { icon: Box, title: t('householdMoving.detailedProcess.step2.title'), description: t('householdMoving.detailedProcess.step2.description') },
              { icon: Truck, title: t('householdMoving.detailedProcess.step3.title'), description: t('householdMoving.detailedProcess.step3.description') },
              { icon: Home, title: t('householdMoving.detailedProcess.step4.title'), description: t('householdMoving.detailedProcess.step4.description') },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <Card
                  key={index}
                  className="bg-card border-border/50 shadow-card hover:shadow-glow transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="w-16 h-16 mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl text-primary mb-3">{step.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Start Today Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20 shadow-glow">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl md:text-4xl text-primary mb-4">
                {t('householdMoving.startToday.title')}
              </CardTitle>
              <CardDescription className="text-lg text-foreground leading-relaxed mb-4">
                {t('householdMoving.startToday.description1')}
              </CardDescription>
              <CardDescription className="text-lg text-foreground leading-relaxed">
                {t('householdMoving.startToday.description2')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/quote">
                <Button size="lg" variant="default" className="shadow-elegant">
                  {t('householdMoving.startToday.cta')}
                  <ArrowRight className={`${isRTL ? 'mr-2' : 'ml-2'} h-5 w-5`} />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Detailed Services Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-8 animate-fade-in">
            {t('householdMoving.detailedServices.title')}
          </h2>
          <img
            src={suppliesImage}
            alt="Moving supplies and equipment"
            className="w-full max-w-5xl mx-auto h-[350px] object-cover rounded-2xl shadow-glow mb-16"
          />
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
            {[
              { icon: PackageOpen, title: t('householdMoving.detailedServices.service1.title'), description: t('householdMoving.detailedServices.service1.description') },
              { icon: PackageCheck, title: t('householdMoving.detailedServices.service2.title'), description: t('householdMoving.detailedServices.service2.description') },
              { icon: TruckIcon, title: t('householdMoving.detailedServices.service3.title'), description: t('householdMoving.detailedServices.service3.description') },
              { icon: PackageMinus, title: t('householdMoving.detailedServices.service4.title'), description: t('householdMoving.detailedServices.service4.description') },
              { icon: Boxes, title: t('householdMoving.detailedServices.service5.title'), description: t('householdMoving.detailedServices.service5.description') },
              { icon: Wrench, title: t('householdMoving.detailedServices.service6.title'), description: t('householdMoving.detailedServices.service6.description') },
              { icon: Warehouse, title: t('householdMoving.detailedServices.service7.title'), description: t('householdMoving.detailedServices.service7.description') },
            ].map((service, index) => {
              const Icon = service.icon;
              return (
                <Card
                  key={index}
                  className="bg-card border-border/50 shadow-card hover:shadow-glow transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader className="text-center">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <CardTitle className="text-lg text-primary mb-2">{service.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
          <p className="text-center text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto animate-fade-in">
            {t('householdMoving.detailedServices.footer')}
          </p>
        </div>
      </section>

      {/* Designed For You Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-8 animate-fade-in">
            {t('householdMoving.designedForYou.title')}
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-8 leading-relaxed max-w-4xl mx-auto animate-fade-in">
            {t('householdMoving.designedForYou.intro')}
          </p>
          <img
            src={familyImage}
            alt="Happy family at new home"
            className="w-full max-w-4xl mx-auto h-[400px] object-cover rounded-2xl shadow-glow mb-16"
          />

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {[
              { icon: Heart, title: t('householdMoving.designedForYou.section1.title'), description: t('householdMoving.designedForYou.section1.description') },
              { icon: Star, title: t('householdMoving.designedForYou.section2.title'), description: t('householdMoving.designedForYou.section2.description') },
              { icon: Shield, title: t('householdMoving.designedForYou.section3.title'), description: t('householdMoving.designedForYou.section3.description') },
              { icon: Award, title: t('householdMoving.designedForYou.section4.title'), description: t('householdMoving.designedForYou.section4.description') },
            ].map((section, index) => {
              const Icon = section.icon;
              return (
                <Card
                  key={index}
                  className="bg-card border-border/50 shadow-card hover:shadow-glow transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="w-14 h-14 mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <CardTitle className="text-2xl text-primary mb-3">{section.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {section.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          <p className="text-center text-xl text-foreground font-semibold leading-relaxed max-w-4xl mx-auto animate-fade-in">
            {t('householdMoving.designedForYou.footer')}
          </p>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-16 animate-fade-in">
            {t('householdMoving.whyChoose.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {whyChooseCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card
                  key={index}
                  className="bg-card border-border/50 shadow-card hover:shadow-glow transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl text-primary">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center leading-relaxed">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-16 animate-fade-in">
            {t('householdMoving.process.title')}
          </h2>
          <div className="grid md:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="relative animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card className="bg-card border-border/50 shadow-card hover:shadow-glow transition-all duration-300 h-full">
                    <CardHeader className="text-center">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <CardTitle className="text-lg text-primary mb-2">{step.title}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {step.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  {index < processSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ArrowRight className={`h-6 w-6 text-primary ${isRTL ? 'rotate-180' : ''}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* All-in-One Service */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20 shadow-glow">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl md:text-4xl text-primary mb-4">
                {t('householdMoving.allInOne.title')}
              </CardTitle>
              <CardDescription className="text-lg text-foreground leading-relaxed">
                {t('householdMoving.allInOne.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button size="lg" variant="default" className="shadow-elegant">
                {t('householdMoving.allInOne.cta')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 animate-fade-in">
            {t('householdMoving.ctaSection.title')}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed animate-fade-in">
            {t('householdMoving.ctaSection.description')}
          </p>
          <Link to="/quote">
            <Button size="lg" className="text-lg px-8 py-6 shadow-glow hover:shadow-elegant transition-all duration-300">
              {t('householdMoving.ctaSection.cta')}
              <CheckCircle2 className={`${isRTL ? 'mr-2' : 'ml-2'} h-5 w-5`} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Related Services */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-16 animate-fade-in">
            {t('householdMoving.relatedServices.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {relatedServices.map((service, index) => (
              <Card
                key={index}
                className="bg-card border-border/50 shadow-card hover:shadow-glow transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <CardTitle className="text-2xl text-primary mb-2">{service.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={service.link}>
                    <Button variant="outline" className="w-full">
                      {t('householdMoving.allInOne.cta')}
                      <ArrowRight className={`${isRTL ? 'mr-2' : 'ml-2'} h-4 w-4`} />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {t('householdMoving.faq.title')}
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border/50 rounded-xl px-6 shadow-card hover:shadow-glow transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <AccordionTrigger className="text-left text-lg font-semibold text-foreground hover:text-primary py-6">
                  {t(faq.q)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {t(faq.a)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomeMoving;
