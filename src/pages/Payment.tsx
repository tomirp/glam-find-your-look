import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Building2, Wallet, QrCode } from "lucide-react";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderData } = location.state || {};
  
  const [selectedPayment, setSelectedPayment] = useState("credit_card");
  
  if (!orderData) {
    navigate("/");
    return null;
  }

  const paymentMethods = [
    { 
      id: "credit_card", 
      name: "Kartu Kredit/Debit", 
      icon: CreditCard,
      description: "Visa, Mastercard, JCB"
    },
    { 
      id: "bank_transfer", 
      name: "Transfer Bank", 
      icon: Building2,
      description: "BCA, Mandiri, BRI, BNI"
    },
    { 
      id: "e_wallet", 
      name: "E-Wallet", 
      icon: Wallet,
      description: "OVO, GoPay, Dana, LinkAja"
    },
    { 
      id: "qris", 
      name: "QRIS", 
      icon: QrCode,
      description: "Scan QR Code"
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handlePayment = () => {
    const paymentData = {
      ...orderData,
      paymentMethod: selectedPayment,
      orderId: `GF-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    navigate("/confirmation", { state: { paymentData } });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground font-heading mb-2">
            Pembayaran
          </h1>
          <p className="text-muted-foreground">
            Pilih metode pembayaran yang Anda inginkan
          </p>
        </div>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ringkasan Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">MUA</span>
              <span className="font-medium">{orderData.muaName}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Layanan</span>
              <span className="font-medium">{orderData.service}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal & Waktu</span>
              <span className="font-medium">
                {new Date(orderData.date).toLocaleDateString('id-ID')} - {orderData.time}
              </span>
            </div>
            
            <hr className="border-border" />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total Pembayaran</span>
              <span className="text-primary">{formatCurrency(orderData.total)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Metode Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <div
                  key={method.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedPayment === method.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPayment(method.id)}
                >
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

        {/* Payment Details Form */}
        {selectedPayment === "credit_card" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Detail Kartu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nomor Kartu</label>
                <input 
                  type="text" 
                  placeholder="1234 5678 9012 3456"
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bulan/Tahun</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY"
                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CVV</label>
                  <input 
                    type="text" 
                    placeholder="123"
                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nama Pemegang Kartu</label>
                <input 
                  type="text" 
                  placeholder="John Doe"
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Terms and Conditions */}
        <div className="bg-secondary/20 p-4 rounded-lg mb-6">
          <p className="text-sm text-muted-foreground">
            Dengan melanjutkan pembayaran, Anda menyetujui{" "}
            <span className="text-primary cursor-pointer">Syarat & Ketentuan</span> dan{" "}
            <span className="text-primary cursor-pointer">Kebijakan Privasi</span> GlamFind.
          </p>
        </div>

        {/* Pay Button */}
        <Button 
          onClick={handlePayment}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          size="lg"
        >
          Bayar {formatCurrency(orderData.total)}
        </Button>
      </div>
    </div>
  );
};

export default Payment;