import React, { useEffect, useState } from 'react';
import { CreditCard, DollarSign, Download, CheckCircle, Clock, XCircle, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { dashboardApi } from '@/lib/dashboardApi';
import { Payment, DashboardOrder } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext1';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';

const getStatusBadge = (status: string, language: string) => {
  const config: Record<string, { icon: React.ElementType; variant: 'default' | 'secondary' | 'destructive'; label: string; labelAr: string }> = {
    'pending': { icon: Clock, variant: 'secondary', label: 'Pending', labelAr: 'قيد الانتظار' },
    'completed': { icon: CheckCircle, variant: 'default', label: 'Completed', labelAr: 'مكتمل' },
    'failed': { icon: XCircle, variant: 'destructive', label: 'Failed', labelAr: 'فشل' },
    'refunded': { icon: DollarSign, variant: 'secondary', label: 'Refunded', labelAr: 'مسترد' },
  };

  const { icon: Icon, variant, label, labelAr } = config[status] || config['pending'];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="w-3 h-3" />
      {language === 'ar' ? labelAr : label}
    </Badge>
  );
};

const getMethodIcon = (method: string) => {
  switch (method) {
    case 'card':
      return <CreditCard className="w-4 h-4" />;
    case 'cash':
      return <DollarSign className="w-4 h-4" />;
    default:
      return <Wallet className="w-4 h-4" />;
  }
};

export const Payments: React.FC = () => {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get('order');
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [unpaidOrders, setUnpaidOrders] = useState<DashboardOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DashboardOrder | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'partial'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [paymentsRes, ordersRes] = await Promise.all([
          dashboardApi.getPayments(),
          dashboardApi.getOrders(),
        ]);
        setPayments(paymentsRes.data);
        
        // Find unpaid orders
        const paidOrderIds = new Set(paymentsRes.data.filter(p => p.status === 'completed').map(p => p.orderId));
        const unpaid = ordersRes.data.filter(o => 
          !paidOrderIds.has(o.id) && ['pending', 'confirmed'].includes(o.status)
        );
        setUnpaidOrders(unpaid);

        // Auto-select order from URL
        if (orderIdParam) {
          const order = ordersRes.data.find(o => o.id.toString() === orderIdParam);
          if (order) {
            setSelectedOrder(order);
            setDialogOpen(true);
          }
        }
      } catch (err) {
        setError('Failed to load payments');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [orderIdParam]);

  const handlePayment = async () => {
    if (!selectedOrder) return;
    
    setIsProcessing(true);
    try {
      await dashboardApi.createPayment({
        orderId: selectedOrder.id,
        amount: selectedOrder.price,
        method: paymentMethod,
      });
      
      toast.success(language === 'ar' ? 'تم الدفع بنجاح!' : 'Payment successful!');
      setDialogOpen(false);
      
      // Refresh data
      const response = await dashboardApi.getPayments();
      setPayments(response.data);
      setUnpaidOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
    } catch (err: any) {
      toast.error(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadInvoice = async (paymentId: number) => {
    try {
      const response = await dashboardApi.getInvoice(paymentId);
      toast.success(language === 'ar' ? 'جاري تحميل الفاتورة...' : 'Downloading invoice...');
      // In a real app, this would trigger a download
    } catch (err) {
      toast.error('Failed to download invoice');
    }
  };

  const totalPaid = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 text-center text-destructive">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {language === 'ar' ? 'المدفوعات والفواتير' : 'Payments & Invoices'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' 
            ? 'عرض جميع المعاملات والفواتير'
            : 'View all transactions and invoices'
          }
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'إجمالي المدفوعات' : 'Total Paid'}
                </p>
                <p className="text-2xl font-bold text-foreground">${totalPaid.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'المعاملات' : 'Transactions'}
                </p>
                <p className="text-2xl font-bold text-foreground">{payments.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'طلبات غير مدفوعة' : 'Unpaid Orders'}
                </p>
                <p className="text-2xl font-bold text-foreground">{unpaidOrders.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unpaid Orders */}
      {unpaidOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-600">
              {language === 'ar' ? 'طلبات تحتاج دفع' : 'Orders Awaiting Payment'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unpaidOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800"
                >
                  <div>
                    <p className="font-medium">#{order.id} - {order.serviceType}</p>
                    <p className="text-sm text-muted-foreground">${order.price}</p>
                  </div>
                  <Dialog open={dialogOpen && selectedOrder?.id === order.id} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setSelectedOrder(order)}>
                        {language === 'ar' ? 'ادفع الآن' : 'Pay Now'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {language === 'ar' ? 'الدفع للطلب' : 'Pay for Order'} #{order.id}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            {language === 'ar' ? 'المبلغ المستحق' : 'Amount Due'}
                          </p>
                          <p className="text-2xl font-bold">${order.price}</p>
                        </div>

                        <div className="space-y-2">
                          <Label>{language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</Label>
                          <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="card" id="card" />
                              <Label htmlFor="card" className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                {language === 'ar' ? 'بطاقة' : 'Card'}
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="cash" id="cash" />
                              <Label htmlFor="cash" className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                {language === 'ar' ? 'نقداً عند التسليم' : 'Cash on Delivery'}
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="partial" id="partial" />
                              <Label htmlFor="partial" className="flex items-center gap-2">
                                <Wallet className="w-4 h-4" />
                                {language === 'ar' ? 'دفع جزئي' : 'Partial Payment'}
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {paymentMethod === 'card' && (
                          <div className="space-y-2">
                            <Label>{language === 'ar' ? 'رقم البطاقة' : 'Card Number'}</Label>
                            <Input
                              placeholder="1234 5678 9012 3456"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                            />
                          </div>
                        )}

                        <Button
                          className="w-full"
                          onClick={handlePayment}
                          disabled={isProcessing}
                        >
                          {isProcessing 
                            ? (language === 'ar' ? 'جاري المعالجة...' : 'Processing...')
                            : (language === 'ar' ? 'تأكيد الدفع' : 'Confirm Payment')
                          }
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'سجل المدفوعات' : 'Payment History'}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="p-8 text-center">
              <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {language === 'ar' ? 'لا توجد مدفوعات بعد' : 'No payments yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'ar' ? 'رقم الطلب' : 'Order'}</TableHead>
                    <TableHead>{language === 'ar' ? 'المبلغ' : 'Amount'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الطريقة' : 'Method'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                    <TableHead>{language === 'ar' ? 'معرف المعاملة' : 'Transaction ID'}</TableHead>
                    <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                    <TableHead className="text-right">{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">#{payment.orderId}</TableCell>
                      <TableCell className="font-medium">${payment.amount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMethodIcon(payment.method)}
                          <span className="capitalize">{payment.method}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status, language)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {payment.transactionId || '-'}
                      </TableCell>
                      <TableCell>
                        {payment.paidAt 
                          ? format(new Date(payment.paidAt), 'MMM dd, yyyy')
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        {payment.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadInvoice(payment.id)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            {language === 'ar' ? 'فاتورة' : 'Invoice'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
