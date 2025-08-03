// src/pages/WaitingForPayment.tsx

import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LoaderCircle, CheckCircle, Copy, ArrowLeft } from 'lucide-react';

const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

const WaitingForPayment = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!paymentId) {
      toast({ title: "Error", description: "ID Pembayaran tidak valid.", variant: "destructive" });
      navigate('/');
      return;
    }

    const fetchPaymentDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*, bookings(*, services(name), mua_profiles(business_name))')
          .eq('id', paymentId)
          .single();

        if (error || !data) throw error || new Error("Detail pembayaran tidak ditemukan.");
        
        setPaymentDetails(data);

        // PERBAIKAN: Cek status dari booking, bukan payment
        // Jika booking sudah diterima (accepted) atau selesai, artinya pembayaran sudah dikonfirmasi.
        if (data.bookings && (data.bookings.status === 'accepted' || data.bookings.status === 'completed')) {
            toast({ title: "Info", description: "Pembayaran untuk pesanan ini sudah selesai." });
            navigate('/confirmation', { state: { bookingId: data.booking_id } });
        }

      } catch (error) {
        console.error("Fetch payment error:", error);
        toast({ title: "Error", description: "Gagal memuat detail pembayaran.", variant: "destructive" });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentId, navigate, toast]);
  
  const handlePaymentConfirmation = async () => {
    if (!paymentDetails) return;
    setIsProcessing(true);
    toast({ description: "Mengonfirmasi pembayaran Anda..." });

    try {
        const { data, error } = await supabase
            .rpc('confirm_payment', {
                p_payment_id: paymentDetails.id
            });

        if (error) throw error;

        toast({ title: "Pembayaran Berhasil!", description: "Anda akan diarahkan ke halaman invoice." });
        
        navigate('/confirmation', { state: { bookingId: paymentDetails.booking_id }, replace: true });

    } catch (error: any) {
        console.error("Confirmation Error:", error);
        toast({ 
            title: "Konfirmasi Gagal", 
            description: error.message.includes('already confirmed') ? 'Pembayaran sudah dikonfirmasi sebelumnya.' : error.message, 
            variant: "destructive" 
        });
    } finally {
        setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Berhasil!", description: "Nomor Virtual Account disalin." });
  };
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat instruksi pembayaran...</div>;
  }

  if (!paymentDetails || !paymentDetails.bookings) {
    return null;
  }
  
  const { bookings: orderData, amount, payment_method } = paymentDetails;
  const paymentMethodName = payment_method.replace('va-', '').toUpperCase();
  const virtualAccountNumber = '8808' + orderData.customer_id.substring(0, 10);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
         <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 flex items-center space-x-2 text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Beranda</span>
        </Button>
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-orange-100 h-12 w-12 flex items-center justify-center rounded-full mb-4">
              <LoaderCircle className="h-6 w-6 text-orange-500 animate-spin" />
            </div>
            <CardTitle>Menunggu Pembayaran</CardTitle>
            <CardDescription>Selesaikan pembayaran Anda sebelum batas waktu.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground">Total Pembayaran</p>
              <p className="text-3xl font-bold font-heading text-primary">{formatCurrency(amount)}</p>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Metode</span>
                <span className="font-semibold">{paymentMethodName} Virtual Account</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Nomor VA</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">{virtualAccountNumber}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(virtualAccountNumber)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg text-sm text-yellow-800">
                <p>Silakan transfer ke nomor Virtual Account di atas melalui ATM, M-Banking, atau Internet Banking sebelum pembayaran kedaluwarsa.</p>
            </div>
          </CardContent>
          <CardFooter className="p-6">
            <Button size="lg" className="w-full h-12" onClick={handlePaymentConfirmation} disabled={isProcessing}>
                {isProcessing ? <LoaderCircle className="animate-spin h-5 w-5 mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}
                {isProcessing ? "Memproses..." : "Saya Sudah Bayar"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default WaitingForPayment;