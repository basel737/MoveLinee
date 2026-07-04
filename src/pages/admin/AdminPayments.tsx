import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext1';
import { adminApi } from '@/lib/adminApi';
import { Payment } from '@/types/dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { CreditCard, DollarSign, CheckCircle, Clock, XCircle, Download } from 'lucide-react';
import { format } from 'date-fns';

export const AdminPayments: React.FC = () => {
  const { language } = useLanguage();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const translations = {
    en: {
      title: 'Payments Management',
      subtitle: 'View and manage all payments',
      paymentId: 'Payment ID',
      orderId: 'Order ID',
      amount: 'Amount',
      method: 'Method',
      status: 'Status',
      transactionId: 'Transaction ID',
      paidAt: 'Paid At',
      actions: 'Actions',
      pending: 'Pending',
      completed: 'Completed',
      failed: 'Failed',
      refunded: 'Refunded',
      card: 'Card',
      cash: 'Cash',
      partial: 'Partial',
      totalRevenue: 'Total Revenue',
      pendingPayments: 'Pending Payments',
      completedPayments: 'Completed',
      failedPayments: 'Failed',
      markAsPaid: 'Mark as Paid',
      download: 'Invoice',
      sar: 'SAR',
      noPayments: 'No payments found',
      statusUpdated: 'Payment status updated',
      na: 'N/A',
    },
    ar: {
      title: 'إدارة المدفوعات',
      subtitle: 'عرض وإدارة جميع المدفوعات',
      paymentId: 'رقم الدفع',
      orderId: 'رقم الطلب',
      amount: 'المبلغ',
      method: 'الطريقة',
      status: 'الحالة',
      transactionId: 'رقم العملية',
      paidAt: 'تاريخ الدفع',
      actions: 'الإجراءات',
      pending: 'قيد الانتظار',
      completed: 'مكتمل',
      failed: 'فشل',
      refunded: 'مسترد',
      card: 'بطاقة',
      cash: 'نقدي',
      partial: 'جزئي',
      totalRevenue: 'إجمالي الإيرادات',
      pendingPayments: 'المدفوعات المعلقة',
      completedPayments: 'المكتملة',
      failedPayments: 'الفاشلة',
      markAsPaid: 'تحديد كمدفوع',
      download: 'الفاتورة',
      sar: 'ر.س',
      noPayments: 'لم يتم العثور على مدفوعات',
      statusUpdated: 'تم تحديث حالة الدفع',
      na: 'غير متاح',
    },
  };

  const t = translations[language];

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllPayments();
      setPayments(data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (paymentId: number, newStatus: Payment['status']) => {
    try {
      await adminApi.updatePaymentStatus(paymentId, newStatus);
      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId
            ? { ...p, status: newStatus, paidAt: newStatus === 'completed' ? new Date().toISOString() : p.paidAt }
            : p
        )
      );
      toast({ title: t.statusUpdated });
    } catch (error) {
      console.error('Failed to update payment status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { class: string; icon: React.ReactNode }> = {
      pending: {
        class: 'bg-warning/10 text-warning border-warning/20',
        icon: <Clock className="w-3 h-3" />,
      },
      completed: {
        class: 'bg-success/10 text-success border-success/20',
        icon: <CheckCircle className="w-3 h-3" />,
      },
      failed: {
        class: 'bg-destructive/10 text-destructive border-destructive/20',
        icon: <XCircle className="w-3 h-3" />,
      },
      refunded: {
        class: 'bg-muted text-muted-foreground border-muted',
        icon: <DollarSign className="w-3 h-3" />,
      },
    };
    return styles[status] || styles.pending;
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      card: t.card,
      cash: t.cash,
      partial: t.partial,
    };
    return labels[method] || method;
  };

  const totalRevenue = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = payments.filter((p) => p.status === 'pending').length;
  const completedCount = payments.filter((p) => p.status === 'completed').length;
  const failedCount = payments.filter((p) => p.status === 'failed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.totalRevenue}</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalRevenue.toLocaleString()} {t.sar}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.pendingPayments}</p>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.completedPayments}</p>
                <p className="text-2xl font-bold text-foreground">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.failedPayments}</p>
                <p className="text-2xl font-bold text-foreground">{failedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.paymentId}</TableHead>
                <TableHead>{t.orderId}</TableHead>
                <TableHead>{t.amount}</TableHead>
                <TableHead>{t.method}</TableHead>
                <TableHead>{t.status}</TableHead>
                <TableHead>{t.transactionId}</TableHead>
                <TableHead>{t.paidAt}</TableHead>
                <TableHead className="text-right">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {t.noPayments}
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => {
                  const statusStyle = getStatusBadge(payment.status);
                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">#{payment.id}</TableCell>
                      <TableCell>#{payment.orderId}</TableCell>
                      <TableCell className="font-semibold">
                        {payment.amount} {t.sar}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getMethodLabel(payment.method)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${statusStyle.class} gap-1`}>
                          {statusStyle.icon}
                          {t[payment.status as keyof typeof t]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {payment.transactionId || t.na}
                      </TableCell>
                      <TableCell>
                        {payment.paidAt
                          ? format(new Date(payment.paidAt), 'MMM dd, yyyy HH:mm')
                          : t.na}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {payment.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(payment.id, 'completed')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {t.markAsPaid}
                            </Button>
                          )}
                          {payment.status === 'completed' && (
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-1" />
                              {t.download}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
