// src/pages/Payment.tsx

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, LoaderCircle, ShieldCheck, Tag, Wallet, Landmark } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

// Helper
const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

// Tipe Data
type PaymentMethod = 'va-bca' | 'va-bri' | 'va-bni' | 'gopay' | 'qris';
interface PaymentOption {
  id: PaymentMethod;
  name: string;
  type: 'Virtual Account' | 'E-Wallet';
  icon: JSX.Element;
}

// Opsi Pembayaran
const paymentOptions: PaymentOption[] = [
  { id: 'va-bca', name: 'BCA Virtual Account', type: 'Virtual Account', icon: <Landmark className="h-6 w-6 text-blue-600" /> },
  { id: 'va-bri', name: 'BRI Virtual Account', type: 'Virtual Account', icon: <Landmark className="h-6 w-6 text-blue-800" /> },
  { id: 'va-bni', name: 'BNI Virtual Account', type: 'Virtual Account', icon: <Landmark className="h-6 w-6 text-orange-600" /> },
  { id: 'gopay', name: 'GoPay', type: 'E-Wallet', icon: <Wallet className="h-6 w-6 text-blue-500" /> },
  { id: 'qris', name: 'QRIS', type: 'E-Wallet', icon: <Wallet className="h-6 w-6 text-sky-600" /> },
];

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { bookingId } = location.state || {};
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | undefined>();

  useEffect(() => {
    if (!bookingId) {
      toast({ title: "Error", description: "Booking tidak valid.", variant: "destructive" });
      navigate('/');
      return;
    }

    const fetchBookingDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`*, services(name), mua_profiles(business_name)`)
          .eq('id', bookingId)
          .single();

        if (error || !data) throw error || new Error("Booking tidak ditemukan.");
        
        setBookingDetails(data);
      } catch (error) {
        toast({ title: "Error", description: "Gagal memuat detail booking.", variant: "destructive" });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchBookingDetails();
  }, [bookingId, navigate, toast]);

  const handlePayment = async () => {
    if (!selectedMethod || !bookingDetails) return;

    setIsProcessing(true);
    toast({ description: "Memproses pembayaran Anda..." });
    
    try {
      const { data: paymentData, error } = await supabase
        .from('payments')
        .insert({
          booking_id: bookingDetails.id,
          customer_id: bookingDetails.customer_id,
          amount: bookingDetails.total_price,
          payment_method: selectedMethod,
          payment_status: 'pending', 
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({ title: "Berhasil!", description: "Pembayaran sedang diproses." });
      navigate(`/waiting-for-payment/${paymentData.id}`);

    } catch (error: any) {
      toast({ title: "Pembayaran Gagal", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat detail pembayaran...</div>;
  }
  if (!bookingDetails) {
    return null;
  }

  const virtualAccounts = paymentOptions.filter(p => p.type === 'Virtual Account');
  const eWallets = paymentOptions.filter(p => p.type === 'E-Wallet');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold font-heading">Pembayaran</h1>
              <p className="text-sm text-muted-foreground">Selesaikan pesanan Anda dalam satu langkah lagi.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5 text-primary" />Virtual Account</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}>
                  <div className="space-y-4">
                    {virtualAccounts.map(method => (
                      <Label key={method.id} htmlFor={method.id} className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${selectedMethod === method.id ? 'border-primary ring-2 ring-primary' : 'hover:bg-accent/50'}`}>
                        <div className="flex items-center gap-4">
                          {method.icon}
                          <span className="font-semibold">{method.name}</span>
                        </div>
                        <RadioGroupItem value={method.id} id={method.id} />
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5 text-primary" />E-Wallet & QRIS</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}>
                  <div className="space-y-4">
                    {eWallets.map(method => (
                      <Label key={method.id} htmlFor={method.id} className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${selectedMethod === method.id ? 'border-primary ring-2 ring-primary' : 'hover:bg-accent/50'}`}>
                        <div className="flex items-center gap-4">
                          {method.icon}
                          <span className="font-semibold">{method.name}</span>
                        </div>
                        <RadioGroupItem value={method.id} id={method.id} />
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
                <CardDescription>Periksa kembali detail pesanan Anda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">MUA</span>
                  <span className="font-semibold">{bookingDetails.mua_profiles.business_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Layanan</span>
                  <span className="font-semibold">{bookingDetails.services.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Jadwal</span>
                  {/* --- PERBAIKAN UTAMA DI SINI --- */}
                  <span className="font-semibold text-right">
                    {`${format(new Date(bookingDetails.booking_date), 'd MMM yyyy')}, ${bookingDetails.booking_time}`}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Harga Layanan</span>
                  <span className="font-semibold">{formatCurrency(bookingDetails.total_price - (bookingDetails.platform_fee || 0))}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Tag className="h-4 w-4" /> Biaya Platform
                  </span>
                  <span className="font-semibold">{formatCurrency(bookingDetails.platform_fee || 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold">Total Pembayaran</span>
                  <span className="font-extrabold text-primary">{formatCurrency(bookingDetails.total_price)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex-col space-y-4">
                <Button 
                  size="lg" 
                  className="w-full h-12" 
                  onClick={handlePayment} 
                  disabled={!selectedMethod || isProcessing}
                >
                  {isProcessing ? <LoaderCircle className="animate-spin h-5 w-5 mr-2" /> : <ShieldCheck className="h-5 w-5 mr-2" />}
                  {isProcessing ? 'Memproses...' : `Bayar dengan ${selectedMethod ? paymentOptions.find(p=>p.id === selectedMethod)?.name : '...'}`}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Dengan melanjutkan, Anda setuju dengan Syarat & Ketentuan kami.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;