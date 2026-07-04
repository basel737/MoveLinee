import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock3,
  Eye,
  Loader2,
  MapPin,
  MessageSquareText,
  RefreshCw,
  Send,
  Truck,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext1';
import { adminApi, TrackingAlert, TrackingAlertSummary } from '@/lib/adminApi';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Filter = 'all' | 'open' | 'acknowledged' | 'resolved' | 'admin_attention';
type NotificationState = 'open' | 'acknowledged' | 'admin_attention' | 'customer_delay' | 'resolved';

const emptySummary: TrackingAlertSummary = { open: 0, acknowledged: 0, resolved: 0, admin_attention: 0 };

export const AdminTrackingAlerts: React.FC = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [alerts, setAlerts] = useState<TrackingAlert[]>([]);
  const [summary, setSummary] = useState<TrackingAlertSummary>(emptySummary);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<TrackingAlert | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notificationState, setNotificationState] = useState<NotificationState>('customer_delay');

  const copy = isArabic ? {
    title: 'إنذارات التتبع',
    subtitle: 'مراقبة التوقفات غير المتوقعة ومتابعة استجابة السائق',
    all: 'الكل', open: 'مفتوح', acknowledged: 'تم الاطلاع', resolved: 'محلول', attention: 'يحتاج تدخلاً',
    order: 'الطلب', driver: 'السائق', type: 'نوع الإنذار', status: 'الحالة', reason: 'سبب السائق',
    created: 'وقت الإنذار', actions: 'الإجراءات', unexpectedStop: 'توقف غير متوقع', noDriver: 'غير معيّن',
    noReason: 'لم يرد السائق بعد', details: 'تفاصيل إنذار التتبع', tracking: 'رقم التتبع', note: 'ملاحظة السائق',
    notified: 'الإشعارات', driverNotified: 'إشعار السائق', adminNotified: 'إشعار الإدارة', customerNotified: 'إشعار العميل',
    responded: 'وقت الاستجابة', resolve: 'حل الإنذار', resolving: 'جارٍ الحل...', send: 'إرسال إشعار', sending: 'جارٍ الإرسال...',
    notifyDriver: 'تنبيه السائق', notifyAdmin: 'تنبيه الإدارة', notifyCustomer: 'إبلاغ العميل بالتأخير', notifyResolved: 'إبلاغ بحل الإنذار',
    retry: 'إعادة المحاولة', loadError: 'تعذر تحميل إنذارات التتبع.', resolvedSuccess: 'تم حل الإنذار بنجاح.',
    sentSuccess: 'تم إرسال الإشعار بنجاح.', noDevice: 'تم حفظ الإشعار للعميل، لكن لا يوجد جهاز مسجل لاستقبال إشعار Push.', never: 'لم يتم', view: 'عرض التفاصيل',
  } : {
    title: 'Tracking Alerts',
    subtitle: 'Monitor unexpected stops and follow up on driver responses',
    all: 'All', open: 'Open', acknowledged: 'Acknowledged', resolved: 'Resolved', attention: 'Needs Attention',
    order: 'Order', driver: 'Driver', type: 'Alert Type', status: 'Status', reason: 'Driver Reason',
    created: 'Alert Time', actions: 'Actions', unexpectedStop: 'Unexpected Stop', noDriver: 'Unassigned',
    noReason: 'Waiting for driver response', details: 'Tracking Alert Details', tracking: 'Tracking ID', note: 'Driver Note',
    notified: 'Notifications', driverNotified: 'Driver notified', adminNotified: 'Admin notified', customerNotified: 'Customer notified',
    responded: 'Response time', resolve: 'Resolve Alert', resolving: 'Resolving...', send: 'Send Notification', sending: 'Sending...',
    notifyDriver: 'Alert driver', notifyAdmin: 'Alert admins', notifyCustomer: 'Notify customer of delay', notifyResolved: 'Notify resolution',
    retry: 'Retry', loadError: 'Unable to load tracking alerts.', resolvedSuccess: 'Alert resolved successfully.',
    sentSuccess: 'Notification sent successfully.', noDevice: 'The notification was saved for the customer, but no device is registered for push notifications.', never: 'Not yet', view: 'View details',
  };

  const statusLabel = (status: TrackingAlert['status']) => ({
    open: copy.open,
    acknowledged: copy.acknowledged,
    resolved: copy.resolved,
  }[status]);

  const reasonLabel = (reason: TrackingAlert['driver_reason']) => {
    const labels: Record<string, string> = isArabic
      ? { traffic: 'ازدحام مروري', vehicle_issue: 'عطل في المركبة', rest: 'استراحة', extra_loading: 'تحميل إضافي', other: 'سبب آخر' }
      : { traffic: 'Traffic', vehicle_issue: 'Vehicle issue', rest: 'Rest', extra_loading: 'Extra loading', other: 'Other' };
    return labels[reason] || copy.noReason;
  };

  const formatDate = (value: string | null) => {
    if (!value) return copy.never;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? copy.never : format(date, 'MMM dd, yyyy · HH:mm');
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = filter === 'admin_attention'
        ? { adminAttention: true }
        : filter === 'all' ? undefined : { status: filter };
      const [items, totals] = await Promise.all([
        adminApi.getTrackingAlerts(query),
        adminApi.getTrackingAlertSummary(),
      ]);
      setAlerts(items);
      setSummary(totals);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.loadError);
    } finally {
      setLoading(false);
    }
  }, [filter, copy.loadError]);

  useEffect(() => { void load(); }, [load]);

  const filters = useMemo(() => [
    { value: 'all' as const, label: copy.all, count: summary.open + summary.acknowledged + summary.resolved },
    { value: 'open' as const, label: copy.open, count: summary.open },
    { value: 'acknowledged' as const, label: copy.acknowledged, count: summary.acknowledged },
    { value: 'admin_attention' as const, label: copy.attention, count: summary.admin_attention },
    { value: 'resolved' as const, label: copy.resolved, count: summary.resolved },
  ], [copy, summary]);

  const resolveAlert = async (alert: TrackingAlert) => {
    setBusyId(alert.id);
    try {
      const updated = await adminApi.resolveTrackingAlert(alert.id);
      setSelected(updated);
      toast({ title: copy.resolvedSuccess });
      await load();
    } catch (err) {
      toast({ title: copy.loadError, description: err instanceof Error ? err.message : undefined, variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  const sendNotification = async (alert: TrackingAlert) => {
    setBusyId(alert.id);
    try {
      const result = await adminApi.sendTrackingAlertNotification(alert.id, notificationState);
      if (result.sent_count > 0) {
        toast({ title: copy.sentSuccess, description: `${result.sent_count}/${result.recipient_count}` });
      } else {
        toast({
          title: copy.noDevice,
          description: `Push: ${result.sent_count}/${result.recipient_count}`,
          variant: 'destructive',
        });
      }
      await load();
    } catch (err) {
      toast({ title: copy.loadError, description: err instanceof Error ? err.message : undefined, variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  const statusClass = (status: TrackingAlert['status']) => ({
    open: 'border-red-200 bg-red-50 text-red-700',
    acknowledged: 'border-amber-200 bg-amber-50 text-amber-700',
    resolved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  }[status]);

  return (
    <div className="space-y-6 animate-fade-in" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{copy.title}</h1>
          <p className="mt-1 text-muted-foreground">{copy.subtitle}</p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {copy.retry}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: copy.open, value: summary.open, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: copy.acknowledged, value: summary.acknowledged, icon: Eye, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: copy.attention, value: summary.admin_attention, icon: BellRing, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: copy.resolved, value: summary.resolved, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-xl p-3 ${bg}`}><Icon className={`h-6 w-6 ${color}`} /></div>
              <div><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold">{value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <Button key={item.value} size="sm" variant={filter === item.value ? 'default' : 'outline'} onClick={() => setFilter(item.value)}>
            {item.label}<span className="ms-2 rounded-full bg-background/20 px-2 text-xs">{item.count}</span>
          </Button>
        ))}
      </div>

      <Card className="overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <p className="font-medium text-destructive">{copy.loadError}</p><p className="max-w-lg text-sm text-muted-foreground">{error}</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" /><p>{isArabic ? 'لا توجد إنذارات ضمن هذا التصنيف.' : 'No alerts in this view.'}</p>
          </div>
        ) : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>{copy.order}</TableHead><TableHead>{copy.driver}</TableHead><TableHead>{copy.type}</TableHead>
              <TableHead>{copy.status}</TableHead><TableHead>{copy.reason}</TableHead><TableHead>{copy.created}</TableHead>
              <TableHead className="text-end">{copy.actions}</TableHead>
            </TableRow></TableHeader>
            <TableBody>{alerts.map((alert) => (
              <TableRow key={alert.id} className="hover:bg-muted/30">
                <TableCell className="font-semibold">#{alert.order_id}</TableCell>
                <TableCell><div className="flex items-center gap-2"><Truck className="h-4 w-4 text-muted-foreground" />{alert.driver_name || copy.noDriver}</div></TableCell>
                <TableCell><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-red-500" />{copy.unexpectedStop}</div></TableCell>
                <TableCell><Badge variant="outline" className={statusClass(alert.status)}>{statusLabel(alert.status)}</Badge></TableCell>
                <TableCell className="max-w-[220px] truncate">{reasonLabel(alert.driver_reason)}</TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{formatDate(alert.created_at)}</TableCell>
                <TableCell className="text-end"><Button variant="outline" size="sm" className="gap-2" onClick={() => setSelected(alert)}><Eye className="h-4 w-4" />{copy.view}</Button></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl" dir={isArabic ? 'rtl' : 'ltr'}>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-500" />{copy.details}</DialogTitle></DialogHeader>
          {selected && <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={statusClass(selected.status)}>{statusLabel(selected.status)}</Badge>
              <Badge variant="outline">{copy.order} #{selected.order_id}</Badge>
              <Badge variant="outline">{copy.tracking} #{selected.tracking}</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label={copy.driver} value={selected.driver_name || copy.noDriver} icon={Truck} />
              <Detail label={copy.reason} value={reasonLabel(selected.driver_reason)} icon={AlertTriangle} />
              <Detail label={copy.created} value={formatDate(selected.created_at)} icon={Clock3} />
              <Detail label={copy.responded} value={formatDate(selected.driver_responded_at)} icon={MessageSquareText} />
            </div>
            {selected.driver_note && <div className="rounded-lg border bg-muted/20 p-4"><p className="mb-1 text-xs font-semibold text-muted-foreground">{copy.note}</p><p className="text-sm">{selected.driver_note}</p></div>}
            <div>
              <p className="mb-2 text-sm font-semibold">{copy.notified}</p>
              <div className="grid gap-2 text-sm sm:grid-cols-3">
                <NotificationTime label={copy.driverNotified} value={formatDate(selected.driver_notified_at)} active={Boolean(selected.driver_notified_at)} />
                <NotificationTime label={copy.adminNotified} value={formatDate(selected.admin_notified_at)} active={Boolean(selected.admin_notified_at)} />
                <NotificationTime label={copy.customerNotified} value={formatDate(selected.customer_notified_at)} active={Boolean(selected.customer_notified_at)} />
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row">
              <Select value={notificationState} onValueChange={(value) => setNotificationState(value as NotificationState)}>
                <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">{copy.notifyDriver}</SelectItem><SelectItem value="admin_attention">{copy.notifyAdmin}</SelectItem>
                  <SelectItem value="customer_delay">{copy.notifyCustomer}</SelectItem><SelectItem value="resolved">{copy.notifyResolved}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2" disabled={busyId === selected.id} onClick={() => void sendNotification(selected)}>
                {busyId === selected.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{busyId === selected.id ? copy.sending : copy.send}
              </Button>
            </div>
          </div>}
          <DialogFooter>
            {selected?.status !== 'resolved' && <Button className="gap-2" disabled={busyId === selected?.id} onClick={() => selected && void resolveAlert(selected)}>
              {busyId === selected?.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}{busyId === selected?.id ? copy.resolving : copy.resolve}
            </Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Detail = ({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) => (
  <div className="rounded-lg border p-4"><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground"><Icon className="h-4 w-4" />{label}</div><p className="font-medium">{value}</p></div>
);

const NotificationTime = ({ label, value, active }: { label: string; value: string; active: boolean }) => (
  <div className="rounded-lg border p-3"><div className="mb-1 flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} /><span className="font-medium">{label}</span></div><p className="text-xs text-muted-foreground">{value}</p></div>
);
