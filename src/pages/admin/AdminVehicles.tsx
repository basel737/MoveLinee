import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext1';
import { adminApi } from '@/lib/adminApi';
import { Vehicle } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Truck, Package, CheckCircle, XCircle, Plus } from 'lucide-react';
import { AddVehicleModal } from '@/components/admin/AddVehicleModal';

export const AdminVehicles: React.FC = () => {
  const { language } = useLanguage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const translations = {
    en: {
      title: 'Vehicles Management',
      subtitle: 'Manage fleet availability and capacity',
      vehicleId: 'Vehicle ID',
      type: 'Type',
      capacity: 'Capacity',
      status: 'Status',
      available: 'Available',
      unavailable: 'Unavailable',
      totalVehicles: 'Total Vehicles',
      availableCount: 'Available',
      unavailableCount: 'In Use',
      totalCapacity: 'Total Capacity',
      cubicMeters: 'm³',
      toggleAvailability: 'Toggle Availability',
      statusUpdated: 'Vehicle status updated',
      van: 'Van',
      mediumTruck: 'Medium Truck',
      largeTruck: 'Large Truck',
      addVehicle: 'Add Vehicle',
      office: 'Office',
      plateNumber: 'Plate Number',
      payload: 'Max Payload',
      kg: 'kg',
      name: 'Name',
    },
    ar: {
      title: 'إدارة المركبات',
      subtitle: 'إدارة توفر الأسطول والسعة',
      vehicleId: 'رقم المركبة',
      type: 'النوع',
      capacity: 'السعة',
      status: 'الحالة',
      available: 'متاح',
      unavailable: 'غير متاح',
      totalVehicles: 'إجمالي المركبات',
      availableCount: 'المتاحة',
      unavailableCount: 'قيد الاستخدام',
      totalCapacity: 'السعة الإجمالية',
      cubicMeters: 'م³',
      toggleAvailability: 'تبديل التوفر',
      statusUpdated: 'تم تحديث حالة المركبة',
      van: 'فان',
      mediumTruck: 'شاحنة متوسطة',
      largeTruck: 'شاحنة كبيرة',
      addVehicle: 'إضافة شاحنة',
      office: 'المكتب',
      plateNumber: 'رقم اللوحة',
      payload: 'الحمولة القصوى',
      kg: 'كغ',
      name: 'الاسم',
    },
  };

  const t = translations[language];

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (vehicleId: number, currentStatus: boolean) => {
    try {
      await adminApi.updateVehicleAvailability(vehicleId, !currentStatus);
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicleId ? { ...v, available: !currentStatus } : v))
      );
      toast({ title: t.statusUpdated });
    } catch (error) {
      console.error('Failed to update vehicle status:', error);
    }
  };

  const getVehicleIcon = (type: string) => {
    return <Truck className="w-8 h-8" />;
  };

  const availableCount = vehicles.filter((v) => v.available).length;
  const unavailableCount = vehicles.filter((v) => !v.available).length;
  const totalCapacity = vehicles.reduce((sum, v) => sum + v.capacityM3, 0);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t.addVehicle}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.totalVehicles}</p>
                <p className="text-2xl font-bold text-foreground">{vehicles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.availableCount}</p>
                <p className="text-2xl font-bold text-foreground">{availableCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.unavailableCount}</p>
                <p className="text-2xl font-bold text-foreground">{unavailableCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                <Package className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.totalCapacity}</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalCapacity} {t.cubicMeters}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((vehicle) => (
          <Card
            key={vehicle.id}
            className={`shadow-card transition-all duration-200 ${
              vehicle.available
                ? 'border-success/30 bg-success/5'
                : 'border-muted bg-muted/30'
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    vehicle.available ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {getVehicleIcon(vehicle.type)}
                </div>
                <Badge
                  variant="outline"
                  className={
                    vehicle.available
                      ? 'bg-success/10 text-success border-success/20'
                      : 'bg-muted text-muted-foreground border-muted'
                  }
                >
                  {vehicle.available ? t.available : t.unavailable}
                </Badge>
              </div>

              <div className="space-y-3">
                {vehicle.name && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t.name}</p>
                    <p className="font-semibold">{vehicle.name}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">{t.vehicleId}</p>
                    <p className="font-semibold">#{vehicle.id}</p>
                  </div>
                  {vehicle.office && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t.office}</p>
                      <p className="font-semibold">#{vehicle.office}</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">{t.type}</p>
                  <p className="font-semibold">{vehicle.type}</p>
                </div>

                {vehicle.plate_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t.plateNumber}</p>
                    <p className="font-semibold">{vehicle.plate_number}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">{t.capacity}</p>
                    <p className="font-semibold">
                      {vehicle.capacityM3} {t.cubicMeters}
                    </p>
                  </div>
                  {vehicle.max_payload_kg && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t.payload}</p>
                      <p className="font-semibold">
                        {vehicle.max_payload_kg} {t.kg}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t.toggleAvailability}</span>
                    <Switch
                      checked={vehicle.available}
                      onCheckedChange={() => handleToggleAvailability(vehicle.id, vehicle.available)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchVehicles}
      />
    </div>
  );
};
