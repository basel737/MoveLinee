import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Plus, 
  Package, 
  MapPin, 
  CreditCard, 
  Star, 
  User, 
  LogOut,
  Truck,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext1';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useState } from 'react';

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
    <NavLink
      to={to}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
        'hover:bg-primary/10 hover:text-primary',
        isActive && 'bg-primary/15 text-primary font-medium border-l-4 border-primary'
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </NavLink>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: language === 'ar' ? 'لوحة التحكم' : 'Dashboard' },
    { to: '/dashboard/new-order', icon: Plus, label: language === 'ar' ? 'طلب جديد' : 'New Order' },
    { to: '/dashboard/orders', icon: Package, label: language === 'ar' ? 'طلباتي' : 'My Orders' },
    { to: '/dashboard/track', icon: MapPin, label: language === 'ar' ? 'تتبع الطلب' : 'Track Order' },
    { to: '/dashboard/payments', icon: CreditCard, label: language === 'ar' ? 'المدفوعات' : 'Payments' },
    { to: '/dashboard/ratings', icon: Star, label: language === 'ar' ? 'التقييمات' : 'Ratings' },
    { to: '/dashboard/profile', icon: User, label: language === 'ar' ? 'الملف الشخصي' : 'Profile' },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={cn('min-h-screen bg-background flex', language === 'ar' && 'rtl')}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 z-50 w-64 bg-card border-r border-border',
          'transform transition-transform duration-300 ease-in-out',
          'lg:transform-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          language === 'ar' && 'right-0 left-auto lg:right-auto lg:left-0 translate-x-full lg:translate-x-0',
          language === 'ar' && sidebarOpen && 'translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Truck className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Move-Line</h1>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'لوحة العميل' : 'Customer Dashboard'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavItem key={item.to} {...item} onClick={closeSidebar} />
            ))}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-border space-y-3">
            {user && (
              <div className="px-4 py-2">
                <p className="font-medium text-sm text-foreground">{user.fullName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={logout}
            >
              <LogOut className="w-5 h-5" />
              {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            
            <div className="flex-1" />
            
            <LanguageToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
