import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, DollarSign, Star, Users, TrendingUp, MessageSquare } from "lucide-react";

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
}

interface RecentBooking {
  id: string;
  customer_name: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_price: number;
}

const MUADashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalReviews: 0
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get MUA profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!profile) throw new Error("Profile not found");

      const { data: muaProfile } = await supabase
        .from('mua_profiles')
        .select('*')
        .eq('profile_id', profile.id)
        .single();
      
      if (!muaProfile) {
        navigate('/mua/onboarding');
        return;
      }

      // Get bookings stats
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles!bookings_customer_id_fkey(full_name),
          services(name)
        `)
        .eq('mua_profile_id', muaProfile.id)
        .order('created_at', { ascending: false });

      if (bookings) {
        const totalBookings = bookings.length;
        const pendingBookings = bookings.filter(b => b.status === 'pending').length;
        const completedBookings = bookings.filter(b => b.status === 'completed').length;
        const totalEarnings = bookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.total_price - b.platform_fee), 0);

        setStats({
          totalBookings,
          pendingBookings,
          completedBookings,
          totalEarnings,
          averageRating: muaProfile.rating || 0,
          totalReviews: muaProfile.total_reviews || 0
        });

        // Recent bookings (last 5)
        const recent = bookings.slice(0, 5).map(booking => ({
          id: booking.id,
          customer_name: booking.profiles?.full_name || 'Unknown',
          service_name: booking.services?.name || 'Unknown Service',
          booking_date: booking.booking_date,
          booking_time: booking.booking_time,
          status: booking.status,
          total_price: booking.total_price
        }));
        
        setRecentBookings(recent);
      }
    } catch (error: any) {
      console.error('Dashboard fetch error:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardData();
    } else if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'accepted': return 'Diterima';
      case 'completed': return 'Selesai';
      case 'rejected': return 'Ditolak';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-20">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Beranda
              </Button>
              <div>
                <h1 className="text-2xl font-bold font-heading">Dashboard MUA</h1>
                <p className="text-muted-foreground">Kelola bisnis makeup Anda</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate('/mua/profile')}
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                Profil Lengkap
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
              <Calendar className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-blue-100">Semua pesanan</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pesanan Pending</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingBookings}</div>
              <p className="text-xs text-amber-100">Butuh respon</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rp {stats.totalEarnings.toLocaleString('id-ID')}
              </div>
              <p className="text-xs text-emerald-100">Dari {stats.completedBookings} pesanan selesai</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
              <p className="text-xs text-purple-100">Dari {stats.totalReviews} ulasan</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Pesanan Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada pesanan</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{booking.customer_name}</h4>
                        <Badge className={getStatusColor(booking.status)}>
                          {getStatusText(booking.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{booking.service_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(booking.booking_date).toLocaleDateString('id-ID')} • {booking.booking_time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Rp {booking.total_price.toLocaleString('id-ID')}</p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate('/mua/profile?tab=dashboard')}
                        className="mt-1"
                      >
                        Lihat Detail
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/mua/profile?tab=layanan')}>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Kelola Layanan</h3>
              <p className="text-sm text-muted-foreground">Tambah atau edit layanan dan portfolio</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/mua/profile?tab=jadwal')}>
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Atur Jadwal</h3>
              <p className="text-sm text-muted-foreground">Kelola jadwal dan ketersediaan</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/mua/profile?tab=chat')}>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Chat Pelanggan</h3>
              <p className="text-sm text-muted-foreground">Balas pesan dari pelanggan</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MUADashboard;