// src/components/MUAProfile/ReviewsTab.tsx

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Tipe data untuk ulasan yang akan ditampilkan
interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  profiles: { // Data dari pelanggan yang memberikan ulasan
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ReviewsTabProps {
  muaProfileId: string | null;
}

const ReviewsTab = ({ muaProfileId }: ReviewsTabProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!muaProfileId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          review_text,
          created_at,
          profiles ( full_name, avatar_url )
        `)
        .eq('mua_profile_id', muaProfileId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
      } else {
        setReviews(data as Review[]);
      }
      setLoading(false);
    };

    fetchReviews();
  }, [muaProfileId]);

  const ReviewCard = ({ review }: { review: Review }) => (
    <div className="flex gap-4 p-4 border-b last:border-b-0">
      <Avatar>
        <AvatarImage src={review.profiles?.avatar_url || ''} />
        <AvatarFallback>{review.profiles?.full_name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">{review.profiles?.full_name || 'Pelanggan'}</h4>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date(review.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        {review.review_text && (
          <p className="text-sm mt-2 text-foreground/80 italic">"{review.review_text}"</p>
        )}
      </div>
    </div>
  );

  const ReviewSkeleton = () => (
    <div className="flex gap-4 p-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-8 w-full mt-2" />
        </div>
    </div>
  )

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Ulasan & Rating dari Pelanggan</CardTitle>
        <CardDescription>Lihat apa kata mereka tentang layanan Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => <ReviewSkeleton key={i} />)}
            </div>
        ) : reviews.length > 0 ? (
          <div className="divide-y">
            {reviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Belum Ada Ulasan</p>
            <p className="text-sm mt-1">Anda akan melihat ulasan di sini setelah pelanggan menyelesaikannya.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewsTab;