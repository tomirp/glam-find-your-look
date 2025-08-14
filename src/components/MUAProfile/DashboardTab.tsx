// src/components/MUAProfile/DashboardTab.tsx

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CancellationReasonModal } from '@/components/CancellationReasonModal';
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon, DollarSign, Star, Clock, XCircle, CheckCircle } from "lucide-react";
import { Booking, Service } from "./types";
import { formatCurrency, getStatusColor } from "./utils";
import { MessageSquareQuote } from "lucide-react";
import { Badge } from "@/components/ui/badge"; // <-- Pastikan Badge diimpor

interface DashboardTabProps {
  bookings: Booking[];
  services: Service[];
  onBookingUpdate: () => void;
}

export const DashboardTab = ({ bookings, services, onBookingUpdate }: DashboardTabProps) => {
  const currentMonth = new Date().getMonth();
  const monthlyBookings = bookings.filter(b => new Date(b.booking_date).getMonth() === currentMonth);
  const monthlyRevenue = bookings
    .filter(b => new Date(b.booking_date).getMonth() === currentMonth && b.status === 'completed')
    .reduce((sum, b) => sum + b.total_price, 0);
    
  const { toast } = useToast();
  
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const handleAcceptBooking = async (bookingId: string) => {
    toast({ description: "Menerima pesanan..." });
    try {
      const { error } = await supabase.rpc('update_booking_status_by_mua', {
        p_booking_id: bookingId,
        p_new_status: 'accepted'
      });
      if (error) throw error;
      toast({ title: "Berhasil", description: "Pesanan telah diterima." });
      onBookingUpdate();
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    }
  };

  const handleRejectBooking = async (reason: string) => {
    if (!selectedBooking) return;
    toast({ description: "Menolak pesanan..." });
    try {
      const { error } = await supabase.rpc('update_booking_status_by_mua', {
        p_booking_id: selectedBooking.id,
        p_new_status: 'rejected',
        cancellation_reason_param: reason
      });
      if (error) throw error;
      toast({ title: "Berhasil", description: "Pesanan telah ditolak." });
      onBookingUpdate();
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    toast({ description: "Menyelesaikan pesanan..." });
    try {
      const { error } = await supabase.rpc('complete_booking', { p_booking_id: bookingId });
      if (error) throw error;
      toast({ title: "Berhasil", description: "Pesanan telah ditandai sebagai selesai." });
      onBookingUpdate();
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const activeBookings = bookings.filter(b => b.status === 'accepted');
  const failedBookings = bookings.filter(b => b.status === 'rejected' || b.status === 'cancelled');

  return (
    <div className="space-y-8">
      {/* Card Statistik (tidak berubah) */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pesanan Bulan Ini</p>
              <p className="text-2xl font-bold text-blue-600">{monthlyBookings.length}</p>
            </div>
            <CalendarIcon className="h-10 w-10 text-blue-500/50" />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendapatan Bulan Ini</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(monthlyRevenue)}
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-green-500/50" />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Layanan Aktif</p>
              <p className="text-2xl font-bold text-purple-600">{services.filter(s => s.is_active).length}</p>
            </div>
            <Star className="h-10 w-10 text-purple-500/50" />
          </CardContent>
        </Card>
      </div>
      
      {/* Card Perlu Persetujuan (tidak berubah) */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Perlu Persetujuan ({pendingBookings.length})
          </CardTitle>
          <CardDescription>Terima atau tolak pesanan baru dari pelanggan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingBookings.length > 0 ? (
              pendingBookings.map(booking => (
                <div key={booking.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                      <div className="flex-grow min-w-0">
                          <h4 className="font-semibold text-base truncate">{booking.profiles?.full_name}</h4>
                          <p className="text-sm text-gray-600 truncate">{booking.services?.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                              {new Date(booking.booking_date).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'})}
                          </p>
                      </div>
                      <div className="w-full sm:w-auto flex flex-col items-stretch sm:items-end gap-2 mt-2 sm:mt-0">
                          <p className="font-semibold text-purple-600 text-left sm:text-right">{formatCurrency(booking.total_price)}</p>
                          <div className="flex items-center gap-2">
                              <Button
                                variant="destructive"
                                size="default"
                                className="flex-1 text-xs sm:text-sm"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setRejectModalOpen(true);
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Tolak
                              </Button>
                              <Button
                                size="default"
                                className="flex-1 bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                                onClick={() => handleAcceptBooking(booking.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Terima
                              </Button>
                          </div>
                      </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Tidak ada pesanan yang memerlukan persetujuan saat ini.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Card Pesanan Aktif (tidak berubah) */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            Pesanan Aktif ({activeBookings.length})
          </CardTitle>
          <CardDescription>Daftar pesanan yang sudah Anda terima. Tandai selesai jika pekerjaan sudah rampung.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeBookings.length > 0 ? (
                activeBookings.map(booking => (
                    <div key={booking.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                            <div className='flex-1'>
                                <h4 className="font-semibold">{booking.profiles?.full_name}</h4>
                                <p className="text-sm text-muted-foreground">{booking.services?.name}</p>
                            </div>
                            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                <div className="text-left sm:text-right">
                                    <p className="font-semibold text-sm">
                                        {new Date(booking.booking_date).toLocaleDateString('id-ID', {weekday: 'long', day: '2-digit', month: 'long'})}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{booking.booking_time}</p>
                                </div>
                                <Button
                                  size="sm"
                                  className="bg-primary hover:bg-primary/90"
                                  onClick={() => handleCompleteBooking(booking.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Tandai Selesai
                                </Button>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Belum ada pesanan aktif.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* --- INI ADALAH BLOK YANG DIPERBARUI --- */}
      {/* Menambahkan Card baru untuk menampilkan riwayat pesanan yang gagal */}
      <Card className="border-0 shadow-lg">
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-gray-500" />
                  Riwayat Pesanan Gagal
              </CardTitle>
              <CardDescription>Daftar pesanan yang ditolak atau dibatalkan oleh pelanggan.</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                  {failedBookings.length > 0 ? (
                      failedBookings.map(booking => (
                          <div key={booking.id} className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                                  <div className='flex-1'>
                                      <h4 className="font-semibold">{booking.profiles?.full_name}</h4>
                                      <p className="text-sm text-muted-foreground">{booking.services?.name}</p>
                                  </div>
                                  <div className="w-full sm:w-auto flex flex-col items-start sm:items-end gap-2">
                                      <Badge className={`${getStatusColor(booking.status)} border`}>{booking.status}</Badge>
                                      <p className="text-xs text-muted-foreground">
                                          {new Date(booking.booking_date).toLocaleDateString('id-ID', {day: '2-digit', month: 'long'})}
                                      </p>
                                  </div>
                              </div>
                              {booking.cancellation_reason && (
                                  <div className="mt-3 pt-3 border-t">
                                      <div className="flex items-start gap-3 text-sm text-gray-600">
                                          <MessageSquareQuote className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
                                          <p className="italic">"{booking.cancellation_reason}"</p>
                                      </div>
                                  </div>
                              )}
                          </div>
                      ))
                  ) : (
                      <div className="text-center py-12 text-gray-500">
                          <p>Tidak ada riwayat pesanan yang ditolak atau dibatalkan.</p>
                      </div>
                  )}
              </div>
          </CardContent>
      </Card>
      {/* ------------------------------------------- */}

      <CancellationReasonModal
        isOpen={isRejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={handleRejectBooking}
        title="Tolak Pesanan"
        description="Harap berikan alasan singkat mengapa Anda menolak pesanan ini."
      />
    </div>
  );
};