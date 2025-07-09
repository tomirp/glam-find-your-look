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
  payments: { payment_status: string; } | null;
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

      const { data: bookingsData, error: bookingError } = await supabase
        .from('bookings')
        .select(`*, mua_profiles(business_name), services(name), payments!left(payment_status)`)
        .eq('customer_id', profileData.id)
        .order('booking_date', { ascending: false });
        
      if(bookingError) throw bookingError;
      const typedBookings = bookingsData.map(b => ({...b, payments: Array.isArray(b.payments) ? b.payments[0] : b.payments})) as Booking[];
      setBookings(typedBookings);

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
  
  if (!user || !profile) {
    return null; // Akan diarahkan oleh useEffect di atas
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary/20">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="container mx-auto max-w-5xl px-4 py-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/")} className="hover:bg-accent text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="border-border hover:bg-accent">
              Keluar
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-8">
        {/* Profile Header Card */}
        <Card className="mb-8 overflow-hidden border-0 shadow-xl bg-gradient-to-r from-primary to-secondary">
          <CardContent className="p-8 text-primary-foreground">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-primary-foreground shadow-xl">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="bg-primary-foreground text-primary text-2xl font-bold font-heading">
                  {profile.full_name?.charAt(0) || <User className="h-10 w-10" />}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <h1 className="text-4xl font-bold font-heading tracking-wide">{profile.full_name}</h1>
                <p className="text-primary-foreground/90 text-lg font-medium">{user.email}</p>
                <div className="flex flex-wrap gap-3 text-primary-foreground/90">
                  {profile.phone && (
                    <div className="flex items-center gap-2 bg-primary-foreground/10 px-3 py-1 rounded-full">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm font-medium">{profile.phone}</span>
                    </div>
                  )}
                  {profile.address && (
                    <div className="flex items-center gap-2 bg-primary-foreground/10 px-3 py-1 rounded-full">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">{profile.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="text-center bg-primary-foreground/20 rounded-xl p-6 backdrop-blur-sm border border-primary-foreground/10">
                  <div className="text-3xl font-bold font-heading">{bookings.length}</div>
                  <div className="text-sm text-primary-foreground/80 mt-1">Total Booking</div>
                </div>
                <div className="text-center bg-primary-foreground/20 rounded-xl p-6 backdrop-blur-sm border border-primary-foreground/10">
                  <div className="text-3xl font-bold font-heading">{reviews.length}</div>
                  <div className="text-sm text-primary-foreground/80 mt-1">Ulasan Diberikan</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="riwayat" className="space-y-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-2">
            <TabsList className="grid w-full grid-cols-4 bg-transparent">
              <TabsTrigger value="riwayat" className="data-[state=active]:bg-accent data-[state=active]:text-foreground font-medium">
                <BookOpen className="h-4 w-4 mr-2" />
                Riwayat Booking
              </TabsTrigger>
              <TabsTrigger value="ulasan" className="data-[state=active]:bg-accent data-[state=active]:text-foreground font-medium">
                <Heart className="h-4 w-4 mr-2" />
                Ulasan Saya
              </TabsTrigger>
              <TabsTrigger value="pembayaran" className="data-[state=active]:bg-accent data-[state=active]:text-foreground font-medium">
                <CreditCard className="h-4 w-4 mr-2" />
                Pembayaran
              </TabsTrigger>
              <TabsTrigger value="profil" className="data-[state=active]:bg-accent data-[state=active]:text-foreground font-medium">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profil
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="riwayat">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <Clock className="h-5 w-5 text-primary" />
                  Riwayat Pesanan Anda
                </CardTitle>
                <CardDescription>Lihat semua booking makeup yang pernah Anda lakukan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.length > 0 ? bookings.map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-6 bg-accent/30 rounded-xl hover:bg-accent/50 transition-all duration-200 border border-border">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold font-heading text-foreground">{booking.mua_profiles?.business_name || 'N/A'}</h4>
                          <Badge className={`${getStatusColor(booking.status)} border`}>{booking.status}</Badge>
                          <Badge variant={booking.payments?.payment_status === 'paid' ? 'default' : 'destructive'}>{booking.payments?.payment_status === 'paid' ? 'Lunas' : 'Belum Lunas'}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{booking.services?.name || 'N/A'}</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{new Date(booking.booking_date).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-primary">{formatCurrency(booking.total_price)}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-16 text-muted-foreground">
                      <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Belum ada riwayat pesanan.</p>
                      <p className="text-sm mb-6">Mulai booking makeup artist favorit Anda!</p>
                      <Button onClick={() => navigate("/")} className="bg-primary hover:bg-primary/90">
                        Mulai Booking Sekarang
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ulasan">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <Star className="h-5 w-5 text-primary" />
                  Ulasan yang Telah Anda Berikan
                </CardTitle>
                <CardDescription>Review dan rating untuk MUA yang pernah Anda gunakan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.length > 0 ? reviews.map(review => (
                  <Card key={review.id} className="bg-gradient-to-r from-accent/50 to-secondary/50 border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-foreground font-heading">{review.mua_profiles?.business_name || 'N/A'}</h4>
                          <p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString('id-ID')}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-card rounded-full px-4 py-2 shadow-sm border border-border">
                          {[...Array(5)].map((_, i) => (<Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />))}
                          <span className="ml-2 text-sm font-bold">{review.rating}</span>
                        </div>
                      </div>
                      {review.review_text && (<p className="text-foreground text-sm italic leading-relaxed">"{review.review_text}"</p>)}
                    </CardContent>
                  </Card>
                )) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <Heart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Anda belum memberikan ulasan apa pun.</p>
                    <p className="text-sm">Setelah menggunakan layanan MUA, jangan lupa berikan review!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pembayaran">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Metode Pembayaran
                </CardTitle>
                <CardDescription>Kelola metode pembayaran untuk transaksi yang lebih cepat dan mudah</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-6">
                  <div className="border border-border p-6 rounded-xl flex items-center justify-between hover:bg-accent/30 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-xl shadow-lg">
                        <CreditCard className="h-6 w-6 text-white"/>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Kartu Kredit / Debit</p>
                        <p className="text-sm text-muted-foreground">Visa, Mastercard, JCB</p>
                      </div>
                    </div>
                    <Button variant="outline" className="border-border hover:bg-accent">
                      <PlusCircle className="h-4 w-4 mr-2"/>
                      Tambah Kartu
                    </Button>
                  </div>
                  <div className="border border-border p-6 rounded-xl flex items-center justify-between hover:bg-accent/30 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-xl shadow-lg">
                        <Wallet className="h-6 w-6 text-white"/>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">E-Wallet</p>
                        <p className="text-sm text-muted-foreground">GoPay, OVO, DANA, ShopeePay</p>
                      </div>
                    </div>
                    <Button variant="outline" className="border-border hover:bg-accent">
                      Hubungkan
                    </Button>
                  </div>
                  <div className="border border-green-200 bg-green-50 p-6 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-primary to-secondary p-4 rounded-xl shadow-lg">
                        <QrCode className="h-6 w-6 text-primary-foreground"/>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">QRIS</p>
                        <p className="text-sm text-muted-foreground">Pembayaran universal dengan QR Code</p>
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

          <TabsContent value="profil">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <Settings className="h-5 w-5 text-primary" />
                  Edit Profil
                </CardTitle>
                <CardDescription>Update informasi personal Anda untuk pengalaman booking yang lebih baik</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-8">
                  <div className="space-y-3">
                    <Label htmlFor="full_name" className="text-sm font-medium text-foreground">Nama Lengkap</Label>
                    <Input 
                      id="full_name" 
                      value={editForm.full_name} 
                      onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} 
                      className="border-border focus:border-primary focus:ring-primary/20 h-12"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-sm font-medium text-foreground">Nomor Telepon</Label>
                    <Input 
                      id="phone" 
                      value={editForm.phone} 
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})} 
                      placeholder="08XXXXXXXXXX" 
                      className="border-border focus:border-primary focus:ring-primary/20 h-12"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="address" className="text-sm font-medium text-foreground">Alamat</Label>
                    <Textarea 
                      id="address" 
                      value={editForm.address} 
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})} 
                      placeholder="Alamat lengkap untuk memudahkan MUA datang ke lokasi Anda..." 
                      rows={4} 
                      className="border-border focus:border-primary focus:ring-primary/20 resize-none"
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button type="submit" className="bg-primary hover:bg-primary/90 h-12 px-8 font-medium">
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