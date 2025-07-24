// src/components/MUAProfile/DashboardTab.tsx

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon, DollarSign, Star, Clock, XCircle, CheckCircle } from "lucide-react";
import { Booking, Service } from "./types";
import { formatCurrency, getStatusColor } from "./utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: 'accepted' | 'rejected') => {
    const actionText = newStatus === 'accepted' ? 'Menerima' : 'Menolak';
    toast({ description: `${actionText} pesanan...` });

    try {
      const { error } = await supabase.rpc('update_booking_status_by_mua', {
        p_booking_id: bookingId,
        p_new_status: newStatus
      });

      if (error) throw error;

      toast({ title: "Berhasil", description: `Pesanan telah ${actionText === 'Menerima' ? 'diterima' : 'ditolak'}.` });
      onBookingUpdate();
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    }
  };

  // PERUBAHAN BARU: Fungsi untuk menandai pesanan selesai
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

  return (
    <div className="space-y-8">
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
                                onClick={() => handleUpdateBookingStatus(booking.id, 'rejected')}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Tolak
                              </Button>
                              <Button
                                size="default"
                                className="flex-1 bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                                onClick={() => handleUpdateBookingStatus(booking.id, 'accepted')}
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
                                {/* PERUBAHAN BARU: Tombol "Tandai Selesai" ditambahkan di sini */}
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
    </div>
  );
};