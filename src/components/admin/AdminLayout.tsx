import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext1';
import { LanguageToggle } from '@/components/LanguageToggle';
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  MapPin,
  CreditCard,
  Star,
  AlertTriangle,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  PlusCircle,
  Shield,
  BellRing,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
        isActive
          ? 'bg-primary text-primary-foreground shadow-md'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
    </Link>
  );
};

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isRTL = language === 'ar';

  const translations = {
    en: {
      adminPanel: 'Admin Panel',
      dashboard: 'Dashboard',
      orders: 'Orders',
      users: 'Users',
      vehicles: 'Vehicles',
      tracking: 'Live Tracking',
      payments: 'Payments',
      ratings: 'Ratings & Reports',
      performanceAlerts: 'Performance Alerts',
      trackingAlerts: 'Tracking Alerts',
      settings: 'Settings',
      logout: 'Logout',
      moveLine: 'Move-Line',
      admin: 'Administrator',
    },
    ar: {
      adminPanel: 'لوحة الإدارة',
      dashboard: 'لوحة القيادة',
      orders: 'الطلبات',
      users: 'المستخدمين',
      vehicles: 'المركبات',
      tracking: 'التتبع المباشر',
      payments: 'المدفوعات',
      ratings: 'التقييمات والتقارير',
      performanceAlerts: 'إنذارات الأداء',
      trackingAlerts: 'إنذارات التتبع',
      settings: 'الإعدادات',
      logout: 'تسجيل الخروج',
      moveLine: 'موف-لاين',
      admin: 'المسؤول',
    },
  };

  const t = translations[language];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: t.dashboard },
    { to: '/admin/orders', icon: Package, label: t.orders },
    { to: '/admin/users', icon: Users, label: t.users },
    { to: '/admin/vehicles', icon: Truck, label: t.vehicles },
    { to: '/admin/tracking', icon: MapPin, label: t.tracking },
    { to: '/admin/tracking-alerts', icon: BellRing, label: t.trackingAlerts },
    { to: '/admin/applicants', icon: Users, label: 'Applicants' }, // TODO: Add translation
    { to: '/admin/payments', icon: CreditCard, label: t.payments },
    { to: '/admin/ratings', icon: Star, label: t.ratings },
    { to: '/admin/performance-alerts', icon: AlertTriangle, label: t.performanceAlerts },
  ];

  return (
    <div className={cn('min-h-screen bg-background', isRTL && 'rtl')}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 h-full w-72 bg-card border-r border-border z-50 transition-transform duration-300 lg:translate-x-0',
          isRTL ? 'right-0' : 'left-0',
          sidebarOpen
            ? 'translate-x-0'
            : isRTL
            ? 'translate-x-full'
            : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">{t.moveLine}</h1>
                <p className="text-xs text-muted-foreground">{t.adminPanel}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                onClick={() => setSidebarOpen(false)}
              />
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{t.admin}</p>
                <p className="text-xs text-muted-foreground">admin@moveline.com</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              {t.logout}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn('lg:ml-72', isRTL && 'lg:mr-72 lg:ml-0')}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
              <LanguageToggle />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
};
