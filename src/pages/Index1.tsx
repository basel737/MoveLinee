import Navbar from '@/components/Navbar';
import HeroSection from '@/components/Home/HeroSection';
import FeaturesSection from '@/components/Home/FeaturesSection';
import ServicesSection from '@/components/Home/ServicesSection';
import WhyMoveLineSection from '@/components/Home/WhyMoveLineSection';
import FAQSection from '@/components/Home/FAQSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ServicesSection />
      <WhyMoveLineSection />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Index;
