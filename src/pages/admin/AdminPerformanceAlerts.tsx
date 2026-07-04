import React, { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext1';
import { adminApi } from '@/lib/adminApi';
import { PerformanceAlert } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { TriangleAlert as AlertTriangle, Loader as Loader2, RefreshCw, CircleCheck as CheckCircle2, CircleUser as UserCircle, CalendarDays, Star, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type AlertFilter = 'all' | 'open' | 'warning' | 'suspension';

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return format(date, 'MMM dd, yyyy HH:mm');
};

const getStatusColor = (status?: string) => {
  switch ((status || '').toLowerCase()) {
    case 'resolved':
      return 'bg-success/10 text-success border-success/20';
    case 'open':
      return 'bg-warning/10 text-warning border-warning/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getLevelColor = (level?: string) => {
  switch ((level || '').toLowerCase()) {
    case 'suspension':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'warning':
      return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    default:
      return 'bg-primary/10 text-primary border-primary/20';
  }
};

const getAlertDisplayValue = (alert: PerformanceAlert, keys: string[]) => {
  // Check top-level keys first
  for (const key of keys) {
    const value = (alert as Record<string, unknown>)[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  // Check nested additional_data
  const additionalData = (alert as Record<string, unknown>).additional_data as Record<string, unknown> | undefined;
  if (additionalData) {
    for (const key of keys) {
      const value = additionalData[key];
      if (value !== undefined && value !== null && value !== '') return value;
    }
  }
  // Check nested metadata
  const metadata = (alert as Record<string, unknown>).metadata as Record<string, unknown> | undefined;
  if (metadata) {
    for (const key of keys) {
      const value = metadata[key];
      if (value !== undefined && value !== null && value !== '') return value;
    }
  }
  return '—';
};

export const AdminPerformanceAlerts: React.FC = () => {
  const { language } = useLanguage();
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<AlertFilter>('all');
  const [selectedAlert, setSelectedAlert] = useState<PerformanceAlert | null>(null);
  const [resolvingId, setResolvingId] = useState<number | string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  const translations = {
    en: {
      title: 'Performance Alerts',
      subtitle: 'Monitor operator performance issues and escalations',
      filters: {
        all: 'All Alerts',
        open: 'Open Alerts',
        warning: 'Warning',
        suspension: 'Suspension',
      },
      columns: {
        employee: 'Employee',
        type: 'Account Type',
        level: 'Alert Level',
        status: 'Status',
        reason: 'Reason',
        rating: 'Current Rating',
        created: 'Created',
        actions: 'Actions',
      },
      details: 'Alert Details',
      resolve: 'Resolve Alert',
      resolving: 'Resolving...',
      close: 'Close',
      noAlerts: 'No alerts found for this view.',
      errorTitle: 'Unable to load alerts',
      errorMessage: 'We could not fetch performance alerts from the backend.',
      retry: 'Retry',
      successTitle: 'Alert resolved',
      successMessage: 'The performance alert was resolved successfully.',
      resolveError: 'Failed to resolve alert',
      openCount: 'Open',
      warningCount: 'Warning',
      suspensionCount: 'Suspension',
      total: 'Total',
      viewDetails: 'View details',
    },
    ar: {
      title: 'إنذارات الأداء',
      subtitle: 'مراقبة مشاكل الأداء والتصعيدات الخاصة بالسائقين والعمال',
      filters: {
        all: 'جميع الإنذارات',
        open: 'الإنذارات المفتوحة',
        warning: 'تحذير',
        suspension: 'إيقاف',
      },
      columns: {
        employee: 'الموظف',
        type: 'نوع الحساب',
        level: 'مستوى الإنذار',
        status: 'الحالة',
        reason: 'السبب',
        rating: 'التقييم الحالي',
        created: 'تاريخ الإنشاء',
        actions: 'الإجراءات',
      },
      details: 'تفاصيل الإنذار',
      resolve: 'حل الإنذار',
      resolving: 'جاري الحل...',
      close: 'إغلاق',
      noAlerts: 'لا توجد إنذارات في هذا العرض.',
      errorTitle: 'تعذر تحميل الإنذارات',
      errorMessage: 'تعذر جلب إنذارات الأداء من الخادم.',
      retry: 'إعادة المحاولة',
      successTitle: 'تم حل الإنذار',
      successMessage: 'تم حل إنذار الأداء بنجاح.',
      resolveError: 'فشل حل الإنذار',
      openCount: 'مفتوح',
      warningCount: 'تحذير',
      suspensionCount: 'إيقاف',
      total: 'الإجمالي',
      viewDetails: 'عرض التفاصيل',
    },
  };

  const t = translations[language];

  const filterOptions: { value: AlertFilter; label: string }[] = useMemo(() => [
    { value: 'all', label: t.filters.all },
    { value: 'open', label: t.filters.open },
    { value: 'warning', label: t.filters.warning },
    { value: 'suspension', label: t.filters.suspension },
  ], [t]);

  const fetchAlerts = async (nextPage = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params: { status?: string; level?: string; page?: number } = {};
      if (activeFilter === 'open') params.status = 'open';
      if (activeFilter === 'warning') params.level = 'warning';
      if (activeFilter === 'suspension') params.level = 'suspension';
      if (nextPage > 1) params.page = nextPage;

      const response = await adminApi.getPerformanceAlerts(params);
      const items = Array.isArray(response) ? response : response.results || [];
      setAlerts(items);
      setCount(typeof response.count === 'number' ? response.count : items.length);
      setHasNextPage(Boolean(response.next));
      setHasPreviousPage(Boolean(response.previous));
      setPage(nextPage);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Failed to fetch performance alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAlerts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  const handleResolve = async (alert: PerformanceAlert) => {
    if (!alert.id) return;

    setResolvingId(alert.id);

    try {
      await adminApi.resolvePerformanceAlert(alert.id);
      setAlerts((prev) => prev.map((item) => (item.id === alert.id ? { ...item, status: 'resolved' } : item)));
      setSelectedAlert((prev) => (prev && prev.id === alert.id ? { ...prev, status: 'resolved' } : prev));
      toast({
        title: t.successTitle,
        description: t.successMessage,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : t.resolveError;
      toast({
        title: t.resolveError,
        description: message,
        variant: 'destructive',
      });
    } finally {
      setResolvingId(null);
    }
  };

  const stats = useMemo(() => ({
    total: alerts.length,
    open: alerts.filter((alert) => (alert.status || '').toLowerCase() === 'open').length,
    warning: alerts.filter((alert) => (alert.level || '').toLowerCase() === 'warning').length,
    suspension: alerts.filter((alert) => (alert.level || '').toLowerCase() === 'suspension').length,
  }), [alerts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </div>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-destructive">{t.errorTitle}</h3>
              <p className="text-sm text-muted-foreground mt-2">{t.errorMessage}</p>
            </div>
            <p className="text-sm text-destructive/80 break-all">{error}</p>
            <Button onClick={() => void fetchAlerts(1)} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              {t.retry}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={activeFilter === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t.total}</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t.openCount}</p>
            <p className="text-2xl font-bold">{stats.open}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t.warningCount}</p>
            <p className="text-2xl font-bold">{stats.warning}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t.suspensionCount}</p>
            <p className="text-2xl font-bold">{stats.suspension}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {alerts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">{t.noAlerts}</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.columns.employee}</TableHead>
                    <TableHead>{t.columns.type}</TableHead>
                    <TableHead>{t.columns.level}</TableHead>
                    <TableHead>{t.columns.status}</TableHead>
                    <TableHead>{t.columns.reason}</TableHead>
                    <TableHead>{t.columns.rating}</TableHead>
                    <TableHead>{t.columns.created}</TableHead>
                    <TableHead className="text-right">{t.columns.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => {
                    const isResolved = (alert.status || '').toLowerCase() === 'resolved';
                    return (
                      <TableRow key={alert.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelectedAlert(alert)}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserCircle className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">
                              {getAlertDisplayValue(alert, ['user_full_name', 'employee_name', 'worker_name', 'driver_name', 'name']) as string}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getAlertDisplayValue(alert, ['target_role', 'account_type', 'employee_type', 'type']) as string}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getLevelColor(alert.level as string)}>
                            {String(alert.level || '—')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(alert.status as string)}>
                            {String(alert.status || '—')}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {String(getAlertDisplayValue(alert, ['reason', 'description', 'message']) || '—')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-warning fill-warning" />
                            {String(getAlertDisplayValue(alert, ['average_rating', 'current_rating', 'rating']) || '—')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <CalendarDays className="w-4 h-4" />
                            {formatDate(alert.created_at || (alert as Record<string, unknown>).createdAt as string | undefined)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={(event) => { event.stopPropagation(); setSelectedAlert(alert); }}>
                            {t.viewDetails}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between border-t p-4">
                <p className="text-sm text-muted-foreground">
                  {count !== null ? `${count} ${language === 'ar' ? 'إنذار' : 'alerts'}` : ''}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={!hasPreviousPage} onClick={() => void fetchAlerts(page - 1)}>
                    {language === 'ar' ? 'السابق' : 'Previous'}
                  </Button>
                  <Button variant="outline" size="sm" disabled={!hasNextPage} onClick={() => void fetchAlerts(page + 1)}>
                    {language === 'ar' ? 'التالي' : 'Next'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedAlert} onOpenChange={(open) => !open && setSelectedAlert(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              {t.details}
            </DialogTitle>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={getLevelColor(selectedAlert.level as string)}>
                  {String(selectedAlert.level || '—')}
                </Badge>
                <Badge variant="outline" className={getStatusColor(selectedAlert.status as string)}>
                  {String(selectedAlert.status || '—')}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4 space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">{t.columns.employee}</p>
                  <p className="font-medium">{getAlertDisplayValue(selectedAlert, ['user_full_name', 'employee_name', 'worker_name', 'driver_name', 'name']) as string}</p>
                </div>
                <div className="rounded-lg border p-4 space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">{language === 'ar' ? 'الدور' : 'Role'}</p>
                  <p className="font-medium">{getAlertDisplayValue(selectedAlert, ['target_role', 'account_type', 'employee_type', 'type']) as string}</p>
                </div>
                <div className="rounded-lg border p-4 space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">{t.columns.rating}</p>
                  <p className="font-medium">{getAlertDisplayValue(selectedAlert, ['average_rating', 'current_rating', 'rating']) as string}</p>
                </div>
                <div className="rounded-lg border p-4 space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">{t.columns.created}</p>
                  <p className="font-medium">{formatDate(selectedAlert.created_at || (selectedAlert as Record<string, unknown>).createdAt as string | undefined)}</p>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  {t.columns.reason}
                </div>
                <p className="text-sm leading-6">
                  {String(getAlertDisplayValue(selectedAlert, ['reason', 'description', 'message']) || '—')}
                </p>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <p className="text-sm font-semibold text-muted-foreground">{language === 'ar' ? 'البيانات الإضافية' : 'Additional data'}</p>
                <div className="space-y-2">
                  {Object.entries(selectedAlert).filter(([key]) => !['id', 'employee_name', 'worker_name', 'driver_name', 'account_type', 'employee_type', 'level', 'status', 'reason', 'description', 'message', 'current_rating', 'rating', 'created_at', 'createdAt'].includes(key)).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-4 rounded bg-muted/30 px-3 py-2 text-sm">
                      <span className="font-medium text-muted-foreground">{key}</span>
                      <span className="text-right break-all">{typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? String(value) : JSON.stringify(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {!selectedAlert || ((selectedAlert.status || '').toLowerCase() !== 'resolved') ? (
              <Button onClick={() => void handleResolve(selectedAlert!)} disabled={resolvingId === selectedAlert?.id || !selectedAlert} className="gap-2">
                {resolvingId === selectedAlert?.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {resolvingId === selectedAlert?.id ? t.resolving : t.resolve}
              </Button>
            ) : null}
            <Button variant="outline" onClick={() => setSelectedAlert(null)}>
              {t.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
