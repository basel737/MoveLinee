import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext1';
import { Target, Eye, Heart, Shield, Zap, MapPin, Users, Award, Star, GraduationCap, Wrench, Activity, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroCity from '@/assets/hero-city-night.jpg';
import heroTruck from '@/assets/hero-truck-city.jpg';

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroTruck})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>
        
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              {t('about.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 drop-shadow-lg max-w-3xl mx-auto">
              {t('about.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/services/home-moving">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  {t('about.hero.learnMore')}
                </Button>
              </Link>
              <Link to="/quote">
                <Button size="lg" className="gradient-primary text-white hover:shadow-glow text-lg px-8">
                  {t('about.hero.getQuote')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                {t('about.whoWeAre.title')}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('about.whoWeAre.description')}
              </p>
            </div>
            <div className="animate-fade-in">
              <img 
                src={heroCity} 
                alt="MoveLine Team" 
                className="rounded-lg shadow-elegant w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="animate-fade-in hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <Eye className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-2xl">{t('about.mvv.visionTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t('about.mvv.visionText')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="animate-fade-in hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <Target className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-2xl">{t('about.mvv.missionTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t('about.mvv.missionText')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="animate-fade-in hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <Heart className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-2xl">{t('about.mvv.valuesTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t('about.mvv.valuesText')}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Journey Timeline */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            {t('about.journey.title')}
          </h2>
          <div className="max-w-4xl mx-auto space-y-8">
            {[
              { year: '2018', key: 'about.journey.2018' },
              { year: '2019', key: 'about.journey.2019' },
              { year: '2020', key: 'about.journey.2020' },
              { year: '2022', key: 'about.journey.2022' },
              { year: '2025', key: 'about.journey.2025' },
            ].map((milestone, index) => (
              <div 
                key={index} 
                className="flex gap-8 items-center animate-fade-in hover:translate-x-2 transition-transform duration-300"
              >
                <div className="flex-shrink-0 w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{milestone.year}</span>
                </div>
                <div className="flex-1">
                  <p className="text-lg text-muted-foreground">{t(milestone.key)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Ensure Safety and Efficiency */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            {t('about.safety.title')}
          </h2>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {[
              { icon: GraduationCap, key: 'training' },
              { icon: Wrench, key: 'maintenance' },
              { icon: Activity, key: 'logistics' },
              { icon: ClipboardCheck, key: 'quality' },
              { icon: AlertTriangle, key: 'risk' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <Card 
                  key={index} 
                  className="animate-fade-in hover:shadow-glow transition-all duration-300 rounded-2xl"
                >
                  <CardHeader>
                    <Icon className="w-12 h-12 text-primary mb-4" />
                    <CardTitle className="text-xl text-primary mb-3">
                      {t(`about.safety.${item.key}.title`)}
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground leading-relaxed">
                      {t(`about.safety.${item.key}.description`)}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quality Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              {t('about.quality.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              {t('about.quality.description')}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { icon: Award, key: 'point1' },
              { icon: Shield, key: 'point2' },
              { icon: Zap, key: 'point3' },
              { icon: MapPin, key: 'point4' },
              { icon: Users, key: 'point5' },
            ].map((point, index) => {
              const Icon = point.icon;
              return (
                <Card 
                  key={index} 
                  className="animate-fade-in hover:shadow-glow transition-all duration-300 text-center"
                >
                  <CardHeader>
                    <Icon className="w-10 h-10 text-primary mx-auto mb-2" />
                    <CardTitle className="text-lg">{t(`about.quality.${point.key}.title`)}</CardTitle>
                    <CardDescription>{t(`about.quality.${point.key}.description`)}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            {t('about.testimonials.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {['review1', 'review2', 'review3'].map((reviewKey, index) => (
              <Card key={index} className="animate-fade-in hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <CardDescription className="text-base italic">"{t(`about.testimonials.${reviewKey}.text`)}"</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-foreground">{t(`about.testimonials.${reviewKey}.name`)}</p>
                  <p className="text-sm text-muted-foreground">{t(`about.testimonials.${reviewKey}.city`)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroTruck})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="relative text-center max-w-3xl mx-auto animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            {t('about.cta.title')}
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8 drop-shadow-lg">
            {t('about.cta.subtitle')}
          </p>
          <Link to="/quote">
            <Button 
              size="lg" 
              className="gradient-primary text-white hover:shadow-glow hover:scale-105 transition-all duration-300 text-lg px-12 py-6"
            >
              {t('about.cta.button')}
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
