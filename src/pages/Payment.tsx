import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Landmark, QrCode, Wallet } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderData } = location.state || {};
  const { user, loading: authLoading, setLoginRedirect } = useAuth();
  const { toast } = useToast();
  
  const [selectedPayment, setSelectedPayment] = useState("bank_transfer");
  const [loading, setLoading] = useState(false);
  const [showAuthAlert, setShowAuthAlert] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      setLoginRedirect(location);
      setShowAuthAlert(true);
    }
  }, [authLoading, user, setLoginRedirect, location]);
  
  if (!orderData) {
    useEffect(() => { navigate("/"); }, [navigate]);
    return null;
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const handleCreateOrder = async () => {
    if (!user) {
      toast({ title: "Error", description: "Anda harus login untuk membuat pesanan.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const { data: profile, error: profileError } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
      if (profileError || !profile) throw profileError || new Error("Profil customer tidak ditemukan.");

      const { data: booking, error: bookingError } = await supabase.from('bookings').insert({
        customer_id: profile.id,
        mua_profile_id: orderData.muaId,
        service_id: orderData.serviceId,
        booking_date: orderData.date,
        booking_time: orderData.time,
        total_price: orderData.total,
        status: 'pending',
      }).select().single();
      if (bookingError) throw bookingError;

      const { data: payment, error: paymentError } = await supabase.from('payments').insert({
        booking_id: booking.id,
        customer_id: profile.id,
        amount: orderData.total,
        payment_method: selectedPayment,
        payment_status: 'pending',
      }).select().single();
      if (paymentError) throw paymentError;

      navigate(`/waiting-for-payment/${payment.id}`, { state: { orderData, paymentData: payment } });

    } catch (error: any) {
      console.error("Error creating order:", error);
      toast({ title: "Gagal Membuat Pesanan", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  
  const paymentMethods = [
    { id: "bank_transfer", name: "Transfer Bank", icon: Landmark, description: "BCA, Mandiri, BRI, BNI" },
    { id: "virtual_account", name: "Virtual Account", icon: Landmark, description: "BCA VA, Mandiri VA, dll." },
    { id: "credit_card", name: "Kartu Kredit/Debit", icon: CreditCard, description: "Visa, Mastercard, JCB" },
    { id: "qris", name: "QRIS", icon: QrCode, description: "Scan dari semua aplikasi pembayaran" },
    { id: "e_wallet", name: "E-Wallet", icon: Wallet, description: "GoPay, OVO, DANA" },
  ];

  return (
    <>
      <AlertDialog open={showAuthAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda Belum Masuk</AlertDialogTitle>
            <AlertDialogDescription>
              Untuk melanjutkan pembayaran, Anda harus masuk atau mendaftar sebagai pelanggan terlebih dahulu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => navigate('/auth')}>
            Ke Halaman Login
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground font-heading mb-2">Pembayaran</h1>
            <p className="text-muted-foreground">Pilih metode pembayaran yang Anda inginkan</p>
          </div>
          <Card className="mb-6">
            <CardHeader><CardTitle>Ringkasan Pesanan</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-muted-foreground">MUA</span><span className="font-medium">{orderData.muaName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Layanan</span><span className="font-medium">{orderData.service}</span></div>
              <hr className="border-border" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Pembayaran</span>
                <span className="text-primary">{formatCurrency(orderData.total)}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="mb-6">
            <CardHeader><CardTitle>Metode Pembayaran</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <div key={method.id} className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedPayment === method.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`} onClick={() => setSelectedPayment(method.id)}>
                    <div className="flex items-center space-x-3">
                      <Icon className="w-6 h-6 text-primary" />
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <Button onClick={handleCreateOrder} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg" disabled={loading || !user}>
            {loading ? "Memproses..." : `Bayar ${formatCurrency(orderData.total)}`}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Payment;