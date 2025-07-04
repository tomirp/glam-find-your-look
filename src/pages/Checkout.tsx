import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Calendar as CalendarIcon, Car, Bike } from "lucide-react";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingData } = location.state || {};
  
  const [selectedTransport, setSelectedTransport] = useState("gojek");
  
  if (!bookingData) {
    navigate("/");
    return null;
  }

  const transportOptions = [
    { id: "gojek", name: "GoJek", price: 15000, icon: Bike, available: true },
    { id: "grab", name: "Grab", price: 18000, icon: Car, available: true },
    { id: "private", name: "Kendaraan Pribadi", price: 0, icon: Car, available: false }
  ];

  const servicePrice = parseInt(bookingData.price.replace(/[^\d]/g, ''));
  const transportPrice = transportOptions.find(t => t.id === selectedTransport)?.price || 0;
  const total = servicePrice + transportPrice;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleProceedToPayment = () => {
    const orderData = {
      ...bookingData,
      transport: selectedTransport,
      transportPrice,
      total
    };
    navigate("/payment", { state: { orderData } });
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
            Ringkasan Pesanan
          </h1>
          <p className="text-muted-foreground">
            Periksa kembali detail booking Anda
          </p>
        </div>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5" />
              <span>Detail Booking</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">MUA</span>
              <span className="font-medium">{bookingData.muaName}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Layanan</span>
              <span className="font-medium">{bookingData.service}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal</span>
              <span className="font-medium">
                {new Date(bookingData.date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Waktu</span>
              <span className="font-medium">{bookingData.time}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Lokasi</span>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{bookingData.muaLocation}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Map Placeholder */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Lokasi MUA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/30 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
                <p className="text-muted-foreground">Peta Lokasi</p>
                <p className="text-sm text-muted-foreground">{bookingData.muaLocation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transportation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Car className="w-5 h-5" />
              <span>Pilih Transportasi</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transportOptions.map((transport) => {
              const Icon = transport.icon;
              return (
                <div
                  key={transport.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    !transport.available 
                      ? 'opacity-50 cursor-not-allowed bg-muted' 
                      : selectedTransport === transport.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => transport.available && setSelectedTransport(transport.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <div>
                        <p className="font-medium">{transport.name}</p>
                        {!transport.available && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Tidak Tersedia
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="font-semibold">
                      {transport.price === 0 ? 'Gratis' : formatCurrency(transport.price)}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Price Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Rincian Biaya</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal Layanan</span>
              <span>{formatCurrency(servicePrice)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Biaya Transportasi</span>
              <span>{formatCurrency(transportPrice)}</span>
            </div>
            
            <hr className="border-border" />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Proceed Button */}
        <Button 
          onClick={handleProceedToPayment}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          size="lg"
        >
          Lanjut ke Pembayaran
        </Button>
      </div>
    </div>
  );
};

export default Checkout;