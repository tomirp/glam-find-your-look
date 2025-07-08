
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
import { ArrowLeft, User, Star, MapPin, Phone, Instagram, Calendar as CalendarIcon, DollarSign, Settings, Save, PlusCircle, Upload, Eye, Clock, CheckCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddServiceModal from "@/components/AddServiceModal";

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
  portfolio_images: string[] | null;
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
  description: string | null;
  price_min: number;
  price_max: number | null;
  duration_minutes: number | null;
  is_active: boolean | null;
  image_url: string | null;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'accepted': return 'bg-blue-100 text-blue-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'cancelled': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

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

        const { data: servicesData, error: servicesError } = await supabase.from('services').select('id, name, price_min, price_max, duration_minutes, is_active, image_url').eq('mua_profile_id', muaData.id).order('name');
        if (servicesError) throw servicesError;
        setServices(servicesData || []);
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

  const handlePortfolioUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !muaProfile) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: "Error", 
        description: "Ukuran file maksimal 5MB", 
        variant: "destructive" 
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ 
        title: "Error", 
        description: "File harus berupa gambar", 
        variant: "destructive" 
      });
      return;
    }

    toast({ description: "Mengunggah foto..." });
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `portfolio-${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(fileName, file);
        
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }
      
      const { data } = supabase.storage
        .from('portfolio')
        .getPublicUrl(fileName);
      
      const updatedImages = [...(muaProfile.portfolio_images || []), data.publicUrl];
      
      const { error: dbError } = await supabase
        .from('mua_profiles')
        .update({ portfolio_images: updatedImages })
        .eq('id', muaProfile.id);
        
      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }
      
      toast({ 
        title: "Berhasil", 
        description: "Foto portofolio berhasil ditambahkan." 
      });
      
      await fetchAllData();
      
    } catch (error: any) {
      console.error('Portfolio upload error:', error);
      toast({ 
        title: "Gagal Unggah", 
        description: error.message || "Terjadi kesalahan saat mengunggah foto", 
        variant: "destructive" 
      });
    }
    
    // Reset input
    event.target.value = '';
  };

  if (pageLoading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div><p className="text-gray-600">Memuat Profil...</p></div></div>;
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/")} className="hover:bg-purple-50">
              <ArrowLeft className="h-4 w-4 mr-2" />Kembali ke Beranda
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="border-purple-200 hover:bg-purple-50">
              Keluar
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Profile Header Card */}
        <Card className="mb-8 overflow-hidden border-0 shadow-lg bg-gradient-to-r from-purple-600 to-pink-600">
          <CardContent className="p-8 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={userProfile?.avatar_url || ''} />
                <AvatarFallback className="bg-white text-purple-600 text-2xl font-bold">
                  {userProfile?.full_name?.charAt(0) || <User className="h-12 w-12" />}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <h1 className="text-3xl font-bold">{muaProfile?.business_name || userProfile?.full_name}</h1>
                <div className="flex flex-wrap gap-4 text-white/90">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{muaProfile?.location_city}</span>
                  </div>
                  {userProfile?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{userProfile.phone}</span>
                    </div>
                  )}
                </div>
                {userProfile?.bio && (
                  <p className="text-white/90 max-w-2xl">{userProfile.bio}</p>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="text-center bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{muaProfile?.total_bookings || 0}</div>
                  <div className="text-sm text-white/80">Total Booking</div>
                </div>
                <div className="text-center bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold">{muaProfile?.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <div className="text-sm text-white/80">Rating</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-1">
            <TabsList className="grid w-full grid-cols-4 bg-transparent">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="layanan" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                Layanan & Portfolio
              </TabsTrigger>
              <TabsTrigger value="edit_profil" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                Edit Profil
              </TabsTrigger>
              <TabsTrigger value="jadwal" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                Jadwal
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pesanan Bulan Ini</p>
                      <p className="text-3xl font-bold text-blue-600">{bookings.filter(b => new Date(b.booking_date).getMonth() === new Date().getMonth()).length}</p>
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
                        {formatCurrency(bookings.filter(b => new Date(b.booking_date).getMonth() === new Date().getMonth() && b.status === 'completed').reduce((sum, b) => sum + b.total_price, 0))}
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
          </TabsContent>

          {/* Services & Portfolio Tab */}
          <TabsContent value="layanan" className="space-y-6">
            {/* Portfolio Section */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                  Portfolio Gallery
                </CardTitle>
                <CardDescription>Showcase your best work to attract more clients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {(muaProfile?.portfolio_images || []).map((url, index) => (
                    <div key={index} className="relative aspect-square group">
                      <img 
                        src={url} 
                        alt={`Portfolio ${index+1}`} 
                        className="w-full h-full object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow" 
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                    </div>
                  ))}
                  {(muaProfile?.portfolio_images || []).length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                      <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Belum ada foto portfolio</p>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="portfolio-upload" className="cursor-pointer">
                    <Button asChild variant="outline" className="border-purple-200 hover:bg-purple-50">
                      <span className="flex items-center gap-2">
                        <Upload className="h-4 w-4"/> 
                        Unggah Foto Portfolio
                      </span>
                    </Button>
                  </Label>
                  <Input 
                    id="portfolio-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handlePortfolioUpload} 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Services Section */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-purple-600" />
                    Layanan Makeup
                  </CardTitle>
                  <CardDescription>Kelola paket layanan dan harga Anda</CardDescription>
                </div>
                {muaProfile && (
                  <AddServiceModal 
                    muaProfileId={muaProfile.id} 
                    onServiceAdded={fetchAllData}
                  />
                )}
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {services.map(service => (
                    <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-4 flex-1">
                        {service.image_url && (
                          <img 
                            src={service.image_url} 
                            alt={service.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-medium">{service.name}</h4>
                            <Badge variant={service.is_active ? "default" : "secondary"}>
                              {service.is_active ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </div>
                          {service.description && (
                            <p className="text-sm text-gray-600 mb-1">{service.description}</p>
                          )}
                          <p className="text-sm text-gray-600">
                            {formatCurrency(service.price_min)} 
                            {service.price_max && ` - ${formatCurrency(service.price_max)}`}
                          </p>
                          {service.duration_minutes && (
                            <p className="text-xs text-gray-500">{service.duration_minutes} menit</p>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  ))}
                  {services.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Belum ada layanan ditambahkan</p>
                      <p className="text-sm mt-2">Klik tombol "Tambah Layanan" untuk memulai</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edit Profile Tab */}
          <TabsContent value="edit_profil">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  Edit Profil
                </CardTitle>
                <CardDescription>Update informasi profil dan bisnis Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="business_name">Nama Bisnis</Label>
                      <Input 
                        id="business_name" 
                        value={editForm.business_name} 
                        onChange={(e) => setEditForm({...editForm, business_name: e.target.value})}
                        className="border-gray-200 focus:border-purple-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nama Lengkap</Label>
                      <Input 
                        id="full_name" 
                        value={editForm.full_name} 
                        onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                        className="border-gray-200 focus:border-purple-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input 
                        id="phone" 
                        value={editForm.phone} 
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="border-gray-200 focus:border-purple-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location_city">Kota</Label>
                      <Input 
                        id="location_city" 
                        value={editForm.location_city} 
                        onChange={(e) => setEditForm({...editForm, location_city: e.target.value})}
                        className="border-gray-200 focus:border-purple-400"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location_address">Alamat Lengkap</Label>
                    <Textarea 
                      id="location_address" 
                      value={editForm.location_address} 
                      onChange={(e) => setEditForm({...editForm, location_address: e.target.value})}
                      placeholder="Jalan, nomor, kelurahan, kecamatan..."
                      className="border-gray-200 focus:border-purple-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio / Deskripsi</Label>
                    <Textarea 
                      id="bio" 
                      value={editForm.bio} 
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      placeholder="Ceritakan tentang keahlian dan pengalaman Anda..."
                      className="border-gray-200 focus:border-purple-400"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Perubahan
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Schedule Tab */}
          <TabsContent value="jadwal">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-purple-600" />
                  Atur Ketersediaan
                </CardTitle>
                <CardDescription>Kelola jadwal dan ketersediaan Anda</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar 
                  mode="multiple" 
                  selected={unavailableDates} 
                  onSelect={setUnavailableDates} 
                  disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} 
                  className="p-0 border rounded-lg" 
                />
              </CardContent>
              <div className="p-6 pt-0 flex justify-end">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Simpan Jadwal
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MUAProfile;
