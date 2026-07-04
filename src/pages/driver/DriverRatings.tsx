import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext1';
import { driverApi, Driver, DriverRating } from '@/lib/driverApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, MessageSquare, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const DriverRatings: React.FC = () => {
  const { language } = useLanguage();
  const [ratings, setRatings] = useState<DriverRating[]>([]);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const translations = {
    ar: {
      myRatings: 'تقييماتي',
      averageRating: 'متوسط التقييم',
      totalRatings: 'إجمالي التقييمات',
      recentRatings: 'التقييمات الأخيرة',
      ratingsDistribution: 'توزيع التقييمات',
      noRatings: 'لا توجد تقييمات بعد',
      order: 'طلب',
      stars: 'نجوم',
    },
    en: {
      myRatings: 'My Ratings',
      averageRating: 'Average Rating',
      totalRatings: 'Total Ratings',
      recentRatings: 'Recent Ratings',
      ratingsDistribution: 'Ratings Distribution',
      noRatings: 'No ratings yet',
      order: 'Order',
      stars: 'stars',
    },
  };

  const t = translations[language];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ratingsRes, driverRes, statsRes] = await Promise.all([
          driverApi.getDriverRatings(),
          driverApi.getCurrentDriver(),
          driverApi.getDriverStats(),
        ]);
        setRatings(ratingsRes.data);
        setDriver(driverRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Error fetching ratings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const ratingsData = stats
    ? Object.entries(stats.ratingsBreakdown)
        .map(([stars, count]) => ({
          stars: `${stars}★`,
          count,
        }))
        .reverse()
    : [];

  const renderStars = (score: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= score
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">
        {t.myRatings}
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-200 dark:border-amber-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.averageRating}</p>
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-4xl font-bold text-foreground">
                    {driver?.averageRating.toFixed(1)}
                  </p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= Math.round(driver?.averageRating || 0)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <Star className="w-7 h-7 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.totalRatings}</p>
                <p className="text-4xl font-bold text-foreground mt-2">
                  {ratings.length}
                </p>
              </div>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ratings Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {t.ratingsDistribution}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="stars" type="category" className="text-xs" width={50} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Ratings */}
      <Card>
        <CardHeader>
          <CardTitle>{t.recentRatings}</CardTitle>
        </CardHeader>
        <CardContent>
          {ratings.length === 0 ? (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noRatings}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div
                  key={rating.id}
                  className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {renderStars(rating.score)}
                        <span className="text-sm text-muted-foreground">
                          {t.order} #{rating.orderId}
                        </span>
                      </div>
                      {rating.comment && (
                        <p className="text-foreground">{rating.comment}</p>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(rating.createdAt), 'PP', {
                        locale: language === 'ar' ? ar : enUS,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
