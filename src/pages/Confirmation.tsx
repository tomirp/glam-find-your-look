import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Calendar as CalendarIcon, MapPin, CreditCard } from "lucide-react";

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentData } = location.state || {};
  
  const [status, setStatus] = useState<"waiting" | "success">("waiting");
  
  useEffect(() => {
    // Simulate payment processing
    const timer = setTimeout(() => {
      setStatus("success");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!paymentData) {
    navigate("/");
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPaymentMethodName = (method: string) => {
    const methods: { [key: string]: string } = {
      credit_card: "Kartu Kredit/Debit",
      bank_transfer: "Transfer Bank",
      e_wallet: "E-Wallet",
      qris: "QRIS"
    };
    return methods[method] || method;
  };

  if (status === "waiting") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          
          <div>
            <h1 className="text-2xl font-bold text-foreground font-heading mb-2">
              Memproses Pembayaran
            </h1>
            <p className="text-muted-foreground">
              Mohon tunggu sebentar, kami sedang memverifikasi pembayaran Anda...
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-primary">
            <Clock className="w-5 h-5" />
            <span className="text-sm">Menunggu Pembayaran</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground font-heading mb-2">
            Pembayaran Berhasil!
          </h1>
          <p className="text-muted-foreground">
            Terima kasih! Booking Anda telah dikonfirmasi
          </p>
        </div>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Detail Pesanan</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Terkonfirmasi
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono font-medium">{paymentData.orderId}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">MUA</span>
              <span className="font-medium">{paymentData.muaName}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Layanan</span>
              <span className="font-medium">{paymentData.service}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Tanggal & Waktu</span>
              <div className="flex items-center space-x-1">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">
                  {new Date(paymentData.date).toLocaleDateString('id-ID')} - {paymentData.time}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Lokasi</span>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{paymentData.muaLocation}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Rincian Pembayaran</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metode Pembayaran</span>
              <span className="font-medium">{getPaymentMethodName(paymentData.paymentMethod)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal Layanan</span>
              <span>{formatCurrency(paymentData.total - paymentData.transportPrice)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Biaya Transportasi</span>
              <span>{formatCurrency(paymentData.transportPrice)}</span>
            </div>
            
            <hr className="border-border" />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total Dibayar</span>
              <span className="text-primary">{formatCurrency(paymentData.total)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Waktu Pembayaran</span>
              <span className="text-sm">
                {new Date(paymentData.timestamp).toLocaleString('id-ID')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Langkah Selanjutnya</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p>MUA akan menghubungi Anda untuk konfirmasi jadwal dalam 1x24 jam</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p>Detail kontak MUA akan dikirim via email dan notifikasi in-app</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p>Anda dapat mengubah atau membatalkan booking hingga 24 jam sebelum jadwal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={() => navigate("/")}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            Kembali ke Beranda
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.print()}
            className="w-full"
          >
            Cetak Receipt
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;