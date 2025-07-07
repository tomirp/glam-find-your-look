import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Building2, Wallet, QrCode, AlertTriangle } from "lucide-react";
import SecureInput from "@/components/SecureInput";
import { useRateLimiter } from "@/hooks/useRateLimiter";
import { validateCreditCard, validateCVV, validateExpiryDate, sanitizeInput } from "@/utils/paymentSecurity";
import { useToast } from "@/hooks/use-toast";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderData } = location.state || {};
  const { toast } = useToast();
  
  const [selectedPayment, setSelectedPayment] = useState("credit_card");
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Rate limiter for payment attempts
  const paymentRateLimit = useRateLimiter({
    maxAttempts: 3,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000 // 30 minutes block
  });
  
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

  const validatePaymentForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (selectedPayment === "credit_card") {
      // Validate card number
      const cardValidation = validateCreditCard(cardData.cardNumber.replace(/\s/g, ''));
      if (!cardValidation.isValid) {
        newErrors.cardNumber = "Nomor kartu tidak valid";
      }

      // Validate expiry date
      if (!validateExpiryDate(cardData.expiryDate.replace('/', ''))) {
        newErrors.expiryDate = "Tanggal kadaluarsa tidak valid";
      }

      // Validate CVV
      if (!validateCVV(cardData.cvv, cardValidation.cardType)) {
        newErrors.cvv = "CVV tidak valid";
      }

      // Validate cardholder name
      const sanitizedName = sanitizeInput(cardData.cardholderName);
      if (!sanitizedName || sanitizedName.length < 2) {
        newErrors.cardholderName = "Nama pemegang kartu harus diisi";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    // Check rate limit
    const rateLimitCheck = paymentRateLimit.checkRateLimit();
    if (!rateLimitCheck.allowed) {
      const resetTime = rateLimitCheck.resetTime ? new Date(rateLimitCheck.resetTime) : null;
      toast({
        title: "Terlalu Banyak Percobaan",
        description: `Silakan coba lagi ${resetTime ? `pada ${resetTime.toLocaleTimeString()}` : 'nanti'}`,
        variant: "destructive"
      });
      return;
    }

    // Validate form
    if (!validatePaymentForm()) {
      paymentRateLimit.recordAttempt();
      return;
    }

    setIsProcessing(true);

    try {
      // Record the attempt
      paymentRateLimit.recordAttempt();

      // In a real implementation, you would integrate with a secure payment gateway
      // For now, we'll simulate the payment process
      await new Promise(resolve => setTimeout(resolve, 2000));

      const paymentData = {
        ...orderData,
        paymentMethod: selectedPayment,
        orderId: `GF-${Date.now()}`,
        timestamp: new Date().toISOString(),
        // Never store actual card details - this would go to payment processor
        cardLastFour: selectedPayment === "credit_card" ? 
          cardData.cardNumber.replace(/\s/g, '').slice(-4) : null
      };
      
      navigate("/confirmation", { state: { paymentData } });
    } catch (error) {
      toast({
        title: "Pembayaran Gagal",
        description: "Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
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

        {/* Security Notice */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Keamanan Pembayaran</p>
                <p>Semua informasi pembayaran Anda dienkripsi dan dilindungi dengan teknologi keamanan terdepan.</p>
              </div>
            </div>
          </CardContent>
        </Card>

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

        {/* Secure Payment Details Form */}
        {selectedPayment === "credit_card" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Detail Kartu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nomor Kartu *</label>
                <SecureInput
                  type="card"
                  value={cardData.cardNumber}
                  onChange={(value) => setCardData(prev => ({ ...prev, cardNumber: value }))}
                  placeholder="1234 5678 9012 3456"
                  error={errors.cardNumber}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bulan/Tahun *</label>
                  <SecureInput
                    type="expiry"
                    value={cardData.expiryDate}
                    onChange={(value) => setCardData(prev => ({ ...prev, expiryDate: value }))}
                    placeholder="MM/YY"
                    error={errors.expiryDate}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CVV *</label>
                  <SecureInput
                    type="cvv"
                    value={cardData.cvv}
                    onChange={(value) => setCardData(prev => ({ ...prev, cvv: value }))}
                    placeholder="123"
                    error={errors.cvv}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Nama Pemegang Kartu *</label>
                <SecureInput
                  type="text"
                  value={cardData.cardholderName}
                  onChange={(value) => setCardData(prev => ({ ...prev, cardholderName: value }))}
                  placeholder="John Doe"
                  error={errors.cardholderName}
                  required
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
          disabled={isProcessing || paymentRateLimit.isBlocked}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          size="lg"
        >
          {isProcessing ? "Memproses..." : `Bayar ${formatCurrency(orderData.total)}`}
        </Button>
      </div>
    </div>
  );
};

export default Payment;
