// src/pages/Checkout.tsx

import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { id as indonesiaLocale } from 'date-fns/locale';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Car, Bike, Tag, ShieldCheck, LoaderCircle, Palette, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

type TransportOption = 'private' | 'online';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { bookingData } = location.state || {};

  const [profileId, setProfileId] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fee dari platform dan transportasi
  const PLATFORM_FEE = 5000;
  const TRANSPORT_FEE = 25000;

  useEffect(() => {
    if (!bookingData) {
      toast({ title: "Sesi Tidak Valid", description: "Data pemesanan tidak ditemukan.", variant: "destructive" });
      navigate('/');
      return;
    }

    const fetchUserProfileId = async () => {
      if (user) {
        setLoadingProfile(true);
        try {
          const { data, error } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
          if (error) throw error;
          if (data) {
            setProfileId(data.id);
          } else {
             toast({ title: "Profil Tidak Ditemukan", description: "Silakan coba login ulang.", variant: "destructive" });
             navigate('/auth');
          }
        } catch (error) {
          toast({ title: "Gagal Memuat Profil", variant: "destructive" });
        } finally {
          setLoadingProfile(false);
        }
      } else {
        setLoadingProfile(false);
      }
    };
    fetchUserProfileId();
  }, [user, bookingData, toast, navigate]);


  if (!bookingData) {
    return <div className="min-h-screen flex items-center justify-center">Mengalihkan...</div>;
  }

  const servicePrice = Number(bookingData.price) || 0;
  const totalPrice = servicePrice + PLATFORM_FEE;

  const handleConfirmAndPay = async () => {
    if (!user || !profileId) {
      toast({ title: "Error", description: "Anda harus login untuk melanjutkan.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    toast({ description: "Membuat pesanan Anda..." });

    try {
      const { data, error } = await supabase
        .rpc('create_new_booking', {
            p_mua_profile_id: bookingData.muaId,
            p_service_id: bookingData.serviceId,
            p_booking_date: new Date(bookingData.date).toISOString().slice(0, 10),
            p_booking_time: bookingData.time,
            p_total_price: totalPrice,
            p_platform_fee: PLATFORM_FEE,
            p_customer_notes: customerNotes
        });

      if (error) {
        console.error("Supabase RPC Error:", error);
        throw new Error(error.message);
      }
      if (!data) {
        throw new Error("Gagal mendapatkan Payment ID setelah pembuatan.");
      }

      toast({ title: "Pesanan Dibuat!", description: "Anda akan diarahkan ke halaman pembayaran." });
      navigate('/waiting-for-payment/' + data, { replace: true });

    } catch (error: any) {
      toast({ title: "Gagal Membuat Pesanan", description: "Terjadi kesalahan. Coba lagi nanti.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
            <div>
              <h1 className="text-xl font-bold font-heading">Checkout</h1>
              <p className="text-sm text-muted-foreground">Satu langkah lagi untuk mengonfirmasi pesanan Anda.</p>
            </div>
          </div>
        </div>
      </header>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16"><AvatarImage src={bookingData.muaAvatar} /><AvatarFallback>{bookingData.muaName.charAt(0)}</AvatarFallback></Avatar>
                <div>
                  <CardTitle>{bookingData.muaName}</CardTitle>
                  <CardDescription>Detail pesanan Anda dengan MUA ini.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-center gap-4 text-sm"><Palette className="h-5 w-5 text-primary" /><span className="font-semibold">{bookingData.serviceName}</span></div>
                <div className="flex items-center gap-4 text-sm"><CalendarIcon className="h-5 w-5 text-primary" /><span className="font-semibold">{format(new Date(bookingData.date), 'EEEE, d MMMM yyyy', { locale: indonesiaLocale })}</span></div>
                <div className="flex items-center gap-4 text-sm"><Clock className="h-5 w-5 text-primary" /><span className="font-semibold">{bookingData.time}</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Catatan untuk MUA (Opsional)</CardTitle>
                <CardDescription>Beri tahu MUA jika ada preferensi atau kondisi khusus.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea id="notes" value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} placeholder="Contoh: Kulit saya sensitif, atau preferensi makeup lainnya..." />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <Card className="shadow-lg">
              <CardHeader> <CardTitle>Ringkasan Biaya</CardTitle> </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Harga Layanan</span><span className="font-semibold">{formatCurrency(servicePrice)}</span></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center gap-1.5"><Tag className="h-4 w-4" /> Biaya Platform</span><span className="font-semibold">{formatCurrency(PLATFORM_FEE)}</span></div>
                <Separator />
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-extrabold text-primary">{formatCurrency(totalPrice)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button size="lg" className="w-full h-12 text-base" onClick={handleConfirmAndPay} disabled={isSubmitting || loadingProfile}>
                  {isSubmitting ? <LoaderCircle className="animate-spin h-5 w-5 mr-2" /> : <ShieldCheck className="h-5 w-5 mr-2" />}
                  {isSubmitting ? 'Memproses...' : 'Konfirmasi dan Bayar'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;