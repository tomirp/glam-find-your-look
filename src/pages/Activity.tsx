// src/pages/Activity.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button"; // PERUBAHAN: Impor Button
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Calendar, Clock, AlertTriangle, ArrowLeft } from "lucide-react";
import { SearchingReplacementCard } from "@/components/SearchingReplacementCard"; // Kita pakai lagi kartu SOS

// Tipe data booking dari CustomerProfile.tsx
interface Booking {
  id: string;
  booking_date: string;
  status: string;
  total_price: number;
  mua_profiles: { business_name: string | null; };
  services: { name: string; };
  payments: { payment_status: string; } | null;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
};

const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const Activity = () => {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate(); // PERUBAHAN: Tambahkan hook navigate
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const { data: profileData, error: profileError } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
                if (profileError) throw profileError;

                const { data: bookingsData, error: bookingError } = await supabase
                    .from('bookings')
                    .select(`*, mua_profiles(business_name), services(name), payments!left(payment_status)`)
                    .eq('customer_id', profileData.id)
                    .order('booking_date', { ascending: false });

                if (bookingError) throw bookingError;

                const typedBookings = bookingsData.map(b => ({ ...b, payments: Array.isArray(b.payments) ? b.payments[0] : b.payments })) as Booking[];
                setBookings(typedBookings);
            } catch (error: any) {
                toast({ title: "Error", description: "Gagal memuat data aktivitas.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && user) {
            fetchBookings();
        }
    }, [user, authLoading, toast]);

    const activeBookings = bookings.filter(b => b.status === 'pending' || b.status === 'accepted');
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
    const rejectedBookings = bookings.filter(b => b.status === 'rejected');
    const completedBookings = bookings.filter(b => b.status === 'completed');

    const BookingCard = ({ booking }: { booking: Booking }) => (
        <div className="p-4 sm:p-6 bg-accent/30 rounded-xl border border-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold font-heading text-lg text-foreground truncate">{booking.mua_profiles?.business_name || 'N/A'}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{booking.services?.name || 'N/A'}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(booking.booking_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>
                <div className="w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2">
                    <Badge className={`${getStatusColor(booking.status)} border`}>{booking.status}</Badge>
                    <p className="font-bold text-lg text-primary sm:mt-2 text-right whitespace-nowrap">{formatCurrency(booking.total_price)}</p>
                </div>
            </div>
        </div>
    );

    const renderBookingList = (list: Booking[], emptyMessage: string) => {
        if (loading) return <p>Memuat pesanan...</p>;
        if (list.length === 0) return <p className="text-center text-muted-foreground py-12">{emptyMessage}</p>;
        
        return (
            <div className="space-y-4">
                {list.map(booking => 
                    booking.status === 'rejected' 
                    ? <SearchingReplacementCard key={booking.id} booking={booking} />
                    : <BookingCard key={booking.id} booking={booking} />
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background pb-16 md:pb-0">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                {/* PERUBAHAN: Tambahkan tombol Kembali ke Beranda di sini */}
                <div className="mb-6">
                    <Button variant="ghost" onClick={() => navigate("/")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali ke Beranda
                    </Button>
                </div>

                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-heading text-3xl">Aktivitas Saya</CardTitle>
                        <CardDescription>Lacak dan kelola semua pesanan makeup Anda di sini.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="aktif" className="w-full">
                            <div className="relative">
                                <Carousel opts={{ align: "start", skipSnaps: true }}>
                                    <CarouselContent className="-ml-2">
                                        <TabsList className="bg-transparent p-1 inline-flex">
                                            <CarouselItem className="pl-2 basis-auto">
                                                <TabsTrigger value="aktif" className="whitespace-nowrap">Pesanan Aktif</TabsTrigger>
                                            </CarouselItem>
                                            <CarouselItem className="pl-2 basis-auto">
                                                <TabsTrigger value="dibatalkan" className="whitespace-nowrap">Pesanan Dibatalkan</TabsTrigger>
                                            </CarouselItem>
                                            <CarouselItem className="pl-2 basis-auto">
                                                <TabsTrigger value="selesai" className="whitespace-nowrap">Pesanan Selesai</TabsTrigger>
                                            </CarouselItem>
                                        </TabsList>
                                    </CarouselContent>
                                    <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2" />
                                    <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2" />
                                </Carousel>
                            </div>

                            <TabsContent value="aktif" className="mt-6">
                                {renderBookingList(activeBookings.concat(rejectedBookings), "Tidak ada pesanan aktif saat ini.")}
                            </TabsContent>
                            <TabsContent value="dibatalkan" className="mt-6">
                                {renderBookingList(cancelledBookings, "Anda belum pernah membatalkan pesanan.")}
                            </TabsContent>
                            <TabsContent value="selesai" className="mt-6">
                                {renderBookingList(completedBookings, "Belum ada pesanan yang selesai.")}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default Activity;