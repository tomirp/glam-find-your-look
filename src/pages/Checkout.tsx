// src/pages/Checkout.tsx

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Calendar, User, Palette, Car, Bike, Ban, Map, CreditCard, Landmark, Globe, Smartphone } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [bookingData, setBookingData] = useState<any>(null);
    const [transportOption, setTransportOption] = useState("online");
    
    useEffect(() => {
        if (location.state && location.state.bookingData) {
            setBookingData(location.state.bookingData);
        } else {
            toast({ title: "Error", description: "Data pemesanan tidak ditemukan.", variant: "destructive" });
            navigate('/');
        }
    }, [location, navigate, toast]);

    if (!bookingData) {
        return <div className="min-h-screen flex items-center justify-center">Memuat detail pesanan...</div>;
    }
    
    // Mengambil data ketersediaan kendaraan dari bookingData
    const muaVehicle = bookingData.vehicle || 'none';
    const onlineTransportFee = 75000; // Contoh harga fix
    
    const platformFee = 5000;
    const bookingPrice = parseInt(bookingData.price.replace(/[^0-9]/g, ''));
    
    // Kalkulasi biaya transportasi dinamis
    const transportFee = transportOption === 'online' ? onlineTransportFee : 0;
    const totalPrice = bookingPrice + platformFee + transportFee;

    const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto max-w-2xl px-4 py-8">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                </Button>
                <div className="space-y-6">
                    {/* Rincian Pesanan */}
                    <Card className="shadow-lg">
                        <CardHeader><CardTitle className="text-xl">Rincian Pesanan</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3"><User className="h-5 w-5 text-primary" /><div><p className="font-semibold">{bookingData.muaName}</p></div></div>
                            <div className="flex items-center gap-3"><Palette className="h-5 w-5 text-primary" /><div><p className="font-semibold">{bookingData.service}</p></div></div>
                            <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-primary" /><div><p className="font-semibold">{new Date(bookingData.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })} pukul {bookingData.time}</p></div></div>
                        </CardContent>
                    </Card>

                    {/* Opsi Transportasi */}
                    <Card className="shadow-lg">
                        <CardHeader><CardTitle className="text-xl">Opsi Transportasi</CardTitle></CardHeader>
                        <CardContent>
                            <RadioGroup value={transportOption} onValueChange={setTransportOption}>
                                <Label htmlFor="transport-online" className="flex items-start gap-4 p-4 rounded-md border has-[:checked]:border-primary cursor-pointer transition-all">
                                    <RadioGroupItem value="online" id="transport-online" />
                                    <div className="flex-1">
                                        <div className="flex justify-between font-semibold"><span>Transportasi Online</span><span>{formatCurrency(onlineTransportFee)}</span></div>
                                        <p className="text-sm text-muted-foreground">MUA akan menggunakan transportasi online ke lokasi Anda.</p>
                                        <div className="mt-2 p-2 bg-gray-100 rounded-md flex items-center gap-2 text-sm text-gray-600">
                                            <Map className="h-8 w-8 text-primary" />
                                            <span>Ini adalah placeholder peta. Klik untuk melihat rute dari lokasi MUA ke lokasi Anda.</span>
                                        </div>
                                    </div>
                                </Label>
                                <Label htmlFor="transport-private" className={`flex items-start gap-4 p-4 rounded-md border mt-4 transition-all ${muaVehicle === 'none' ? 'cursor-not-allowed bg-gray-50 text-gray-400' : 'has-[:checked]:border-primary cursor-pointer'}`}>
                                    <RadioGroupItem value="private" id="transport-private" disabled={muaVehicle === 'none'} />
                                    <div className="flex-1">
                                        <div className="flex justify-between font-semibold"><span>Menggunakan Kendaraan Pribadi</span><span className="text-green-600">Gratis</span></div>
                                        <p className="text-sm">MUA akan datang menggunakan kendaraan pribadi.</p>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                            {muaVehicle === 'motorcycle' && <><Bike className="h-4 w-4" /><span>Motor</span></>}
                                            {muaVehicle === 'car' && <><Car className="h-4 w-4" /><span>Mobil</span></>}
                                            {muaVehicle === 'none' && <><Ban className="h-4 w-4" /><span>Kendaraan tidak tersedia</span></>}
                                        </div>
                                    </div>
                                </Label>
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Metode Pembayaran */}
                    <Card className="shadow-lg">
                        <CardHeader><CardTitle className="text-xl">Metode Pembayaran</CardTitle></CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className="font-semibold"><CreditCard className="h-5 w-5 mr-3 text-primary"/>Kartu Kredit/Debit</AccordionTrigger>
                                    <AccordionContent className="pt-4">Pilih opsi ini untuk membayar dengan kartu Visa, Mastercard, atau lainnya. Anda akan diarahkan ke halaman pembayaran yang aman.</AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger className="font-semibold"><Smartphone className="h-5 w-5 mr-3 text-primary"/>Mobile Banking</AccordionTrigger>
                                    <AccordionContent className="pt-4">Bayar langsung dari aplikasi mobile banking Anda melalui Virtual Account. Kode pembayaran akan ditampilkan di langkah berikutnya.</AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger className="font-semibold"><Landmark className="h-5 w-5 mr-3 text-primary"/>Transfer Bank (ATM)</AccordionTrigger>
                                    <AccordionContent className="pt-4">Lakukan pembayaran melalui mesin ATM terdekat ke nomor Virtual Account yang akan kami berikan.</AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-4">
                                    <AccordionTrigger className="font-semibold"><Globe className="h-5 w-5 mr-3 text-primary"/>Internet Banking</AccordionTrigger>
                                    <AccordionContent className="pt-4">Bayar langsung dari situs web internet banking Anda. Instruksi lengkap akan diberikan setelah Anda melanjutkan.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>

                    {/* Rincian Biaya & Tombol Bayar */}
                    <div className="space-y-2 pt-4">
                        <div className="flex justify-between text-sm"><p>Harga Layanan</p><p>{formatCurrency(bookingPrice)}</p></div>
                        <div className="flex justify-between text-sm"><p>Biaya Transportasi</p><p>{formatCurrency(transportFee)}</p></div>
                        <div className="flex justify-between text-sm"><p>Biaya Platform</p><p>{formatCurrency(platformFee)}</p></div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold text-lg"><p>Total Pembayaran</p><p>{formatCurrency(totalPrice)}</p></div>
                    </div>
                    
                    <Button
                        onClick={() => navigate('/payment', { state: { bookingData: {...bookingData, totalPrice} } })}
                        className="w-full"
                        size="lg"
                    >
                        Lanjutkan Pembayaran
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;