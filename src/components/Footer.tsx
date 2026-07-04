import { useLanguage } from '@/context/LanguageContext1';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';
const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#004D40] text-white mt-24">
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-6">
              {t('footer.about.title')}
            </h3>
            <p className="text-white/90 leading-relaxed text-base">
              {t('footer.about.text')}
            </p>
            <Link to="/about">
              <Button 
                variant="secondary" 
                className="mt-4 bg-white/10 text-white border border-white/30 hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-300"
              >
                {t('footer.about.button')}
              </Button>
            </Link>
          </div>

          {/* Services Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-6">
              {t('footer.services.title')}
            </h3>
            <ul className="space-y-3.5">
              <li>
                <Link 
                  to="/services/home-moving"
                  className="text-white/90 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 text-base hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                >
                  {t('footer.services.household')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/services/office-moving"
                  className="text-white/90 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 text-base hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                >
                  {t('footer.services.office')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/services/intercity-moving"
                  className="text-white/90 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 text-base hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                >
                  {t('footer.services.intercity')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/services/storage"
                  className="text-white/90 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 text-base hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                >
                  {t('footer.services.storage')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-6">
              {t('footer.links.title')}
            </h3>
            <ul className="space-y-3.5">
              <li>
                <Link 
                  to="/"
                  className="text-white/90 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 text-base hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                >
                  {t('footer.links.home')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/about"
                  className="text-white/90 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 text-base hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                >
                  {t('footer.links.about')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/#faq"
                  className="text-white/90 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 text-base hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                >
                  {t('footer.links.faq')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact"
                  className="text-white/90 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 text-base hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                >
                  {t('footer.links.contact')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/quote"
                  className="text-white/90 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 text-base hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                >
                  {t('footer.links.quote')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-6">
              {t('footer.contact.title')}
            </h3>
            <ul className="space-y-4 text-white/90">
              <li className="flex items-center gap-3 text-base">
                <span className="text-xl">📞</span>
                <span>{t('footer.contact.phone')}</span>
              </li>
              <li className="flex items-center gap-3 text-base">
                <span className="text-xl">✉️</span>
                <span>{t('footer.contact.email')}</span>
              </li>
              <li className="flex items-center gap-3 text-base">
                <span className="text-xl">📍</span>
                <span>{t('footer.contact.address')}</span>
              </li>
            </ul>
            
            {/* Social Media Icons */}
            <div className="flex gap-4 pt-6">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:scale-110 hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:scale-110 hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:scale-110 hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://wa.me/963999999999" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:scale-110 hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-300"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 mt-8">
          <div className="text-center space-y-3">
            <p className="text-white/95 font-medium text-base">
              {t('footer.copyright')}
            </p>
            <p className="text-white/70 text-sm">
              {t('footer.credits')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
