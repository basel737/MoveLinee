import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext1';
import { LanguageToggle } from '@/components/LanguageToggle';
import {
  LayoutDashboard,
  ClipboardList,
  CheckSquare,
  Menu,
  X,
  HardHat,
  User,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface WorkerLayoutProps {
  children: React.ReactNode;
}

const NavItem: React.FC<{
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  badge?: number;
}> = ({ to, icon, label, isActive, badge }) => (
  <Link
    to={to}
    className={cn(
      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
      isActive
        ? 'bg-primary text-primary-foreground shadow-md'
        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
    )}
  >
    {icon}
    <span className="font-medium">{label}</span>
    {badge !== undefined && badge > 0 && (
      <Badge variant="secondary" className="ml-auto">
        {badge}
      </Badge>
    )}
  </Link>
);

export const WorkerLayout: React.FC<WorkerLayoutProps> = ({ children }) => {
  const { language } = useLanguage();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isRTL = language === 'ar';

  const translations = {
    ar: {
      workerDashboard: 'لوحة تحكم العامل',
      overview: 'نظرة عامة',
      assignedTasks: 'المهام المسندة',
      taskExecution: 'تنفيذ المهام',
      profile: 'الملف الشخصي',
      logout: 'تسجيل الخروج',
      worker: 'عامل',
    },
    en: {
      workerDashboard: 'Worker Dashboard',
      overview: 'Overview',
      assignedTasks: 'Assigned Tasks',
      taskExecution: 'Task Execution',
      profile: 'Profile',
      logout: 'Logout',
      worker: 'Worker',
    },
  };

  const t = translations[language];

  const navItems = [
    { to: '/worker', icon: <LayoutDashboard className="w-5 h-5" />, label: t.overview },
    { to: '/worker/tasks', icon: <ClipboardList className="w-5 h-5" />, label: t.assignedTasks, badge: 3 },
    { to: '/worker/execution', icon: <CheckSquare className="w-5 h-5" />, label: t.taskExecution },
  ];

  return (
    <div className={cn('min-h-screen bg-background flex', isRTL && 'rtl')}>
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 z-50 w-72 bg-card border-e shadow-xl transition-transform duration-300 lg:translate-x-0 lg:static',
          sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <HardHat className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Move-Line</h1>
                <p className="text-sm text-muted-foreground">{t.workerDashboard}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.to}
                badge={item.badge}
              />
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">خالد حسن</p>
                <p className="text-xs text-muted-foreground">{t.worker}</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full mt-3 justify-start text-muted-foreground">
              <LogOut className="w-4 h-4 me-2" />
              {t.logout}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            <div className="flex items-center gap-3 ms-auto">
              <LanguageToggle />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
