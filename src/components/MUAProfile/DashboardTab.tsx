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
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pesanan Bulan Ini</p>
                <p className="text-3xl font-bold text-blue-600">{monthlyBookings.length}</p>
              </div>
              <CalendarIcon className="h-12 w-12 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendapatan Bulan Ini</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(monthlyRevenue)}
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Layanan Aktif</p>
                <p className="text-3xl font-bold text-purple-600">{services.filter(s => s.is_active).length}</p>
              </div>
              <Star className="h-12 w-12 text-purple-500/50" />
            </div>
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
              <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{booking.profiles?.full_name}</h4>
                    <Badge className={`${getStatusColor(booking.status)} border-0`}>
                      {booking.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{booking.services?.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(booking.booking_date).toLocaleDateString('id-ID')} • {booking.booking_time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-purple-600">{formatCurrency(booking.total_price)}</p>
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