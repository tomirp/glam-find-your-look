// src/pages/LeaveReview.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label'; // PERBAIKAN: Impor Label di sini

interface BookingDetails {
  id: string;
  mua_profile_id: string;
  customer_id: string;
  mua_profiles: {
    business_name: string;
    profiles: { // Perbaikan struktur agar cocok
        avatar_url: string;
    }
  };
}

const LeaveReview = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId || !user) {
        navigate('/');
        return;
      }

      const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
      if (!profile) return;

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, mua_profile_id, customer_id,
          mua_profiles ( business_name, profiles (avatar_url) )
        `)
        .eq('id', bookingId)
        .eq('customer_id', profile.id)
        .eq('status', 'completed')
        .single();

      if (error || !data) {
        toast.error("Pesanan tidak valid untuk diberi ulasan.");
        navigate('/aktivitas');
      } else {
        setBooking(data as BookingDetails);
      }
      setLoading(false);
    };
    fetchBookingDetails();
  }, [bookingId, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Rating Bintang Wajib Diisi", { description: "Silakan pilih setidaknya satu bintang."});
      return;
    }
    if (!booking) return;

    setIsSubmitting(true);
    const { error } = await supabase.from('reviews').insert({
      booking_id: booking.id,
      mua_profile_id: booking.mua_profile_id,
      customer_id: booking.customer_id,
      rating: rating,
      review_text: reviewText,
    });

    if (error) {
      toast.error("Gagal Mengirim Ulasan", { description: error.message });
      setIsSubmitting(false);
    } else {
      toast.success("Terima Kasih Telah Memberikan Ulasan", {
        description: "Ulasan Anda sangat berarti bagi kami. Anda akan diarahkan...",
        duration: 3000,
        onAutoClose: () => {
          navigate('/customer/profile', { state: { defaultTab: 'ulasan' } });
        }
      });
    }
    // Tidak perlu setIsSubmitting(false) di sini karena sudah pindah halaman
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat halaman ulasan...</div>;
  }
  
  if (!booking) {
    // Return null atau komponen lain saat redirect
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/aktivitas')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Aktivitas
        </Button>
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Berikan Ulasan Anda</CardTitle>
            <CardDescription>Bagaimana pengalaman Anda dengan MUA ini?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 mb-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={booking.mua_profiles.profiles?.avatar_url} />
                <AvatarFallback>{booking.mua_profiles.business_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="font-semibold text-lg">{booking.mua_profiles.business_name}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center space-y-2">
                <Label className="font-semibold">Rating Anda</Label>
                <div className="flex items-center">
                  {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                      <button
                        key={ratingValue}
                        type="button"
                        onClick={() => setRating(ratingValue)}
                        className="p-1"
                      >
                        <Star className={`h-8 w-8 transition-colors ${ratingValue <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reviewText" className="font-semibold">Tulis Ulasan (Opsional)</Label>
                <Textarea
                  id="reviewText"
                  placeholder="Ceritakan pengalaman Anda di sini..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={5}
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaveReview;