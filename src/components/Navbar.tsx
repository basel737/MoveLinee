import { useState, useEffect } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext1';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Add solid background after scrolling
          setIsScrolled(currentScrollY > 50);

          // Smart hide/show behavior
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // Scrolling down
            setIsVisible(false);
          } else {
            // Scrolling up
            setIsVisible(true);
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { label: t('nav.home'), href: '/', isRoute: true },
    { label: t('nav.faq'), href: '/#faq', isRoute: false },
  ];

  const serviceLinks = [
    { label: t('nav.homeMoving'), href: '/services/home-moving', isRoute: true },
    { label: t('nav.officeMoving'), href: '/services/office-moving', isRoute: true },
    { label: t('nav.intercityMoving'), href: '/services/intercity-moving', isRoute: true },
    { label: t('nav.storage'), href: '/services/storage', isRoute: true },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        isScrolled
          ? 'bg-white shadow-elegant backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="text-2xl font-bold">
              <span className="text-primary">Move</span>
              <span className={isScrolled ? 'text-foreground' : 'text-white'}>Line</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            {/* Home Link */}
            <Link
              to="/"
              className={`font-medium transition-colors hover:text-primary ${
                isScrolled ? 'text-foreground' : 'text-white'
              }`}
            >
              {t('nav.home')}
            </Link>

            {/* Services Link */}
            <Link
              to="/services/home-moving"
              className={`font-medium transition-colors hover:text-primary ${
                isScrolled ? 'text-foreground' : 'text-white'
              }`}
            >
              {t('nav.services')}
            </Link>

            {/* About Link */}
            <Link
              to="/about"
              className={`font-medium transition-colors hover:text-primary ${
                isScrolled ? 'text-foreground' : 'text-white'
              }`}
            >
              {t('nav.about')}
            </Link>

            {/* FAQ Link */}
            <a
              href="/#faq"
              className={`font-medium transition-colors hover:text-primary ${
                isScrolled ? 'text-foreground' : 'text-white'
              }`}
            >
              {t('nav.faq')}
            </a>

            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className={`flex items-center space-x-2 rtl:space-x-reverse transition-all duration-300 ${
                isScrolled
                  ? 'border-primary text-primary hover:bg-primary hover:text-white'
                  : 'bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span className="font-medium">{language === 'en' ? 'عربي' : 'English'}</span>
            </Button>

            {/* Login / Profile Button */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard">
                  <Button
                    size="sm"
                    className={`${
                      isScrolled
                        ? 'bg-[#004D40] text-white hover:bg-[#00695C]'
                        : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30'
                    } transition-all duration-300 gap-2`}
                  >
                    <span>{language === 'ar' ? 'ملفي الشخصي' : 'My Profile'}</span>
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={logout}
                  className={`${
                    isScrolled ? 'text-foreground' : 'text-white'
                  } hover:text-red-500 hover:bg-red-500/10 transition-colors`}
                >
                  {language === 'ar' ? 'خروج' : 'Logout'}
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button
                  size="sm"
                  className={`${
                    isScrolled
                      ? 'bg-[#004D40] text-white hover:bg-[#00695C]'
                      : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30'
                  } transition-all duration-300`}
                >
                  {t('nav.login')}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? 'text-foreground' : 'text-white'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? 'text-foreground' : 'text-white'}`} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 bg-white rounded-b-lg shadow-elegant animate-fade-in">
            {/* Home Link */}
            <Link
              to="/"
              className="block px-4 py-2 text-foreground hover:text-primary hover:bg-accent transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.home')}
            </Link>

            {/* Services Link */}
            <Link
              to="/services/home-moving"
              className="block px-4 py-2 text-foreground hover:text-primary hover:bg-accent transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.services')}
            </Link>

            {/* About Link */}
            <Link
              to="/about"
              className="block px-4 py-2 text-foreground hover:text-primary hover:bg-accent transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.about')}
            </Link>

            {/* FAQ Link */}
            <a
              href="/#faq"
              className="block px-4 py-2 text-foreground hover:text-primary hover:bg-accent transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.faq')}
            </a>

            <div className="px-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse border-primary text-primary hover:bg-primary hover:text-white"
              >
                <Globe className="w-4 h-4" />
                <span>{language === 'en' ? 'عربي' : 'English'}</span>
              </Button>
            </div>

            {/* Login / Profile Button Mobile */}
            <div className="px-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      size="sm"
                      className="w-full bg-[#004D40] text-white hover:bg-[#00695C]"
                    >
                      {language === 'ar' ? 'ملفي الشخصي' : 'My Profile'}
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  >
                    {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                  </Button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    size="sm"
                    className="w-full bg-[#004D40] text-white hover:bg-[#00695C]"
                  >
                    {t('nav.login')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
        {/* About Panel portal (desktop) */}
      </div>
    </nav>
  );
};

export default Navbar;
