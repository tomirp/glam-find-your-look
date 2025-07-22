// src/pages/Payment.tsx

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CreditCard, Lock } from "lucide-react";

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const [bookingData, setBookingData] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState("credit_card");
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (location.state && location.state.bookingData) {
            setBookingData(location.state.bookingData);
        } else {
            toast({ title: "Error", description: "Data pemesanan tidak ditemukan.", variant: "destructive" });
            navigate('/');
        }
    }, [location, navigate, toast]);

    const handlePayment = async () => {
        if (!user || !bookingData) {
            toast({ title: "Error", description: "Sesi Anda berakhir, silakan login kembali.", variant: "destructive" });
            navigate('/auth');
            return;
        }

        setIsProcessing(true);
        toast({ description: "Memproses pesanan Anda..." });

        try {
            // PERBAIKAN UTAMA: Panggil fungsi RPC `create_new_booking`
            const { data: newBookingId, error } = await supabase
                .rpc('create_new_booking', {
                    p_mua_profile_id: bookingData.muaId,
                    p_service_id: bookingData.serviceId,
                    p_booking_date: new Date(bookingData.date).toISOString(),
                    p_booking_time: bookingData.time,
                    p_total_price: bookingData.totalPrice,
                    p_platform_fee: 5000 // Contoh biaya platform
                });

            if (error) {
                // Jika ada error dari fungsi (misalnya 'Customer profile not found'), tampilkan
                throw error;
            }
            
            toast({ title: "Berhasil!", description: "Pembayaran berhasil dan pesanan Anda telah dibuat." });
            navigate('/confirmation', { state: { bookingId: newBookingId } });

        } catch (error: any) {
            console.error("Payment process error:", error);
            toast({
                title: "Gagal membuat Pesanan",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };
    
    if (!bookingData) {
        return <div>Memuat data pemesanan...</div>;
    }
    
    const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto max-w-2xl px-4 py-8">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali ke Rincian
                </Button>
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl">Pembayaran</CardTitle>
                        <CardDescription>Selesaikan pembayaran untuk mengonfirmasi pesanan Anda.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 bg-gray-100 rounded-lg">
                            <h3 className="font-semibold">{bookingData.muaName}</h3>
                            <p className="text-sm text-gray-600">{bookingData.service}</p>
                            <p className="text-lg font-bold text-primary mt-2">Total: {formatCurrency(bookingData.totalPrice)}</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payment-method">Pilih Metode Pembayaran</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger id="payment-method">
                                    <SelectValue placeholder="Pilih cara bayar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="credit_card">Kartu Kredit / Debit</SelectItem>
                                    <SelectItem value="gopay">GoPay</SelectItem>
                                    <SelectItem value="qris">QRIS</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {paymentMethod === 'credit_card' && (
                            <div className="space-y-4 border p-4 rounded-md">
                                <div className="space-y-2">
                                    <Label htmlFor="card-number">Nomor Kartu</Label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input id="card-number" placeholder="0000 0000 0000 0000" className="pl-10" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="expiry-date">Tanggal Kedaluwarsa</Label>
                                        <Input id="expiry-date" placeholder="MM/YY" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cvc">CVC</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input id="cvc" placeholder="123" className="pl-10" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <Button onClick={handlePayment} className="w-full" size="lg" disabled={isProcessing}>
                            {isProcessing ? 'Memproses...' : `Bayar ${formatCurrency(bookingData.totalPrice)}`}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Payment;