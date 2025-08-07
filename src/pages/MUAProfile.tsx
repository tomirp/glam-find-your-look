// src/pages/MUAProfile.tsx

import { useState, useEffect, ChangeEvent, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUploadProgress } from "@/hooks/useUploadProgress";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, LogOut, MessageSquare, DollarSign, Star as StarIcon, Calendar, User, Edit } from "lucide-react";
import { DashboardTab } from "@/components/MUAProfile/DashboardTab";
import { ServicesPortfolioTab } from "@/components/MUAProfile/ServicesPortfolioTab";
import { EditProfileTab } from "@/components/MUAProfile/EditProfileTab";
import { ScheduleTab } from "@/components/MUAProfile/ScheduleTab";
import { ProfileHeader } from "@/components/MUAProfile/ProfileHeader";
import ChatList from "@/components/MUAProfile/ChatList";
import type { MUAProfile as MUAProfileType, UserProfile, Booking, Service, EditForm } from "@/components/MUAProfile/types";
import ReviewsTab from "@/components/MUAProfile/ReviewsTab";
import EarningsTab from "@/components/MUAProfile/EarningsTab";
import { LoaderCircle, Save } from "lucide-react";

const MUAProfile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const avatarUpload = useUploadProgress();
  const portfolioUpload = useUploadProgress();

  const [muaProfile, setMuaProfile] = useState<MUAProfileType | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [editForm, setEditForm] = useState<EditForm>({
    business_name: '', full_name: '', phone: '', location_city: '',
    location_address: '', bio: '', vehicle_availability: 'none'
  });

  const queryParams = new URLSearchParams(location.search);
  const [activeTab, setActiveTab] = useState(queryParams.get('tab') || "dashboard");

  useEffect(() => {
    navigate(`?tab=${activeTab}`, { replace: true });
  }, [activeTab, navigate]);

  const fetchAllData = useCallback(async () => {
    if (!user) return;
    setPageLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase.from('profiles').select('id, full_name, phone, avatar_url, bio').eq('user_id', user.id).single();
      if (profileError) throw new Error("Gagal mengambil profil pengguna.");
      setUserProfile(profile);

      const { data: muaData, error: muaError } = await supabase.from('mua_profiles').select('*').eq('profile_id', profile.id).single();
      if (muaError) {
        if (muaError.code === 'PGRST116') {
          navigate('/mua/onboarding');
          return;
        }
        throw new Error("Gagal mengambil profil MUA.");
      }
      setMuaProfile(muaData);

      setEditForm({
        business_name: muaData?.business_name || '',
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        location_city: muaData?.location_city || '',
        location_address: muaData?.location_address || '',
        bio: profile.bio || '',
        vehicle_availability: muaData?.vehicle_availability || 'none'
      });

      if (muaData) {
        const { data: bookingsData, error: bookingError } = await supabase.from('bookings').select(`*, profiles!bookings_customer_id_fkey(full_name), services(name), payments!left(payment_status)`).eq('mua_profile_id', muaData.id).order('booking_date', { ascending: false });
        if(bookingError) throw bookingError;

        const typedBookings = bookingsData.map(b => ({...b, payments: Array.isArray(b.payments) ? b.payments[0] : b.payments })) as Booking[];
        setBookings(typedBookings);

        const { data: servicesData, error: servicesError } = await supabase.from('services').select('*').eq('mua_profile_id', muaData.id).order('name');
        if (servicesError) throw servicesError;
        setServices(servicesData || []);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({ title: "Error", description: error.message || "Gagal memuat data profil.", variant: "destructive" });
      if (error.message !== "Gagal mengambil profil MUA.") {
         navigate('/');
      }
    } finally {
      setPageLoading(false);
    }
  }, [user, navigate, toast]);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchAllData();
      } else {
        navigate('/auth', { replace: true });
      }
    }
  }, [user, authLoading, navigate, fetchAllData]);

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Berhasil!", description: "Anda telah keluar dari akun MUA Anda." });
    navigate('/');
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userProfile) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${userProfile.id}/${fileName}`;

      const publicUrl = await avatarUpload.uploadFile('avatars', filePath, file, { upsert: true });

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userProfile.id);

      if (error) throw error;

      toast({ title: "Berhasil!", description: "Avatar telah diperbarui." });
      await fetchAllData();
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    }
  };

  const handlePortfolioUpload = async (imageUrl: string) => {
    if (!muaProfile) return;

    try {
      const currentImages = muaProfile.portfolio_images || [];
      const updatedImages = [...currentImages, imageUrl];

      const { error } = await supabase
        .from('mua_profiles')
        .update({ portfolio_images: updatedImages })
        .eq('id', muaProfile.id);

      if (error) throw error;

      toast({ title: "Berhasil!", description: "Foto portfolio telah ditambahkan." });
      await fetchAllData();
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    }
  };

  // --- PERUBAHAN LOGIKA LOADING DIMULAI DI SINI ---
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setIsSavingProfile(true); // 1. Mulai loading
    try {
        const { error: profileError } = await supabase.from('profiles').update({ full_name: editForm.full_name, phone: editForm.phone, bio: editForm.bio }).eq('id', userProfile.id);
        if (profileError) throw profileError;

        const { error: muaProfileError } = await supabase.from('mua_profiles').update({
            business_name: editForm.business_name,
            location_city: editForm.location_city,
            location_address: editForm.location_address,
            vehicle_availability: editForm.vehicle_availability
        }).eq('profile_id', userProfile.id);
        if (muaProfileError) throw muaProfileError;

        toast({ title: "Berhasil!", description: "Profil Anda telah diperbarui." });
        await fetchAllData();
    } catch(error: any) {
        toast({ title: "Error", description: error.message || "Gagal memperbarui profil.", variant: "destructive" });
    } finally {
        setIsSavingProfile(false); // 2. Selesai loading
    }
  };
  // --- AKHIR DARI PERUBAHAN LOGIKA LOADING ---

  if (pageLoading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat Profil MUA...</div>;
  }

  if (!user || !userProfile || !muaProfile) {
    if(user && userProfile && !muaProfile) navigate('/mua/onboarding');
    return <div className="min-h-screen flex items-center justify-center">Mengalihkan...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="container mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4 mr-2" />Beranda</Button>
            <Button variant="outline" onClick={handleSignOut}><LogOut className="h-4 w-4 mr-2" />Keluar</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <ProfileHeader
          muaProfile={muaProfile}
          userProfile={userProfile}
          onAvatarUpload={handleAvatarUpload}
          avatarUploading={avatarUpload.uploading}
          avatarProgress={avatarUpload.progress}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none]">
            <TabsList className="bg-gray-100 p-1 inline-flex rounded-lg">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="layanan">Layanan & Portfolio</TabsTrigger>
              <TabsTrigger value="ulasan">Ulasan</TabsTrigger>
              <TabsTrigger value="pendapatan">Pendapatan</TabsTrigger>
              <TabsTrigger value="jadwal">Jadwal</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="edit_profil">Edit Profil</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard"><DashboardTab bookings={bookings} services={services} onBookingUpdate={fetchAllData} /></TabsContent>
          <TabsContent value="layanan">
            <ServicesPortfolioTab 
              muaProfile={muaProfile} 
              services={services} 
              onPortfolioUpload={handlePortfolioUpload} 
              onRefreshData={fetchAllData}
            />
          </TabsContent>
          <TabsContent value="ulasan"><ReviewsTab muaProfileId={muaProfile?.id || null} /></TabsContent>
          <TabsContent value="pendapatan"><EarningsTab muaProfileId={muaProfile?.id || null} /></TabsContent>
          <TabsContent value="jadwal"><ScheduleTab muaProfile={muaProfile} /></TabsContent>
          <TabsContent value="chat"><ChatList /></TabsContent>
          
          {/* --- PERUBAHAN PROPS DI SINI --- */}
          <TabsContent value="edit_profil">
            <EditProfileTab 
              editForm={editForm} 
              setEditForm={setEditForm} 
              onSubmit={handleProfileUpdate}
              isSaving={isSavingProfile} // 3. Teruskan state loading ke komponen
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MUAProfile;