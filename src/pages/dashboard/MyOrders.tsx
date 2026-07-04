import React, { useEffect, useState } from 'react';
import { Package, MapPin, Calendar, DollarSign, Eye, Truck, Star, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNavigate, useParams } from 'react-router-dom';
import { dashboardApi } from '@/lib/dashboardApi';
import { DashboardOrder } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext1';
import { format } from 'date-fns';

const getStatusBadge = (status: string, language: string) => {
  const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; labelAr: string }> = {
    'pending': { variant: 'secondary', label: 'Pending', labelAr: 'قيد الانتظار' },
    'confirmed': { variant: 'outline', label: 'Confirmed', labelAr: 'مؤكد' },
    'driver-assigned': { variant: 'outline', label: 'Driver Assigned', labelAr: 'تم تعيين السائق' },
    'in-transit': { variant: 'default', label: 'In Transit', labelAr: 'في الطريق' },
    'arrived': { variant: 'default', label: 'Arrived', labelAr: 'وصل' },
    'completed': { variant: 'secondary', label: 'Completed', labelAr: 'مكتمل' },
    'cancelled': { variant: 'destructive', label: 'Cancelled', labelAr: 'ملغي' },
  };

  const config = statusConfig[status] || statusConfig['pending'];
  return (
    <Badge variant={config.variant}>
      {language === 'ar' ? config.labelAr : config.label}
    </Badge>
  );
};

export const MyOrders: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { language } = useLanguage();
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<DashboardOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await dashboardApi.getOrders();
        setOrders(response.data);
        setFilteredOrders(response.data);
      } catch (err) {
        setError('Failed to load orders');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    if (orderId) {
      setSearchTerm(orderId);
    }
  }, [orderId]);

  useEffect(() => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toString().includes(searchTerm) ||
          order.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  const canTrack = (status: string) => ['driver-assigned', 'in-transit', 'arrived'].includes(status);
  const canPay = (status: string) => ['pending', 'confirmed'].includes(status);
  const canRate = (status: string) => status === 'completed';

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
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
          {language === 'ar' ? 'طلباتي' : 'My Orders'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' 
            ? 'عرض وإدارة جميع طلباتك'
            : 'View and manage all your orders'
          }
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={language === 'ar' ? 'بحث بالرقم أو العنوان...' : 'Search by ID or address...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={language === 'ar' ? 'تصفية حسب الحالة' : 'Filter by status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</SelectItem>
                <SelectItem value="pending">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</SelectItem>
                <SelectItem value="confirmed">{language === 'ar' ? 'مؤكد' : 'Confirmed'}</SelectItem>
                <SelectItem value="in-transit">{language === 'ar' ? 'في الطريق' : 'In Transit'}</SelectItem>
                <SelectItem value="completed">{language === 'ar' ? 'مكتمل' : 'Completed'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {language === 'ar' ? 'لا توجد طلبات' : 'No orders found'}
              </p>
              <Button 
                className="mt-4" 
                onClick={() => navigate('/dashboard/new-order')}
              >
                {language === 'ar' ? 'إنشاء طلب جديد' : 'Create New Order'}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'ar' ? 'رقم الطلب' : 'Order ID'}</TableHead>
                    <TableHead>{language === 'ar' ? 'نوع الخدمة' : 'Service'}</TableHead>
                    <TableHead className="hidden md:table-cell">{language === 'ar' ? 'الموقع' : 'Location'}</TableHead>
                    <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                    <TableHead>{language === 'ar' ? 'السعر' : 'Price'}</TableHead>
                    <TableHead className="text-right">{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{order.serviceType}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                        {order.pickupAddress}
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.scheduledAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status, language)}</TableCell>
                      <TableCell className="font-medium">${order.price}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title={language === 'ar' ? 'عرض' : 'View'}
                            onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {canTrack(order.status) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title={language === 'ar' ? 'تتبع' : 'Track'}
                              onClick={() => navigate(`/dashboard/track?order=${order.id}`)}
                            >
                              <Truck className="w-4 h-4 text-primary" />
                            </Button>
                          )}
                          {canPay(order.status) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title={language === 'ar' ? 'دفع' : 'Pay'}
                              onClick={() => navigate(`/dashboard/payments?order=${order.id}`)}
                            >
                              <CreditCard className="w-4 h-4 text-blue-500" />
                            </Button>
                          )}
                          {canRate(order.status) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title={language === 'ar' ? 'تقييم' : 'Rate'}
                              onClick={() => navigate(`/dashboard/ratings?order=${order.id}`)}
                            >
                              <Star className="w-4 h-4 text-amber-500" />
                            </Button>
                          )}
                        </div>
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
