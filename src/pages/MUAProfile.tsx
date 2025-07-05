import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Import komponen UI yang dibutuhkan
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, User, Calendar as CalendarIcon, DollarSign, Star, Settings, Save, PlusCircle, Upload } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DialogFooter } from "@/components/ui/dialog";


// --- INTERFACE (diperbarui untuk data baru) ---
interface MUAProfile {
  id: string;
  business_name: string | null;
  location_city: string;
  location_address: string | null;
  rating: number | null;
  total_reviews: number | null;
  total_bookings: number | null;
  is_available: boolean | null;
  portfolio_images: string[] | null; // Untuk Portofolio Carousel
  profile_id: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_price: number;
  customer_notes: string | null;
  profiles: { full_name: string; };
  services: { name: string; };
}

interface Service {
  id: string;
  name: string;
  price_min: number;
  price_max: number | null;
  duration_minutes: number | null;
  is_active: boolean | null;
  image_url: string | null; // Untuk gambar per layanan
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
};

// --- KOMPONEN UTAMA ---
const MUAProfile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [muaProfile, setMuaProfile] = useState<MUAProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  
  const [editForm, setEditForm] = useState({ business_name: '', full_name: '', phone: '', location_city: '', location_address: '', bio: '' });

  // Fungsi untuk mengambil semua data dari Supabase
  const fetchAllData = async () => {
    if (!user) return;
    setPageLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase.from('profiles').select('id, full_name, phone, avatar_url, bio').eq('user_id', user.id).single();
      if (profileError) throw profileError;
      setUserProfile(profile);

      const { data: muaData, error: muaError } = await supabase.from('mua_profiles').select('*').eq('profile_id', profile.id).single();
      if (muaError && muaError.code !== 'PGRST116') throw muaError;
      setMuaProfile(muaData);

      setEditForm({
        business_name: muaData?.business_name || '',
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        location_city: muaData?.location_city || '',
        location_address: muaData?.location_address || '',
        bio: profile.bio || '',
      });

      if (muaData) {
        const { data: bookingsData } = await supabase.from('bookings').select(`id, booking_date, booking_time, status, total_price, customer_notes, profiles!bookings_customer_id_fkey(full_name), services(name)`).eq('mua_profile_id', muaData.id).order('booking_date', { ascending: false });
        setBookings(bookingsData || []);

        // --- INI ADALAH PERBAIKAN UNTUK ERROR TYPESCRIPT ---
        const { data: servicesData, error: servicesError } = await supabase.from('services').select('id, name, price_min, price_max, duration_minutes, is_active, image_url').eq('mua_profile_id', muaData.id).order('name');
        if (servicesError) throw servicesError;
        setServices(servicesData || []);
        
        // Di sini Anda bisa fetch data jadwal jika sudah ada tabelnya
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: "Error", description: "Gagal memuat data profil.", variant: "destructive" });
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
    } else if (!authLoading) {
      setPageLoading(false);
    }
  }, [user, authLoading]);

  // Handle Logout
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({ title: "Gagal Keluar", description: error.message, variant: "destructive" });
    }
  };

  // Fungsi untuk Update Profil
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setPageLoading(true);
    
    const { error: profileError } = await supabase.from('profiles').update({ full_name: editForm.full_name, phone: editForm.phone, bio: editForm.bio }).eq('id', userProfile.id);
    const { error: muaProfileError } = await supabase.from('mua_profiles').update({ business_name: editForm.business_name, location_city: editForm.location_city, location_address: editForm.location_address }).eq('profile_id', userProfile.id);

    if (profileError || muaProfileError) {
      toast({ title: "Error", description: profileError?.message || muaProfileError?.message || "Gagal memperbarui profil.", variant: "destructive" });
    } else {
      toast({ title: "Berhasil!", description: "Profil Anda telah diperbarui." });
      await fetchAllData();
    }
    setPageLoading(false);
  };

  // Fungsi untuk Upload Foto Portofolio
  const handlePortfolioUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !muaProfile) return;
    toast({ description: "Mengunggah foto..." });
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('portfolios').upload(fileName, file);
    if (uploadError) {
      toast({ title: "Gagal Unggah", description: uploadError.message, variant: "destructive" });
      return;
    }
    const { data } = supabase.storage.from('portfolios').getPublicUrl(fileName);
    const updatedImages = [...(muaProfile.portfolio_images || []), data.publicUrl];
    const { error: dbError } = await supabase.from('mua_profiles').update({ portfolio_images: updatedImages }).eq('id', muaProfile.id);
    if (dbError) {
      toast({ title: "Gagal Simpan", description: dbError.message, variant: "destructive" });
    } else {
      toast({ title: "Berhasil", description: "Foto portofolio ditambahkan." });
      fetchAllData();
    }
  };

  if (pageLoading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div>Memuat Profil...</div></div>;
  }
  if (!user) return null;

  // --- Tampilan JSX ---
  return (
    <div className="min-h-screen bg-secondary/20 p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4 mr-2" />Kembali</Button>
          <Button variant="outline" onClick={handleSignOut}>Keluar</Button>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20"><AvatarImage src={userProfile?.avatar_url || ''} /><AvatarFallback><User className="h-10 w-10" /></AvatarFallback></Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{muaProfile?.business_name || userProfile?.full_name}</h1>
                <p className="text-muted-foreground">{muaProfile?.location_city}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="ringkasan" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ringkasan">Ringkasan</TabsTrigger>
            <TabsTrigger value="edit_profil">Edit Profil</TabsTrigger>
            <TabsTrigger value="layanan">Layanan & Portfolio</TabsTrigger>
            <TabsTrigger value="jadwal">Jadwal</TabsTrigger>
          </TabsList>
          
          {/* TAB 1: RINGKASAN & ORDERAN */}
          <TabsContent value="ringkasan">
             <div className="grid gap-4 md:grid-cols-3 mb-8">
              <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Booking</CardTitle><CalendarIcon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{muaProfile?.total_bookings || 0}</div></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Rating</CardTitle><Star className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{muaProfile?.rating?.toFixed(1) || '0.0'}</div></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Layanan Aktif</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{services.filter(s => s.is_active).length}</div></CardContent></Card>
            </div>
            <Card>
              <CardHeader><CardTitle>Pesanan Terbaru</CardTitle></CardHeader>
              <CardContent>
                {/* Kode Tabel Pesanan Anda di sini */}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: EDIT PROFIL */}
          <TabsContent value="edit_profil">
            <form onSubmit={handleProfileUpdate}>
              <Card>
                <CardHeader><CardTitle>Edit Informasi Profil</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2"><Label htmlFor="business_name">Nama Bisnis</Label><Input id="business_name" value={editForm.business_name} onChange={(e) => setEditForm({...editForm, business_name: e.target.value})} /></div>
                      <div className="space-y-2"><Label htmlFor="full_name">Nama Lengkap</Label><Input id="full_name" value={editForm.full_name} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} /></div>
                       <div className="space-y-2"><Label htmlFor="phone">Telepon</Label><Input id="phone" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} /></div>
                       <div className="space-y-2"><Label htmlFor="location_city">Kota</Label><Input id="location_city" value={editForm.location_city} onChange={(e) => setEditForm({...editForm, location_city: e.target.value})} /></div>
                  </div>
                  <div className="space-y-2"><Label htmlFor="location_address">Alamat Lengkap</Label><Textarea id="location_address" value={editForm.location_address} onChange={(e) => setEditForm({...editForm, location_address: e.target.value})} placeholder="Jalan, nomor, kelurahan, kecamatan..."/></div>
                  <div className="space-y-2"><Label htmlFor="bio">Bio / Deskripsi</Label><Textarea id="bio" value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} placeholder="Ceritakan tentang keahlian Anda..."/></div>
                  <div className="flex justify-end"><Button type="submit"><Save className="h-4 w-4 mr-2" />Simpan Perubahan</Button></div>
                </CardContent>
              </Card>
            </form>
          </TabsContent>
          
          {/* TAB 3: LAYANAN & PORTFOLIO */}
          <TabsContent value="layanan" className="space-y-8">
             <Card>
                <CardHeader><CardTitle>Portofolio Carousel</CardTitle><CardDescription>Foto ini akan muncul di halaman detail MUA Anda.</CardDescription></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {(muaProfile?.portfolio_images || []).map((url, index) => (<div key={index} className="relative aspect-square"><img src={url} alt={`Portfolio ${index+1}`} className="w-full h-full object-cover rounded-md" /></div>))}
                    </div>
                    <div><Label htmlFor="portfolio-upload" className="cursor-pointer"><Button asChild variant="outline"><span className="flex items-center gap-2"><Upload className="h-4 w-4"/> Unggah Foto Baru</span></Button></Label><Input id="portfolio-upload" type="file" className="hidden" accept="image/*" onChange={handlePortfolioUpload} /></div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Manajemen Layanan</CardTitle><CardDescription>Atur gaya makeup, harga, dan foto untuk setiap layanan.</CardDescription></div><Button><PlusCircle className="h-4 w-4 mr-2"/> Tambah Layanan</Button></CardHeader>
                <CardContent>
                    {/* Di sini bisa Anda tampilkan daftar layanan dalam bentuk tabel atau card untuk diedit */}
                </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: JADWAL */}
          <TabsContent value="jadwal">
            <Card>
              <CardHeader><CardTitle>Atur Ketersediaan</CardTitle><CardDescription>Klik tanggal untuk menandainya sebagai "tidak tersedia".</CardDescription></CardHeader>
              <CardContent className="flex justify-center">
                 <Calendar mode="multiple" selected={unavailableDates} onSelect={setUnavailableDates} disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} className="p-0" />
              </CardContent>
              <DialogFooter className="p-6 pt-0"><Button>Simpan Jadwal</Button></DialogFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MUAProfile;