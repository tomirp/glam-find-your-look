// src/pages/Activity.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ArrowLeft, Star, XCircle, MessageSquareQuote } from "lucide-react";
import { SearchingReplacementCard } from "@/components/SearchingReplacementCard";
import { CancellationReasonModal } from "@/components/CancellationReasonModal";

// Tipe data booking
interface Booking {
  id: string;
  booking_date: string;
  status: string;
  total_price: number;
  cancellation_reason: string | null;
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
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const fetchBookings = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data: profileData, error: profileError } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
            if (profileError) throw profileError;

            const { data: bookingsData, error: bookingError } = await supabase
                .from('bookings')
                .select(`*, cancellation_reason, mua_profiles(business_name), services(name), payments!left(payment_status)`)
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

    useEffect(() => {
        if (!authLoading && user) {
            fetchBookings();
        }
    }, [user, authLoading, toast]);

    const handleCancelBooking = async (reason: string) => {
        if (!selectedBooking) return;
        
        toast({ description: "Memproses pembatalan..." });
        try {
            const { error } = await supabase.rpc('cancel_booking_by_customer', { 
                p_booking_id: selectedBooking.id,
                cancellation_reason_param: reason 
            });

            if (error) {
                if (error.message.includes('Pesanan tidak dapat dibatalkan kurang dari 24 jam')) {
                    toast({
                        title: "Pembatalan Gagal",
                        description: "Anda tidak dapat membatalkan pesanan yang akan berlangsung kurang dari 24 jam lagi.",
                        variant: "destructive",
                        duration: 7000,
                    });
                } else {
                    toast({ title: "Gagal Membatalkan", description: error.message, variant: "destructive" });
                }
            } else {
                toast({ title: "Berhasil", description: "Pesanan Anda telah dibatalkan."});
                fetchBookings();
            }
        } catch (error: any) {
            toast({ title: "Gagal", description: "Terjadi kesalahan tak terduga.", variant: "destructive" });
        }
    };

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
                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex flex-col items-start sm:items-end gap-2">
                        <Badge className={`${getStatusColor(booking.status)} border`}>{booking.status}</Badge>
                        <p className="font-bold text-lg text-primary sm:mt-1 text-right whitespace-nowrap">{formatCurrency(booking.total_price)}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto self-stretch">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate('/confirmation', { state: { bookingId: booking.id } })}
                            className="w-full sm:w-auto"
                        >
                            Lihat Invoice
                        </Button>
                        {booking.status === 'completed' && (
                            <Button size="sm" onClick={() => navigate(`/review/${booking.id}`)} className="w-full sm:w-auto">
                                <Star className="h-4 w-4 mr-2" />
                                Berikan Ulasan
                            </Button>
                        )}
                        {(booking.status === 'pending' || booking.status === 'accepted') && (
                            <Button 
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    setSelectedBooking(booking);
                                    setCancelModalOpen(true);
                                }}
                                className="w-full sm:w-auto"
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Batalkan Pesanan
                            </Button>
                        )}
                    
                    </div>
                </div>
            </div>
            {/* --- INI ADALAH BLOK YANG DITAMBAHKAN --- */}
            {/* Tampilkan alasan jika statusnya cancelled atau rejected dan ada alasannya */}
            {(booking.status === 'cancelled' || booking.status === 'rejected') && booking.cancellation_reason && (
              <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                      <MessageSquareQuote className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p className="italic">"{booking.cancellation_reason}"</p>
                  </div>
              </div>
            )}
            {/* ------------------------------------------- */}
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
            <div className="container mx-auto px-4 py-8">
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
                            <div className="relative scroll-shadows">
                                <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                    <TabsList className="bg-transparent p-1 inline-flex">
                                        <TabsTrigger value="aktif" className="whitespace-nowrap">Pesanan Aktif</TabsTrigger>
                                        <TabsTrigger value="dibatalkan" className="whitespace-nowrap">Pesanan Dibatalkan</TabsTrigger>
                                        <TabsTrigger value="selesai" className="whitespace-nowrap">Pesanan Selesai</TabsTrigger>
                                    </TabsList>
                                </div>
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
            <CancellationReasonModal
                isOpen={isCancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                onSubmit={handleCancelBooking}
                title="Batalkan Pesanan"
                description="Harap berikan alasan singkat mengapa Anda membatalkan pesanan ini."
            />
        </div>
    );
}

export default Activity;