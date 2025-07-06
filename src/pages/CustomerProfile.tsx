import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Import semua komponen UI yang kita butuhkan
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, User, Star, MapPin, Phone, Save, CreditCard, Wallet, QrCode, PlusCircle, ShieldCheck, Clock, Calendar, Heart, Settings, BookOpen } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// --- INTERFACE (Tipe Data) ---
interface UserProfile {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  address: string | null;
  bio: string | null;
}

interface Booking {
  id: string;
  booking_date: string;
  status: string;
  total_price: number;
  mua_profiles: { business_name: string | null; };
  services: { name: string; };
}

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  mua_profiles: { business_name: string | null; };
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

const CustomerProfile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  // State untuk form edit
  const [editForm, setEditForm] = useState({ full_name: "", phone: "", address: "" });

  // Fungsi untuk mengambil semua data yang relevan untuk klien
  const fetchAllData = async () => {
    if (!user) return;
    setPageLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      if (profileError) throw profileError;
      setProfile(profileData);
      setEditForm({ full_name: profileData.full_name || '', phone: profileData.phone || '', address: profileData.address || ''});

      const { data: bookingsData, error: bookingError } = await supabase.from('bookings').select(`id, booking_date, status, total_price, mua_profiles(business_name), services(name)`).eq('customer_id', profileData.id).order('booking_date', { ascending: false });
      if(bookingError) throw bookingError;
      setBookings(bookingsData || []);

      const { data: reviewsData, error: reviewError } = await supabase.from('reviews').select(`id, rating, review_text, created_at, mua_profiles(business_name)`).eq('customer_id', profileData.id).order('created_at', { ascending: false });
      if(reviewError) throw reviewError;
      setReviews(reviewsData || []);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({ title: "Error", description: error.message || "Gagal memuat data profil.", variant: "destructive" });
    } finally {
      setPageLoading(false);
    }
  };
  
  // Ambil data saat komponen dimuat atau user berubah
  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  // Handle logout dan redirect
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setPageLoading(true);
    const { error } = await supabase.from('profiles').update(editForm).eq('id', profile.id);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Berhasil!", description: "Profil Anda telah diperbarui." });
      await fetchAllData(); // Muat ulang data setelah update
    }
    setPageLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };
  
  if (pageLoading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div><p className="text-gray-600">Memuat Profil Anda...</p></div></div>;
  }
  
  if (!user) {
    return null; // Akan diarahkan oleh useEffect di atas
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/")} className="hover:bg-pink-50">
              <ArrowLeft className="h-4 w-4 mr-2" />Kembali ke Beranda
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="border-pink-200 hover:bg-pink-50">
              Keluar
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-8">
        {/* Profile Header Card */}
        <Card className="mb-8 overflow-hidden border-0 shadow-lg bg-gradient-to-r from-pink-500 to-purple-600">
          <CardContent className="p-8 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-white text-pink-600 text-2xl font-bold">
                  {profile?.full_name?.charAt(0) || <User className="h-10 w-10" />}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <h1 className="text-3xl font-bold">{profile?.full_name}</h1>
                <p className="text-white/90 text-lg">{user.email}</p>
                <div className="flex flex-wrap gap-4 text-white/80">
                  {profile?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile?.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="text-center bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{bookings.length}</div>
                  <div className="text-sm text-white/80">Total Booking</div>
                </div>
                <div className="text-center bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{reviews.length}</div>
                  <div className="text-sm text-white/80">Ulasan Diberikan</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="riwayat" className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-1">
            <TabsList className="grid w-full grid-cols-4 bg-transparent">
              <TabsTrigger value="riwayat" className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700">
                <BookOpen className="h-4 w-4 mr-2" />
                Riwayat Booking
              </TabsTrigger>
              <TabsTrigger value="ulasan" className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700">
                <Heart className="h-4 w-4 mr-2" />
                Ulasan Saya
              </TabsTrigger>
              <TabsTrigger value="pembayaran" className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700">
                <CreditCard className="h-4 w-4 mr-2" />
                Pembayaran
              </TabsTrigger>
              <TabsTrigger value="profil" className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profil
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Booking History Tab */}
          <TabsContent value="riwayat">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-pink-600" />
                  Riwayat Pesanan Anda
                </CardTitle>
                <CardDescription>Lihat semua booking makeup yang pernah Anda lakukan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.length > 0 ? bookings.map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{booking.mua_profiles?.business_name || 'N/A'}</h4>
                          <Badge className={`${getStatusColor(booking.status)} border`}>
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{booking.services?.name || 'N/A'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            {new Date(booking.booking_date).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-pink-600">{formatCurrency(booking.total_price)}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Belum ada riwayat pesanan.</p>
                      <Button onClick={() => navigate("/")} className="mt-4 bg-pink-600 hover:bg-pink-700">
                        Mulai Booking Sekarang
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="ulasan">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-pink-600" />
                  Ulasan yang Telah Anda Berikan
                </CardTitle>
                <CardDescription>Review dan rating untuk MUA yang pernah Anda gunakan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.length > 0 ? reviews.map(review => (
                  <Card key={review.id} className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-100">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {review.mua_profiles?.business_name || 'N/A'}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {new Date(review.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 bg-white rounded-full px-3 py-1 shadow-sm">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                          <span className="ml-1 text-sm font-medium">{review.rating}</span>
                        </div>
                      </div>
                      {review.review_text && (
                        <p className="text-gray-700 text-sm italic">
                          "{review.review_text}"
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )) : (
                  <div className="text-center py-12 text-gray-500">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Anda belum memberikan ulasan apa pun.</p>
                    <p className="text-sm text-gray-400 mt-2">Setelah menggunakan layanan MUA, jangan lupa berikan review!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Payment Methods Tab */}
          <TabsContent value="pembayaran">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-pink-600" />
                  Metode Pembayaran
                </CardTitle>
                <CardDescription>Kelola metode pembayaran untuk transaksi yang lebih cepat dan mudah</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="border border-gray-200 p-4 rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg">
                        <CreditCard className="h-6 w-6 text-white"/>
                      </div>
                      <div>
                        <p className="font-semibold">Kartu Kredit / Debit</p>
                        <p className="text-sm text-gray-500">Visa, Mastercard, JCB</p>
                      </div>
                    </div>
                    <Button variant="outline" className="border-pink-200 hover:bg-pink-50">
                      <PlusCircle className="h-4 w-4 mr-2"/>Tambah Kartu
                    </Button>
                  </div>

                  <div className="border border-gray-200 p-4 rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-lg">
                        <Wallet className="h-6 w-6 text-white"/>
                      </div>
                      <div>
                        <p className="font-semibold">E-Wallet</p>
                        <p className="text-sm text-gray-500">GoPay, OVO, DANA, ShopeePay</p>
                      </div>
                    </div>
                    <Button variant="outline" className="border-pink-200 hover:bg-pink-50">
                      Hubungkan
                    </Button>
                  </div>

                  <div className="border border-green-200 bg-green-50 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
                        <QrCode className="h-6 w-6 text-white"/>
                      </div>
                      <div>
                        <p className="font-semibold">QRIS</p>
                        <p className="text-sm text-gray-500">Pembayaran universal dengan QR Code</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <ShieldCheck className="h-5 w-5"/>
                      <span className="text-sm font-medium">Siap Digunakan</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edit Profile Tab */}
          <TabsContent value="profil">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-pink-600" />
                  Edit Profil
                </CardTitle>
                <CardDescription>Update informasi personal Anda untuk pengalaman booking yang lebih baik</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nama Lengkap</Label>
                    <Input 
                      id="full_name" 
                      value={editForm.full_name} 
                      onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                      className="border-gray-200 focus:border-pink-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input 
                      id="phone" 
                      value={editForm.phone} 
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      placeholder="08XXXXXXXXXX"
                      className="border-gray-200 focus:border-pink-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Alamat</Label>
                    <Textarea 
                      id="address" 
                      value={editForm.address} 
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})} 
                      placeholder="Alamat lengkap untuk memudahkan MUA datang ke lokasi Anda..."
                      rows={3}
                      className="border-gray-200 focus:border-pink-400"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
                      <Save className="h-4 w-4 mr-2"/>
                      Simpan Perubahan
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerProfile;
