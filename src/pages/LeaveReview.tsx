// src/pages/LeaveReview.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star, LoaderCircle } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label'; // <-- PERBAIKAN: Impor Label

// Tipe data yang disesuaikan dengan query yang benar
interface BookingData {
  id: string;
  customer_id: string;
  mua_profiles: {
    id: string; // <-- ID dari mua_profiles
    business_name: string;
    profiles: { // Data dari tabel profiles yang terhubung
      avatar_url: string;
    } | null;
  } | null;
  services: {
    name: string;
  } | null;
}

const LeaveReview = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!bookingId || !profile) return;

    const fetchBookingData = async () => {
      setLoading(true);
      try {
        // --- PERBAIKAN: Query Supabase yang lebih akurat ---
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id,
            customer_id,
            mua_profiles (
              id,
              business_name,
              profiles ( avatar_url )
            ),
            services ( name )
          `)
          .eq('id', bookingId)
          .single();
        // ---------------------------------------------------

        if (error || !data) {
          throw new Error('Pesanan tidak ditemukan.');
        }

        if (data.customer_id !== profile.id) {
          toast({
            title: "Akses Ditolak",
            description: "Anda tidak memiliki izin untuk memberikan ulasan untuk pesanan ini.",
            variant: "destructive",
          });
          navigate('/aktivitas');
          return;
        }
        
        // Periksa apakah data relasi ada
        if (!data.mua_profiles || !data.services) {
          throw new Error('Data MUA atau layanan tidak lengkap.');
        }

        setBookingData(data as BookingData);

      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        navigate('/aktivitas');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [bookingId, profile, navigate, toast]);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast({ title: "Rating Kosong", description: "Harap berikan minimal 1 bintang.", variant: "destructive" });
      return;
    }
    if (!bookingData || !profile || !bookingData.mua_profiles) return;

    setIsSubmitting(true);
    try {
      // --- PERBAIKAN: Menggunakan ID yang benar ---
      const { error } = await supabase.from('reviews').insert({
        booking_id: bookingData.id,
        mua_profile_id: bookingData.mua_profiles.id, // ID dari mua_profiles
        customer_id: profile.id,
        rating,
        comment,
      });
      // -------------------------------------------

      if (error) throw error;

      toast({ title: "Ulasan Terkirim!", description: "Terima kasih atas ulasan Anda." });
      navigate('/aktivitas');

    } catch (error: any) {
      toast({ title: "Gagal Mengirim Ulasan", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !bookingData) {
    return <div className="min-h-screen flex items-center justify-center"><LoaderCircle className="animate-spin" /></div>;
  }

  const muaProfile = bookingData.mua_profiles;
  const service = bookingData.services;

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={muaProfile?.profiles?.avatar_url} />
              <AvatarFallback>{muaProfile?.business_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardDescription>Berikan ulasan Anda untuk</CardDescription>
              <CardTitle className="text-2xl font-heading">{muaProfile?.business_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{service?.name}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 text-center">
            <Label className="text-lg font-semibold">Rating Anda</Label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-10 w-10 cursor-pointer transition-colors ${
                    rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-lg font-semibold">Komentar (Opsional)</Label>
            <Textarea
              id="comment"
              placeholder="Bagikan pengalaman Anda..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
            />
          </div>
          <Button onClick={handleSubmitReview} disabled={isSubmitting} className="w-full">
            {isSubmitting ? <LoaderCircle className="animate-spin mr-2" /> : null}
            Kirim Ulasan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveReview;