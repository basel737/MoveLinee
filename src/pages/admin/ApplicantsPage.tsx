import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext1';
import { adminApi } from '@/lib/adminApi';
import { DriverApplicant, WorkerApplicant } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Calendar, 
  MapPin, 
  Phone, 
  Truck, 
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  ClipboardList,
  User,
  Image as ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';

const formatSafeDate = (dateVal: any, formatStr: string) => {
  if (!dateVal) return 'N/A';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return 'N/A';
  try {
    return format(d, formatStr);
  } catch (e) {
    return 'N/A';
  }
};

export const ApplicantsPage: React.FC = () => {
  const { language } = useLanguage();
  const [driverApplicants, setDriverApplicants] = useState<DriverApplicant[]>([]);
  const [workerApplicants, setWorkerApplicants] = useState<WorkerApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<{ type: 'drivers' | 'workers', data: DriverApplicant | WorkerApplicant } | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewLocation, setInterviewLocation] = useState('');

  // Helper function to convert media URLs to local proxy paths
  const getMediaUrl = (value?: string | null) => {
    if (!value) return '';

    try {
      const url = new URL(value, window.location.origin);

      if (url.pathname.startsWith('/media/')) {
        return `${url.pathname}${url.search}`;
      }

      return value;
    } catch {
      return value;
    }
  };

  const translations = {
    en: {
      title: 'Applicants Management',
      subtitle: 'Review and manage driver and worker applications',
      drivers: 'Drivers Applications',
      workers: 'Workers Applications',
      totalApplications: 'Total Applications',
      pending: 'Pending',
      interviewScheduled: 'Interview Scheduled',
      approved: 'Approved',
      rejected: 'Rejected',
      phone: 'Phone',
      city: 'City / Area',
      availability: 'Availability',
      license: 'License #',
      licensePhoto: 'License Photo',
      idFront: 'ID Front',
      idBack: 'ID Back',
      skills: 'Skills',
      heavyLift: 'Can Lift Heavy',
      interviewStatus: 'Interview Status',
      interviewDate: 'Interview Date & Time',
      interviewLocation: 'Interview Location',
      appliedOn: 'Applied',
      scheduleInterview: 'Schedule Interview',
      approve: 'Approve',
      reject: 'Reject',
      confirm: 'Confirm',
      cancel: 'Cancel',
      setInterview: 'Schedule Interview',
      noApplicants: 'No applicants found',
      yes: 'Yes',
      no: 'No',
      successSchedule: 'Interview scheduled successfully',
      successApprove: 'Applicant approved successfully',
      successReject: 'Applicant rejected successfully',
      review: 'Under Review',
    },
    ar: {
      title: 'إدارة المتقدمين',
      subtitle: 'مراجعة وإدارة طلبات السائقين والعمال',
      drivers: 'طلبات السائقين',
      workers: 'طلبات العمال',
      totalApplications: 'إجمالي الطلبات',
      pending: 'قيد الانتظار',
      interviewScheduled: 'مقابلات محددة',
      approved: 'مقبول',
      rejected: 'مرفوض',
      phone: 'الهاتف',
      city: 'المدينة / المنطقة',
      availability: 'التوفر',
      license: 'رقم الرخصة',
      licensePhoto: 'صورة الرخصة',
      idFront: 'الهوية (أمام)',
      idBack: 'الهوية (خلف)',
      skills: 'المهارات',
      heavyLift: 'رفع الأثقال',
      interviewStatus: 'حالة المقابلة',
      interviewDate: 'تاريخ ووقت المقابلة',
      interviewLocation: 'موقع المقابلة',
      appliedOn: 'تاريخ التقديم',
      scheduleInterview: 'تحديد مقابلة',
      approve: 'قبول',
      reject: 'رفض',
      confirm: 'تأكيد',
      cancel: 'إلغاء',
      setInterview: 'تحديد موعد المقابلة',
      noApplicants: 'لم يتم العثور على متقدمين',
      yes: 'نعم',
      no: 'لا',
      successSchedule: 'تم تحديد موعد المقابلة بنجاح',
      successApprove: 'تم قبول المتقدم بنجاح',
      successReject: 'تم رفض المتقدم بنجاح',
      review: 'قيد المراجعة',
    },
  };

  const t = translations[language];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [drivers, workers] = await Promise.all([
        adminApi.getDriverApplicants(),
        adminApi.getWorkerApplicants(),
      ]);
      setDriverApplicants(Array.isArray(drivers) ? drivers : []);
      setWorkerApplicants(Array.isArray(workers) ? workers : []);
    } catch (error) {
      console.error('Failed to fetch applicants:', error);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: language === 'en' ? 'Failed to fetch applicants' : 'فشل في جلب المتقدمين',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScheduleInterview = async () => {
    if (!selectedApplicant || !interviewDate || !interviewLocation) return;

    try {
      await adminApi.scheduleInterview(
        selectedApplicant.type, 
        selectedApplicant.data.id, 
        { 
          interview_datetime: new Date(interviewDate).toISOString(),
          interview_location: interviewLocation
        }
      );
      toast({ title: t.successSchedule });
      setShowInterviewModal(false);
      setInterviewDate('');
      setInterviewLocation('');
      fetchData();
    } catch (error) {
      console.error('Failed to schedule interview:', error);
    }
  };

  const handleApprove = async (type: 'drivers' | 'workers', id: number) => {
    try {
      await adminApi.approveApplicant(type, id);
      toast({ title: t.successApprove });
      fetchData();
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async (type: 'drivers' | 'workers', id: number) => {
    try {
      await adminApi.rejectApplicant(type, id);
      toast({ title: t.successReject });
      fetchData();
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-warning/10 text-warning border-warning/20',
      approved: 'bg-success/10 text-success border-success/20',
      rejected: 'bg-destructive/10 text-destructive border-destructive/20',
      review: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    };
    return (
      <Badge variant="outline" className={styles[status] || ''}>
        {t[status as keyof typeof t] || status}
      </Badge>
    );
  };

  const StatsCards = () => {
    const all = [...driverApplicants, ...workerApplicants];
    const stats = {
      total: all.length,
      pending: all.filter(a => a.status === 'pending' && (!a.interview_status || a.interview_status === 'pending_scheduling')).length,
      interview: all.filter(a => a.interview_status === 'scheduled').length,
      approved: all.filter(a => a.status === 'approved').length,
      rejected: all.filter(a => a.status === 'rejected').length,
    };

    const cardItems = [
      { label: t.totalApplications, value: stats.total, icon: Users, color: 'primary' },
      { label: t.pending, value: stats.pending, icon: Clock, color: 'warning' },
      { label: t.interviewScheduled, value: stats.interview, icon: Calendar, color: 'accent' },
      { label: t.approved, value: stats.approved, icon: UserCheck, color: 'success' },
      { label: t.rejected, value: stats.rejected, icon: UserX, color: 'destructive' },
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cardItems.map((item, idx) => (
          <Card key={idx} className="shadow-card border-none hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-${item.color}/10`}>
                <item.icon className={`w-5 h-5 text-${item.color}`} />
              </div>
              <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
              <p className="text-2xl font-bold mt-1">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const ApplicantCard = ({ applicant, type }: { applicant: any, type: 'drivers' | 'workers' }) => {
    // Debug log to see exactly what's coming from API
    useEffect(() => {
      console.log(`🔍 Applicant ${applicant.id} (${applicant.full_name}):`, {
        status: applicant.status,
        interview_status: applicant.interview_status,
        interview_datetime: applicant.interview_datetime
      });
    }, [applicant]);

    const status = applicant.status?.toLowerCase() || '';
    const interviewStatus = applicant.interview_status?.toLowerCase()?.trim() || '';

    return (
      <Card className="shadow-card overflow-hidden hover:shadow-md transition-shadow relative">
        <div className="absolute top-4 right-4">
          {getStatusBadge(status)}
        </div>
        
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
              {applicant.personal_photo ? (
                <img src={getMediaUrl(applicant.personal_photo)} alt={applicant.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold truncate">{applicant.full_name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Phone className="w-3 h-3" />
                <span>{applicant.phone}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 mt-6">
            <div className="flex justify-between text-sm py-1 border-b border-dashed">
              <span className="text-muted-foreground">{t.city}:</span>
              <span className="font-medium">{applicant.city_area || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm py-1 border-b border-dashed">
              <span className="text-muted-foreground">{t.availability}:</span>
              <span className="font-medium">{applicant.availability}</span>
            </div>

            {type === 'drivers' ? (
              <>
                <div className="flex justify-between text-sm py-1 border-b border-dashed">
                  <span className="text-muted-foreground">{t.license}:</span>
                  <span className="font-medium">{(applicant as any).driver_license_number || applicant.license_number}</span>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">{t.licensePhoto}:</p>
                  <div className="w-full h-24 rounded-lg bg-muted overflow-hidden">
                    {((applicant as any).driver_license_photo || applicant.license_photo) ? (
                      <img src={getMediaUrl((applicant as any).driver_license_photo || applicant.license_photo)} alt="License" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between text-sm py-1 border-b border-dashed">
                  <span className="text-muted-foreground">{t.heavyLift}:</span>
                  <span className="font-medium">{applicant.can_lift_heavy ? t.yes : t.no}</span>
                </div>
                <div className="flex flex-col gap-1 py-1 border-b border-dashed">
                  <span className="text-xs text-muted-foreground">{t.skills}:</span>
                  <span className="text-sm font-medium">{applicant.skills}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">{t.idFront}:</p>
                    <div className="h-16 rounded bg-muted overflow-hidden">
                      {applicant.id_card_photo_front ? (
                        <img src={getMediaUrl(applicant.id_card_photo_front)} alt="ID Front" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">{t.idBack}:</p>
                    <div className="h-16 rounded bg-muted overflow-hidden">
                      {applicant.id_card_photo_back ? (
                        <img src={getMediaUrl(applicant.id_card_photo_back)} alt="ID Back" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="mt-4 p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <ClipboardList className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider">{t.interviewStatus}:</span>
              </div>
              <p className="text-sm font-medium text-primary ml-6 italic">
                {applicant.interview_status?.replace('_', ' ') || 'pending_scheduling'}
              </p>
              {applicant.interview_datetime && (
                <div className="mt-2 ml-6 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="w-3 h-3" />
                    <span>{formatSafeDate(applicant.interview_datetime, 'PPP p')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <MapPin className="w-3 h-3" />
                    <span>{applicant.interview_location}</span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground mt-2">
              {t.appliedOn}: {formatSafeDate(applicant.created_at, 'MM/dd/yyyy')}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            {/* Show Schedule button if it's pending scheduling and not already approved/rejected */}
            {status !== 'approved' && status !== 'rejected' && 
             (interviewStatus === 'pending_scheduling' || !interviewStatus || interviewStatus === '') && (
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white"
                onClick={() => {
                  setSelectedApplicant({ type, data: applicant });
                  setShowInterviewModal(true);
                }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                {t.scheduleInterview}
              </Button>
            )}

            {/* Show Approve/Reject if interview status is scheduled */}
            {status !== 'approved' && status !== 'rejected' && 
             (interviewStatus === 'scheduled' || interviewStatus === 'interviewing') && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 text-success border-success/30 hover:bg-success/10"
                  onClick={() => handleApprove(type, applicant.id)}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  {t.approve}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => handleReject(type, applicant.id)}
                >
                  <UserX className="w-4 h-4 mr-2" />
                  {t.reject}
                </Button>
              </div>
            )}
            
            {/* Support rescheduling if desired */}
            {status !== 'approved' && status !== 'rejected' && 
             interviewStatus === 'scheduled' && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs text-muted-foreground mt-1"
                onClick={() => {
                  setSelectedApplicant({ type, data: applicant });
                  setShowInterviewModal(true);
                }}
              >
                {t.scheduleInterview} ({t.confirm})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      <StatsCards />

      <Tabs defaultValue="drivers" className="w-full">
        <TabsList className="bg-muted/50 p-1 inline-flex rounded-xl mb-6">
          <TabsTrigger value="drivers" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
            {t.drivers}
          </TabsTrigger>
          <TabsTrigger value="workers" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
            {t.workers}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drivers">
          {driverApplicants.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noApplicants}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {driverApplicants.map((applicant) => (
                <ApplicantCard key={applicant.id} applicant={applicant} type="drivers" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="workers">
          {workerApplicants.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noApplicants}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {workerApplicants.map((applicant) => (
                <ApplicantCard key={applicant.id} applicant={applicant} type="workers" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Interview Modal */}
      <Dialog open={showInterviewModal} onOpenChange={setShowInterviewModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {t.setInterview}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">{t.interviewDate}</label>
              <Input 
                type="datetime-local" 
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">{t.interviewLocation}</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="e.g. MoveLine Head Office" 
                  value={interviewLocation}
                  onChange={(e) => setInterviewLocation(e.target.value)}
                  className="pl-10 focus:ring-primary"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowInterviewModal(false)}>{t.cancel}</Button>
            <Button 
              className="bg-primary text-white hover:bg-primary/90"
              onClick={handleScheduleInterview} 
              disabled={!interviewDate || !interviewLocation}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {t.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicantsPage;
