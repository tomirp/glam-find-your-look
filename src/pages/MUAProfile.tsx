// src/pages/MUAProfile.tsx

import { useState, useEffect, ChangeEvent, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, LogOut, MessageSquare } from "lucide-react";
import { DashboardTab } from "@/components/MUAProfile/DashboardTab";
import { ServicesPortfolioTab } from "@/components/MUAProfile/ServicesPortfolioTab";
import { EditProfileTab } from "@/components/MUAProfile/EditProfileTab";
import { ScheduleTab } from "@/components/MUAProfile/ScheduleTab";
import { ProfileHeader } from "@/components/MUAProfile/ProfileHeader";
import ChatList from "@/components/MUAProfile/ChatList";
import type { MUAProfile as MUAProfileType, UserProfile, Booking, Service, EditForm } from "@/components/MUAProfile/types";
import EarningsTab from "@/components/MUAProfile/EarningsTab"; // PERUBAHAN: Impor komponen baru
import { DollarSign } from "lucide-react"; // PERUBAHAN: Impor ikon

const MUAProfile = () => {
    const { user, loading: authLoading, signOut } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
  
    const [muaProfile, setMuaProfile] = useState<MUAProfileType | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    
    const [editForm, setEditForm] = useState<EditForm>({ business_name: '', full_name: '', phone: '', location_city: '', location_address: '', bio: '' });
    const [activeTab, setActiveTab] = useState("dashboard");
  
    const fetchAllData = useCallback(async () => {
      if (!user) return;
      try {
        const { data: profile, error: profileError } = await supabase.from('profiles').select('id, full_name, phone, avatar_url, bio').eq('user_id', user.id).single();
        if (profileError) throw profileError;
        setUserProfile(profile);
  
        const { data: muaData, error: muaError } = await supabase.from('mua_profiles').select('*').eq('profile_id', profile.id).single();
        if (muaError && muaError.code === 'PGRST116') {
            navigate('/mua/onboarding');
            return;
        } else if (muaError) {
            throw muaError;
        }
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
          const { data: bookingsData, error: bookingError } = await supabase
            .from('bookings')
            .select(`id, booking_date, booking_time, status, total_price, customer_notes, profiles!bookings_customer_id_fkey(full_name), services(name), payments!left(payment_status)`)
            .eq('mua_profile_id', muaData.id)
            .order('booking_date', { ascending: false });
          if(bookingError) throw bookingError;
          const typedBookings = bookingsData.map(b => ({...b, payments: Array.isArray(b.payments) ? b.payments[0] : b.payments})) as Booking[];
          setBookings(typedBookings);
  
          const { data: servicesData, error: servicesError } = await supabase.from('services').select('*').eq('mua_profile_id', muaData.id).order('name');
          if (servicesError) throw servicesError;
          setServices(servicesData || []);
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({ title: "Error", description: "Gagal memuat data profil.", variant: "destructive" });
        navigate('/');
      } finally {
        setPageLoading(false);
      }
    }, [user, navigate, toast]);

    useEffect(() => {
      if (user) {
        fetchAllData();
      } else if (!authLoading) {
        navigate('/auth', { replace: true });
      }
    }, [user, authLoading, navigate, fetchAllData]);
  
    const handleSignOut = async () => {
      await signOut();
      navigate('/');
    };
  
    const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files || event.target.files.length === 0 || !user || !userProfile) return;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      toast({ description: "Mengunggah foto profil..." });
      try {
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        const publicUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`;
        const { error: dbError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userProfile.id);
        if (dbError) throw dbError;
        toast({ title: "Berhasil!", description: "Foto profil telah diperbarui." });
        await fetchAllData();
      } catch (error: any) {
        toast({ title: "Gagal", description: error.message, variant: "destructive" });
      }
    };
    
    const handlePortfolioUpload = async (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files || event.target.files.length === 0 || !user || !muaProfile) return;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      toast({ description: "Mengunggah portofolio..." });
      try {
        const { error: uploadError } = await supabase.storage.from('portfolio').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('portfolio').getPublicUrl(filePath);
        const updatedImages = [...(muaProfile.portfolio_images || []), data.publicUrl];
        const { error: dbError } = await supabase.from('mua_profiles').update({ portfolio_images: updatedImages }).eq('id', muaProfile.id);
        if (dbError) throw dbError;
        toast({ title: "Berhasil!", description: "Portofolio telah ditambahkan." });
        await fetchAllData();
      } catch (error: any) {
         toast({ title: "Gagal", description: error.message, variant: "destructive" });
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
  
    if (pageLoading || authLoading) {
      return <div className="min-h-screen flex items-center justify-center">Memuat Profil MUA...</div>;
    }

    if (!user || !userProfile || !muaProfile) {
        return <div className="min-h-screen flex items-center justify-center">Mengalihkan...</div>;
    }
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary/20">
        <div className="bg-card shadow-sm border-b border-border sticky top-0 z-20">
          <div className="container mx-auto max-w-6xl px-4 py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Beranda</span></Button>
              <Button variant="outline" onClick={handleSignOut}><LogOut className="h-4 w-4 mr-2 sm:mr-2" /><span className="hidden sm:inline">Keluar</span></Button>
            </div>
          </div>
        </div>
  
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <ProfileHeader 
            muaProfile={muaProfile} 
            userProfile={userProfile} 
            onAvatarUpload={handleAvatarUpload}
          />
  
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="relative scroll-shadows bg-card rounded-xl shadow-sm border border-border p-2">
                <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <TabsList className="bg-transparent p-1 inline-flex">
                        <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 whitespace-nowrap px-4 py-2">Dashboard</TabsTrigger>
                        <TabsTrigger value="layanan" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 whitespace-nowrap px-4 py-2">Layanan & Portfolio</TabsTrigger>
                        <TabsTrigger value="edit_profil" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 whitespace-nowrap px-4 py-2">Edit Profil</TabsTrigger>
                        <TabsTrigger value="chat" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 whitespace-nowrap px-4 py-2"><MessageSquare className="h-4 w-4 mr-2" />Chat Pelanggan</TabsTrigger>
                        <TabsTrigger value="pendapatan" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 whitespace-nowrap px-4 py-2">
                          <DollarSign className="h-4 w-4 mr-2" />Pendapatan
                        </TabsTrigger>
                        <TabsTrigger value="jadwal" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 whitespace-nowrap px-4 py-2">Jadwal</TabsTrigger>
                    </TabsList>
                </div>
            </div>
            
            <TabsContent value="dashboard"><DashboardTab bookings={bookings} services={services} onBookingUpdate={fetchAllData} /></TabsContent>
            <TabsContent value="layanan"><ServicesPortfolioTab muaProfile={muaProfile} services={services} onPortfolioUpload={handlePortfolioUpload} onServiceAdded={fetchAllData} onProfileUpdate={fetchAllData} /></TabsContent>
            <TabsContent value="edit_profil"><EditProfileTab editForm={editForm} setEditForm={setEditForm} onSubmit={handleProfileUpdate} /></TabsContent>
            <TabsContent value="chat"><ChatList /></TabsContent>
            {/* PERUBAHAN: Tambahkan TabsContent untuk Pendapatan */}
            <TabsContent value="pendapatan">
              <EarningsTab muaProfileId={muaProfile?.id || null} />
            </TabsContent>
            <TabsContent value="jadwal"><ScheduleTab muaProfile={muaProfile} /></TabsContent>
          </Tabs>
        </div>
      </div>
    );
};

// **PERBAIKAN UTAMA: Pastikan baris ini ada di akhir file**
export default MUAProfile;