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
import { ArrowLeft, User, Calendar, Star, Settings, Save, CreditCard, Wallet, QrCode, PlusCircle, ShieldCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DialogFooter } from "@/components/ui/dialog";

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


// --- KOMPONEN UTAMA ---
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
      // 1. Ambil data profil klien
      const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      if (profileError) throw profileError;
      setProfile(profileData);
      setEditForm({ full_name: profileData.full_name || '', phone: profileData.phone || '', address: profileData.address || ''});

      // 2. Ambil riwayat booking klien
      const { data: bookingsData, error: bookingError } = await supabase.from('bookings').select(`id, booking_date, status, total_price, mua_profiles(business_name), services(name)`).eq('customer_id', profileData.id).order('booking_date', { ascending: false });
      if(bookingError) throw bookingError;
      setBookings(bookingsData || []);

      // 3. Ambil ulasan yang pernah diberikan klien
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

  // Fungsi untuk update profil
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
    return <div className="min-h-screen flex items-center justify-center"><div>Memuat Profil Anda...</div></div>;
  }
  
  if (!user) {
    return null; // Akan diarahkan oleh useEffect di atas
  }

  // --- TAMPILAN JSX ---
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4 mr-2" />Kembali ke Beranda</Button>
          <Button variant="outline" onClick={handleSignOut}>Keluar</Button>
        </div>

        <div className="flex items-center space-x-6 mb-8">
            <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="text-3xl"><User /></AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-3xl font-bold">{profile?.full_name}</h1>
                <p className="text-muted-foreground">{user.email}</p>
            </div>
        </div>

        <Tabs defaultValue="riwayat" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="riwayat">Riwayat Booking</TabsTrigger>
                <TabsTrigger value="ulasan">Ulasan Saya</TabsTrigger>
                <TabsTrigger value="pembayaran">Metode Pembayaran</TabsTrigger>
                <TabsTrigger value="profil">Edit Profil</TabsTrigger>
            </TabsList>

            {/* Konten Tab 1: Riwayat Booking */}
            <TabsContent value="riwayat">
                <Card>
                    <CardHeader><CardTitle>Riwayat Pesanan Anda</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>MUA</TableHead><TableHead>Layanan</TableHead><TableHead>Tanggal</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {bookings.length > 0 ? bookings.map(booking => (
                                    <TableRow key={booking.id}>
                                        <TableCell>{booking.mua_profiles?.business_name || 'N/A'}</TableCell>
                                        <TableCell>{booking.services?.name || 'N/A'}</TableCell>
                                        <TableCell>{new Date(booking.booking_date).toLocaleDateString('id-ID')}</TableCell>
                                        <TableCell><Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>{booking.status}</Badge></TableCell>
                                    </TableRow>
                                )) : <TableRow><TableCell colSpan={4} className="text-center h-24">Belum ada riwayat pesanan.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Konten Tab 2: Ulasan Saya */}
            <TabsContent value="ulasan">
                <Card>
                    <CardHeader><CardTitle>Ulasan yang Telah Anda Berikan</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {reviews.length > 0 ? reviews.map(review => (
                            <Card key={review.id} className="p-4 bg-secondary/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">Untuk: {review.mua_profiles?.business_name || 'N/A'}</p>
                                        <p className="text-sm text-muted-foreground mt-1">"{review.review_text || 'Tidak ada komentar.'}"</p>
                                    </div>
                                    <Badge variant="outline" className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> {review.rating}</Badge>
                                </div>
                            </Card>
                        )) : <p className="text-center text-muted-foreground py-10">Anda belum memberikan ulasan apa pun.</p>}
                    </CardContent>
                </Card>
            </TabsContent>
            
            {/* Konten Tab 3: Pembayaran */}
            <TabsContent value="pembayaran">
                <Card>
                    <CardHeader>
                      <CardTitle>Metode Pembayaran Tersimpan</CardTitle>
                      <CardDescription>Kelola metode pembayaran untuk transaksi yang lebih cepat.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border p-4 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-4"><CreditCard className="h-8 w-8 text-primary"/><div><p className="font-semibold">Kartu Kredit / Debit</p><p className="text-sm text-muted-foreground">Tidak ada kartu tersimpan</p></div></div>
                            <Button variant="outline"><PlusCircle className="h-4 w-4 mr-2"/>Tambah Kartu</Button>
                        </div>
                        <div className="border p-4 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-4"><Wallet className="h-8 w-8 text-primary"/><div><p className="font-semibold">E-Wallet</p><p className="text-sm text-muted-foreground">GoPay, OVO, DANA, dll.</p></div></div>
                            <Button variant="outline">Hubungkan</Button>
                        </div>
                        <div className="border p-4 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-4"><QrCode className="h-8 w-8 text-primary"/><div><p className="font-semibold">QRIS</p><p className="text-sm text-muted-foreground">Siap digunakan untuk pembayaran</p></div></div>
                            <ShieldCheck className="h-5 w-5 text-green-500"/>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Konten Tab 4: Edit Profil */}
            <TabsContent value="profil">
                 <form onSubmit={handleProfileUpdate}>
                    <Card>
                        <CardHeader><CardTitle>Detail Profil</CardTitle><CardDescription>Informasi ini akan digunakan untuk keperluan booking.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2"><Label htmlFor="full_name">Nama Lengkap</Label><Input id="full_name" value={editForm.full_name} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} /></div>
                            <div className="space-y-2"><Label htmlFor="phone">Nomor Telepon</Label><Input id="phone" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} /></div>
                            <div className="space-y-2"><Label htmlFor="address">Alamat (Opsional)</Label><Textarea id="address" value={editForm.address} onChange={(e) => setEditForm({...editForm, address: e.target.value})} placeholder="Alamat lengkap untuk layanan di rumah..." /></div>
                        </CardContent>
                        <DialogFooter className="p-6 pt-0 border-t mt-6"><Button type="submit"><Save className="h-4 w-4 mr-2"/>Simpan Perubahan</Button></DialogFooter>
                    </Card>
                 </form>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerProfile;