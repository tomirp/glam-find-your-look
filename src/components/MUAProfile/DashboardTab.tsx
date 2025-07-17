// src/components/MUAProfile/DashboardTab.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon, DollarSign, Star, Clock, XCircle } from "lucide-react";
import { Booking, Service } from "./types";
import { formatCurrency, getStatusColor } from "./utils";


interface DashboardTabProps {
  bookings: Booking[];
  services: Service[];
  // PERUBAHAN: Tambahkan prop untuk me-refresh data setelah pembatalan
  onBookingUpdate: () => void;
}

export const DashboardTab = ({ bookings, services, onBookingUpdate }: DashboardTabProps) => {
  const currentMonth = new Date().getMonth();
  const monthlyBookings = bookings.filter(b => new Date(b.booking_date).getMonth() === currentMonth);
  const monthlyRevenue = bookings
    .filter(b => new Date(b.booking_date).getMonth() === currentMonth && b.status === 'completed')
    .reduce((sum, b) => sum + b.total_price, 0);

     // PERUBAHAN: Tambahkan toast dan fungsi pembatalan
  const { toast } = useToast();

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin membatalkan pesanan ini? Aksi ini tidak dapat diurungkan.")) {
      return;
    }
    toast({ description: "Membatalkan pesanan..." });
    try {
      // Kita asumsikan 'rejected' adalah status untuk pesanan yang dibatalkan oleh MUA
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'rejected' }) 
        .eq('id', bookingId);

      if (error) throw error;

      toast({ title: "Berhasil", description: "Pesanan telah dibatalkan." });
      onBookingUpdate(); // Memanggil fungsi refresh dari MUAProfile.tsx
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Card Statistik Pendapatan & Pesanan */}
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
      
      {/* Card Pesanan Terbaru */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            Pesanan Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.filter(b => b.status !== 'rejected' && b.status !== 'cancelled').slice(0, 5).map(booking => ( // Filter pesanan yang dibatalkan
              <div key={booking.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex justify-between items-start gap-3">
                    <div className="flex-grow min-w-0">
                        <h4 className="font-medium truncate">{booking.profiles?.full_name}</h4>
                        <p className="text-sm text-gray-600 truncate">{booking.services?.name}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                           <Badge className={`${getStatusColor(booking.status)} border-0 text-xs font-medium`}>{booking.status}</Badge>
                           <Badge variant={booking.payments?.payment_status === 'paid' ? 'default' : 'destructive'} className="text-xs font-medium">
                              {booking.payments?.payment_status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                           </Badge>
                        </div>
                    </div>
                    <div className="flex-shrink-0 text-right flex flex-col items-end gap-2">
                        <p className="font-semibold text-purple-600 whitespace-nowrap">{formatCurrency(booking.total_price)}</p>
                        {/* PERUBAHAN: Tombol Batal akan muncul jika statusnya sesuai */}
                        {(booking.status === 'pending' || booking.status === 'accepted') && (
                           <Button
                              variant="destructive"
                              size="sm"
                              className="text-xs h-7 px-2"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Batalkan
                            </Button>
                        )}
                    </div>
                </div>
              </div>
            ))}
            {bookings.filter(b => b.status !== 'rejected' && b.status !== 'cancelled').length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada pesanan aktif.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};