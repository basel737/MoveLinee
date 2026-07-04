import React, { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext1';
import { adminApi } from '@/lib/adminApi';
import { AdminOrderRating, AdminOrderRatingItem, AdminOrderRatingsResponse } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, MessageSquare, Star, TrendingUp, Users } from 'lucide-react';
import { format } from 'date-fns';

const pickString = (source: Record<string, unknown> | undefined, keys: string[]) => {
  for (const key of keys) {
    const value = source?.[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
};

const pickNumber = (source: Record<string, unknown> | undefined, keys: string[]) => {
  for (const key of keys) {
    const value = source?.[key];
    if (value === null || value === undefined || value === '') {
      continue;
    }
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
  }
  return 0;
};

const normalizeOrderRating = (item: Record<string, unknown>): AdminOrderRating => {
  const rawRatings = Array.isArray(item.ratings) ? item.ratings : [];

  const normalizedRatings: AdminOrderRatingItem[] = rawRatings.map((rating) => {
    const ratingData = rating as Record<string, unknown>;

    return {
      id: ratingData.id,
      ratedUserName: pickString(ratingData, ['rated_user_name', 'ratedUserName', 'user_name', 'userName']),
      ratedUserEmail: pickString(ratingData, ['rated_user_email', 'ratedUserEmail', 'user_email', 'userEmail']),
      ratedUserRole: pickString(ratingData, ['rated_user_role', 'ratedUserRole', 'user_role', 'userRole']),
      targetRole: pickString(ratingData, ['target_role', 'targetRole', 'role']),
      score: pickNumber(ratingData, ['score', 'rating', 'value']),
      createdAt: pickString(ratingData, ['created_at', 'createdAt']),
      updatedAt: pickString(ratingData, ['updated_at', 'updatedAt']),
    };
  });

  return {
    id: item.order,
    orderId: pickNumber(item, ['order']),
    orderStatus: pickString(item, ['order_status', 'orderStatus']),
    customerName: '',
    customerEmail: '',
    customerRole: '',
    feedback: pickString(item, ['feedback']),
    feedbackCreatedAt: pickString(item, ['feedback_created_at', 'feedbackCreatedAt']),
    feedbackUpdatedAt: pickString(item, ['feedback_updated_at', 'feedbackUpdatedAt']),
    ratings: normalizedRatings,
  };
};

export const AdminRatings: React.FC = () => {
  const { language } = useLanguage();
  const [orders, setOrders] = useState<AdminOrderRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<AdminOrderRatingsResponse>({
    count: 0,
    next: null,
    previous: null,
    results: [],
  });

  const translations = {
    en: {
      title: 'Ratings & Reports',
      subtitle: 'Review backend feedback and ratings for each order',
      totalOrders: 'Orders with feedback',
      totalRatings: 'Total Ratings',
      averageScore: 'Average Score',
      noResults: 'No rating records were returned by the backend.',
      retry: 'Retry',
      orderDetails: 'Order Details',
      feedback: 'Feedback',
      noFeedback: 'No feedback provided',
      ratings: 'Ratings',
      noRatings: 'No ratings available for this order.',
      orderId: 'Order ID',
      orderStatus: 'Order Status',
      customerName: 'Customer Name',
      customerEmail: 'Customer Email',
      customerRole: 'Customer Role',
      createdAt: 'Created',
      updatedAt: 'Last Updated',
      ratedUserName: 'Rated User Name',
      ratedUserEmail: 'Rated User Email',
      ratedUserRole: 'Rated User Role',
      targetRole: 'Target Role',
      score: 'Score',
      previousPage: 'Previous',
      nextPage: 'Next',
      loading: 'Loading feedback and ratings...',
      errorTitle: 'Unable to load ratings',
      emptyState: 'No results available yet.',
    },
    ar: {
      title: 'التقييمات والتقارير',
      subtitle: 'عرض التعليقات والتقييمات القادمة من الـ Backend لكل طلب',
      totalOrders: 'الطلبات ذات التعليقات',
      totalRatings: 'إجمالي التقييمات',
      averageScore: 'متوسط الدرجة',
      noResults: 'لم يرجع أي سجل تقييمات من الـ Backend.',
      retry: 'إعادة المحاولة',
      orderDetails: 'تفاصيل الطلب',
      feedback: 'التعليقات',
      noFeedback: 'لا توجد ملاحظات',
      ratings: 'التقييمات',
      noRatings: 'لا توجد تقييمات لهذا الطلب.',
      orderId: 'رقم الطلب',
      orderStatus: 'حالة الطلب',
      customerName: 'اسم العميل',
      customerEmail: 'بريد العميل',
      customerRole: 'دور العميل',
      createdAt: 'تاريخ الإنشاء',
      updatedAt: 'آخر تحديث',
      ratedUserName: 'اسم المستخدم الذي تم تقييمه',
      ratedUserEmail: 'بريد المستخدم الذي تم تقييمه',
      ratedUserRole: 'دور المستخدم الذي تم تقييمه',
      targetRole: 'الدور الهدف',
      score: 'الدرجة',
      previousPage: 'السابق',
      nextPage: 'التالي',
      loading: 'جارٍ تحميل التعليقات والتقييمات...',
      errorTitle: 'تعذر تحميل التقييمات',
      emptyState: 'لا توجد نتائج متاحة حاليًا.',
    },
  };

  const t = translations[language];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminApi.getAdminOrderRatings(page);
        const mappedOrders = Array.isArray(response.results)
          ? response.results.map((item) => normalizeOrderRating(item as Record<string, unknown>))
          : [];
        setOrders(mappedOrders);
        setPagination(response);
      } catch (err) {
        console.error('Failed to fetch admin order ratings:', err);
        setError(err instanceof Error ? err.message : 'Unable to load ratings');
        setOrders([]);
        setPagination({ count: 0, next: null, previous: null, results: [] });
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [page]);

  const allRatings = useMemo(
    () => orders.flatMap((order) => order.ratings ?? []),
    [orders]
  );

  const averageScore = useMemo(() => {
    if (allRatings.length === 0) {
      return '0.0';
    }
    const total = allRatings.reduce((sum, rating) => sum + Number(rating.score ?? 0), 0);
    return (total / allRatings.length).toFixed(1);
  }, [allRatings]);

  const formatDateTime = (value?: string | null) => {
    if (!value) {
      return '—';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return '—';
    }

    return format(parsed, 'MMM d, yyyy • h:mm a');
  };

  const renderStars = (score: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= score ? 'fill-warning text-warning' : 'text-muted-foreground'}`}
        />
      ))}
    </div>
  );

  const renderOrderCard = (order: AdminOrderRating) => {
    const feedbackText = (order.feedback ?? '').toString().trim();
    const ratings = order.ratings ?? [];

    return (
      <Card key={order.id ?? `${order.orderId}`} className="shadow-card">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-lg">{t.orderId}: #{order.orderId ?? order.id ?? 'N/A'}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {order.customerName || 'Customer details unavailable'} • {order.customerEmail || 'No email provided'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{order.orderStatus || 'Unknown status'}</Badge>
              <Badge>{order.customerRole || 'Customer'}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border bg-background/60 p-4">
              <h4 className="mb-3 font-semibold">{t.orderDetails}</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{t.orderId}</dt>
                  <dd className="font-medium">#{order.orderId ?? order.id ?? 'N/A'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{t.orderStatus}</dt>
                  <dd className="font-medium">{order.orderStatus || 'Unknown'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{t.customerName}</dt>
                  <dd className="font-medium">{order.customerName || 'Unknown'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{t.customerEmail}</dt>
                  <dd className="font-medium">{order.customerEmail || '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{t.customerRole}</dt>
                  <dd className="font-medium">{order.customerRole || 'Customer'}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border bg-background/60 p-4">
              <h4 className="mb-3 font-semibold">{t.feedback}</h4>
              <p className="text-sm text-muted-foreground">
                {feedbackText || t.noFeedback}
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{t.createdAt}</span>
                  <span>{formatDateTime(order.feedbackCreatedAt)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{t.updatedAt}</span>
                  <span>{formatDateTime(order.feedbackUpdatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-background/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-semibold">{t.ratings}</h4>
              <Badge variant="outline">{ratings.length} {t.ratings.toLowerCase()}</Badge>
            </div>

            {ratings.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.noRatings}</p>
            ) : (
              <div className="space-y-3">
                {ratings.map((rating, index) => (
                  <div key={rating.id ?? `${order.orderId ?? order.id}-${index}`} className="rounded-lg border bg-background p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{rating.ratedUserName || 'Unknown user'}</p>
                          <Badge variant="outline">{rating.targetRole || 'Unknown role'}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rating.ratedUserEmail || '—'}</p>
                      </div>
                      <div className="flex items-center gap-2 rounded-full bg-warning/10 px-3 py-1">
                        {renderStars(Number(rating.score ?? 0))}
                        <span className="text-sm font-semibold">{Number(rating.score ?? 0).toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">{t.ratedUserRole}</span>
                        <span>{rating.ratedUserRole || '—'}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">{t.targetRole}</span>
                        <span>{rating.targetRole || '—'}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">{t.createdAt}</span>
                        <span>{formatDateTime(rating.createdAt)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">{t.updatedAt}</span>
                        <span>{formatDateTime(rating.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </div>
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed bg-background/50">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span>{t.loading}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
        <p className="mt-1 text-muted-foreground">{t.subtitle}</p>
      </div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
              <div>
                <p className="font-semibold">{t.errorTitle}</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setPage(1)}>
              {t.retry}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.totalOrders}</p>
              <p className="text-3xl font-bold text-foreground">{pagination.count}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Star className="h-6 w-6 fill-warning text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.totalRatings}</p>
              <p className="text-3xl font-bold text-foreground">{allRatings.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.averageScore}</p>
              <p className="text-3xl font-bold text-foreground">{averageScore}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {orders.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex min-h-48 items-center justify-center p-8 text-center text-muted-foreground">
            {t.noResults}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map(renderOrderCard)}
        </div>
      )}

      <div className="flex items-center justify-between rounded-lg border bg-background/60 p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{pagination.count} {t.totalOrders.toLowerCase()}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={!pagination.previous} onClick={() => setPage((current) => Math.max(1, current - 1))}>
            {t.previousPage}
          </Button>
          <Button disabled={!pagination.next} onClick={() => setPage((current) => current + 1)}>
            {t.nextPage}
          </Button>
        </div>
      </div>
    </div>
  );
};
