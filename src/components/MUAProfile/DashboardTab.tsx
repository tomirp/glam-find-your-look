// src/components/MUAProfile/DashboardTab.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon, DollarSign, Star, Clock, XCircle } from "lucide-react";
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

  const handleCancelBooking = async (bookingId: string) => {
    toast({ description: "Membatalkan pesanan..." });
    try {
      const { error } = await supabase.rpc('cancel_booking', {
        p_booking_id: bookingId
      });
      if (error) throw error;
      toast({ title: "Berhasil", description: "Pesanan telah dibatalkan." });
      onBookingUpdate();
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
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
            <Clock className="h-5 w-5 text-purple-600" />
            Pesanan Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.filter(b => b.status !== 'rejected' && b.status !== 'cancelled').slice(0, 5).map(booking => (
              // PERUBAHAN: Layout kartu pesanan diubah menggunakan Flexbox
              <div key={booking.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-grow min-w-0">
                        <h4 className="font-semibold text-base truncate">{booking.profiles?.full_name}</h4>
                        <p className="text-sm text-gray-600 truncate">{booking.services?.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {new Date(booking.booking_date).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}
                        </p>
                    </div>
                    <div className="w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 mt-2 sm:mt-0">
                        <div className="flex items-center gap-2 flex-wrap">
                           <Badge className={`${getStatusColor(booking.status)} border-0 text-xs font-medium`}>{booking.status}</Badge>
                           <Badge variant={booking.payments?.payment_status === 'paid' ? 'default' : 'destructive'} className="text-xs font-medium">
                              {booking.payments?.payment_status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                           </Badge>
                        </div>
                         <div className="flex items-center gap-2">
                            <p className="font-semibold text-purple-600 whitespace-nowrap">{formatCurrency(booking.total_price)}</p>
                            {(booking.status === 'pending' || booking.status === 'accepted') && (
                               <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" className="text-xs h-6 px-2">
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Batal
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
                                      <AlertDialogDescription>Aksi ini akan membatalkan pesanan. Aksi ini tidak dapat diurungkan.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Kembali</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleCancelBooking(booking.id)}>Ya, Batalkan</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
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