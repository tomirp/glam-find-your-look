// src/components/MUAProfile/DashboardTab.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, DollarSign, Star, Clock } from "lucide-react";
import { Booking, Service } from "./types";
import { formatCurrency, getStatusColor } from "./utils";

interface DashboardTabProps {
  bookings: Booking[];
  services: Service[];
}

export const DashboardTab = ({ bookings, services }: DashboardTabProps) => {
  const currentMonth = new Date().getMonth();
  const monthlyBookings = bookings.filter(b => new Date(b.booking_date).getMonth() === currentMonth);
  const monthlyRevenue = bookings
    .filter(b => new Date(b.booking_date).getMonth() === currentMonth && b.status === 'completed')
    .reduce((sum, b) => sum + b.total_price, 0);

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
      
      {/* Recent Bookings */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            Pesanan Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.slice(0, 5).map(booking => (
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
                    <div className="flex-shrink-0 text-right">
                        <p className="font-semibold text-purple-600 whitespace-nowrap">{formatCurrency(booking.total_price)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {new Date(booking.booking_date).toLocaleDateString('id-ID', {day: '2-digit', month: 'short'})}
                        </p>
                    </div>
                </div>
              </div>
            ))}
            {bookings.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada pesanan</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};