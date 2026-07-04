import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, Package, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { dashboardApi } from '@/lib/dashboardApi';
import { Rating, DashboardOrder } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext1';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  onRatingChange, 
  readonly = false,
  size = 'md'
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={cn(
            'transition-transform',
            !readonly && 'hover:scale-110 cursor-pointer'
          )}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          onClick={() => onRatingChange?.(star)}
        >
          <Star
            className={cn(
              sizeClasses[size],
              (hoverRating || rating) >= star
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-300'
            )}
          />
        </button>
      ))}
    </div>
  );
};

export const Ratings: React.FC = () => {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get('order');
  
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [completedOrders, setCompletedOrders] = useState<DashboardOrder[]>([]);
  const [unratedOrders, setUnratedOrders] = useState<DashboardOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // New rating form
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [ratingsRes, ordersRes] = await Promise.all([
          dashboardApi.getRatings(),
          dashboardApi.getOrders(),
        ]);
        setRatings(ratingsRes.data);
        
        const completed = ordersRes.data.filter(o => o.status === 'completed');
        setCompletedOrders(completed);
        
        // Find unrated orders
        const ratedOrderIds = new Set(ratingsRes.data.map(r => r.orderId));
        const unrated = completed.filter(o => !ratedOrderIds.has(o.id));
        setUnratedOrders(unrated);

        // Auto-select order from URL
        if (orderIdParam) {
          const order = completed.find(o => o.id.toString() === orderIdParam);
          if (order && !ratedOrderIds.has(order.id)) {
            setSelectedOrderId(order.id.toString());
            setDialogOpen(true);
          }
        }
      } catch (err) {
        setError('Failed to load ratings');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [orderIdParam]);

  const handleSubmitRating = async () => {
    if (!selectedOrderId) return;
    
    setIsSubmitting(true);
    try {
      const response = await dashboardApi.createRating({
        orderId: parseInt(selectedOrderId),
        score: newRating,
        comment: newComment,
      });
      
      toast.success(response.message || 'Rating submitted!');
      setDialogOpen(false);
      
      // Refresh data
      const ratingsRes = await dashboardApi.getRatings();
      setRatings(ratingsRes.data);
      setUnratedOrders(prev => prev.filter(o => o.id.toString() !== selectedOrderId));
      
      // Reset form
      setNewRating(5);
      setNewComment('');
      setSelectedOrderId('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(1)
    : '0';

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
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
          {language === 'ar' ? 'التقييمات' : 'Ratings'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' 
            ? 'قيّم خدماتك وشاهد تقييماتك السابقة'
            : 'Rate your services and view your past ratings'
          }
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'متوسط تقييمك' : 'Your Average Rating'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-3xl font-bold text-foreground">{averageRating}</p>
                  <StarRating rating={parseFloat(averageRating)} readonly size="sm" />
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'إجمالي التقييمات' : 'Total Reviews'}
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">{ratings.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unrated Orders */}
      {unratedOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">
              {language === 'ar' ? 'طلبات تحتاج تقييم' : 'Orders to Rate'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unratedOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20"
                >
                  <div>
                    <p className="font-medium">#{order.id} - {order.serviceType}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.scheduledAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Dialog 
                    open={dialogOpen && selectedOrderId === order.id.toString()} 
                    onOpenChange={(open) => {
                      setDialogOpen(open);
                      if (open) setSelectedOrderId(order.id.toString());
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Star className="w-4 h-4 mr-1" />
                        {language === 'ar' ? 'قيّم الآن' : 'Rate Now'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {language === 'ar' ? 'تقييم الطلب' : 'Rate Order'} #{order.id}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="text-center">
                          <Label className="text-base">
                            {language === 'ar' ? 'كيف كانت الخدمة؟' : 'How was the service?'}
                          </Label>
                          <div className="flex justify-center mt-4">
                            <StarRating
                              rating={newRating}
                              onRatingChange={setNewRating}
                              size="lg"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>
                            {language === 'ar' ? 'تعليقك (اختياري)' : 'Your Comment (optional)'}
                          </Label>
                          <Textarea
                            placeholder={
                              language === 'ar' 
                                ? 'أخبرنا المزيد عن تجربتك...'
                                : 'Tell us more about your experience...'
                            }
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={4}
                          />
                        </div>

                        <Button
                          className="w-full"
                          onClick={handleSubmitRating}
                          disabled={isSubmitting}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {isSubmitting 
                            ? (language === 'ar' ? 'جاري الإرسال...' : 'Submitting...')
                            : (language === 'ar' ? 'إرسال التقييم' : 'Submit Rating')
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

      {/* Past Ratings */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'تقييماتك السابقة' : 'Your Past Ratings'}</CardTitle>
        </CardHeader>
        <CardContent>
          {ratings.length === 0 ? (
            <div className="p-8 text-center">
              <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {language === 'ar' ? 'لا توجد تقييمات بعد' : 'No ratings yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating) => {
                const order = completedOrders.find(o => o.id === rating.orderId);
                return (
                  <div
                    key={rating.id}
                    className="p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">#{rating.orderId}</span>
                          {order && (
                            <span className="text-sm text-muted-foreground">
                              - {order.serviceType}
                            </span>
                          )}
                        </div>
                        <StarRating rating={rating.score} readonly size="sm" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(rating.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    {rating.comment && (
                      <p className="mt-2 text-sm text-muted-foreground italic">
                        "{rating.comment}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
