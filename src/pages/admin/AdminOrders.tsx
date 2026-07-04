import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext1';
import { adminApi } from '@/lib/adminApi';
import { DashboardOrder, OrderItemV2, AIAnalyzer, Driver } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Package, Eye, UserPlus, MapPin, Calendar, Search, Filter, Truck, Brain, Box } from 'lucide-react';
import { format } from 'date-fns';

export const AdminOrders: React.FC = () => {
  const { language } = useLanguage();
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<DashboardOrder | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemV2[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalyzer | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAssignDriver, setShowAssignDriver] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const translations = {
    en: {
      title: 'Orders Management',
      subtitle: 'View and manage all orders',
      orderId: 'Order ID',
      customer: 'Customer',
      service: 'Service Type',
      status: 'Status',
      scheduledDate: 'Scheduled Date',
      price: 'Price',
      actions: 'Actions',
      view: 'View',
      assignDriver: 'Assign Driver',
      orderDetails: 'Order Details',
      pickupAddress: 'Pickup Address',
      dropoffAddress: 'Dropoff Address',
      notes: 'Notes',
      items: 'Order Items',
      aiAnalysis: 'AI Analysis',
      volume: 'Total Volume',
      suggestedVehicle: 'Suggested Vehicle',
      suggestedWorkers: 'Suggested Workers',
      confidence: 'Confidence',
      close: 'Close',
      selectDriver: 'Select Driver',
      assign: 'Assign',
      cancel: 'Cancel',
      filterByStatus: 'Filter by Status',
      all: 'All',
      pending: 'Pending',
      confirmed: 'Confirmed',
      driverAssigned: 'Driver Assigned',
      inTransit: 'In Transit',
      delivered: 'Delivered',
      available: 'Available',
      completed: 'Completed',
      search: 'Search orders...',
      noOrders: 'No orders found',
      sar: 'SAR',
      updateStatus: 'Update Status',
      statusUpdated: 'Status updated successfully',
      driverAssignedMsg: 'Driver assigned successfully',
      fragile: 'Fragile',
      disassembly: 'Needs Disassembly',
    },
    ar: {
      title: 'إدارة الطلبات',
      subtitle: 'عرض وإدارة جميع الطلبات',
      orderId: 'رقم الطلب',
      customer: 'العميل',
      service: 'نوع الخدمة',
      status: 'الحالة',
      scheduledDate: 'تاريخ الموعد',
      price: 'السعر',
      actions: 'الإجراءات',
      view: 'عرض',
      assignDriver: 'تعيين سائق',
      orderDetails: 'تفاصيل الطلب',
      pickupAddress: 'عنوان الاستلام',
      dropoffAddress: 'عنوان التسليم',
      notes: 'ملاحظات',
      items: 'عناصر الطلب',
      aiAnalysis: 'تحليل الذكاء الاصطناعي',
      volume: 'الحجم الإجمالي',
      suggestedVehicle: 'المركبة المقترحة',
      suggestedWorkers: 'العمال المقترحين',
      confidence: 'نسبة الثقة',
      close: 'إغلاق',
      selectDriver: 'اختر سائق',
      assign: 'تعيين',
      cancel: 'إلغاء',
      filterByStatus: 'تصفية حسب الحالة',
      all: 'الكل',
      pending: 'قيد الانتظار',
      confirmed: 'مؤكد',
      driverAssigned: 'تم تعيين سائق',
      inTransit: 'في الطريق',
      delivered: 'تم التسليم',
      available: 'متاح',
      completed: 'مكتمل',
      search: 'البحث في الطلبات...',
      noOrders: 'لم يتم العثور على طلبات',
      sar: 'ر.س',
      updateStatus: 'تحديث الحالة',
      statusUpdated: 'تم تحديث الحالة بنجاح',
      driverAssignedMsg: 'تم تعيين السائق بنجاح',
      fragile: 'هش',
      disassembly: 'يحتاج فك',
    },
  };

  const t = translations[language];

  useEffect(() => {
    fetchOrders();
    fetchDrivers();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllOrders({ status: statusFilter });
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const data = await adminApi.getDrivers();
      setDrivers(data);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    }
  };

  const handleViewOrder = async (order: DashboardOrder) => {
    setSelectedOrder(order);
    try {
      const [items, analysis] = await Promise.all([
        adminApi.getOrderItems(order.id),
        adminApi.getAnalyzerResult(order.id),
      ]);
      setOrderItems(items);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
    setShowDetails(true);
  };

  const handleAssignDriver = async () => {
    if (!selectedOrder || !selectedDriverId) return;

    try {
      await adminApi.assignDriver(selectedOrder.id, parseInt(selectedDriverId));
      toast({ title: t.driverAssignedMsg });
      setShowAssignDriver(false);
      setSelectedDriverId('');
      fetchOrders();
    } catch (error) {
      console.error('Failed to assign driver:', error);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: DashboardOrder['status']) => {
    try {
      if (newStatus === 'delivered') {
        await adminApi.markDelivered(orderId);
      } else if (newStatus === 'available') {
        await adminApi.markAvailable(orderId);
      } else {
        await adminApi.updateOrderStatus(orderId, newStatus);
      }
      toast({ title: t.statusUpdated });
      fetchOrders();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-warning/10 text-warning border-warning/20',
      confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'assigned': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'in-transit': 'bg-primary/10 text-primary border-primary/20',
      delivered: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
      available: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      completed: 'bg-success/10 text-success border-success/20',
      cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return styles[status] || 'bg-muted text-muted-foreground';
  };

  const filteredOrders = orders.filter((order) =>
    order.id.toString().includes(searchQuery) ||
    order.pickup_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.dropoff_address.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder={t.filterByStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.all}</SelectItem>
            <SelectItem value="pending">{t.pending}</SelectItem>
            <SelectItem value="confirmed">{t.confirmed}</SelectItem>
            <SelectItem value="assigned">{t.driverAssigned}</SelectItem>
            <SelectItem value="in-transit">{t.inTransit}</SelectItem>
            <SelectItem value="delivered">{t.delivered}</SelectItem>
            <SelectItem value="available">{t.available}</SelectItem>
            <SelectItem value="completed">{t.completed}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.orderId}</TableHead>
                <TableHead>{t.service}</TableHead>
                <TableHead>{t.status}</TableHead>
                <TableHead>{t.scheduledDate}</TableHead>
                <TableHead>{t.price}</TableHead>
                <TableHead className="text-right">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {t.noOrders}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.service_type}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadge(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.scheduled_start), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {order.estimated_price} {t.sar}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!order.driver && order.status !== 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowAssignDriver(true);
                            }}
                          >
                            <UserPlus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {t.orderDetails} #{selectedOrder?.id}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Status & Actions */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={getStatusBadge(selectedOrder.status)}>
                  {selectedOrder.status}
                </Badge>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => handleUpdateStatus(selectedOrder.id, value as DashboardOrder['status'])}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t.updateStatus} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t.pending}</SelectItem>
                    <SelectItem value="confirmed">{t.confirmed}</SelectItem>
                    <SelectItem value="assigned">{t.driverAssigned}</SelectItem>
                    <SelectItem value="in-transit">{t.inTransit}</SelectItem>
                    <SelectItem value="delivered">{t.delivered}</SelectItem>
                    <SelectItem value="available">{t.available}</SelectItem>
                    <SelectItem value="completed">{t.completed}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Locations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <MapPin className="w-4 h-4" />
                    {t.pickupAddress}
                  </div>
                  <p className="font-medium">{selectedOrder.pickup_address}</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <MapPin className="w-4 h-4" />
                    {t.dropoffAddress}
                  </div>
                  <p className="font-medium">{selectedOrder.dropoff_address}</p>
                </div>
              </div>

              {/* Schedule & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <MapPin className="w-4 h-4" />
                    {t.scheduledDate}
                  </div>
                  <p className="font-medium">
                    {format(new Date(selectedOrder.scheduled_start), 'PPP')}
                  </p>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">{t.price}</div>
                  <p className="text-xl font-bold text-primary">
                    {selectedOrder.estimated_price} {t.sar}
                  </p>
                </div>
              </div>

              {/* Special Instructions */}
              {selectedOrder.special_instructions && (
                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">{t.notes}</div>
                  <p>{selectedOrder.special_instructions}</p>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Box className="w-5 h-5" />
                  {t.items}
                </h3>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity}x
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {item.is_fragile && (
                          <Badge variant="outline" className="text-warning border-warning">
                            {t.fragile}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Analysis */}
              {aiAnalysis && (
                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5" />
                    {t.aiAnalysis}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-center">
                      <p className="text-sm text-muted-foreground">{t.volume}</p>
                      <p className="text-lg font-bold">{aiAnalysis.totalVolumeM3}m³</p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10 text-center">
                      <p className="text-sm text-muted-foreground">{t.suggestedVehicle}</p>
                      <p className="text-lg font-bold">{aiAnalysis.suggestedVehicle}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10 text-center">
                      <p className="text-sm text-muted-foreground">{t.suggestedWorkers}</p>
                      <p className="text-lg font-bold">{aiAnalysis.suggestedWorkers}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10 text-center">
                      <p className="text-sm text-muted-foreground">{t.confidence}</p>
                      <p className="text-lg font-bold">{(aiAnalysis.confidence * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              {t.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Driver Dialog */}
      <Dialog open={showAssignDriver} onOpenChange={setShowAssignDriver}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              {t.assignDriver}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
              <SelectTrigger>
                <SelectValue placeholder={t.selectDriver} />
              </SelectTrigger>
              <SelectContent>
                {drivers
                  .filter((d) => d.available)
                  .map((driver) => (
                    <SelectItem key={driver.id} value={driver.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{driver.fullName}</span>
                        <Badge variant="outline" className="text-xs">
                          ★ {driver.rating}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDriver(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleAssignDriver} disabled={!selectedDriverId}>
              {t.assign}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
