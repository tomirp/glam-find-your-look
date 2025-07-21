// src/pages/MUAProfile.tsx

import { useState, useEffect, ChangeEvent } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";

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
  
    useEffect(() => {
        const fetchAllData = async () => {
            if (!user) return;
            
            try {
                // 1. Ambil profil pengguna dasar
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, full_name, phone, avatar_url, bio')
                    .eq('user_id', user.id)
                    .single();

                if (profileError) throw profileError;
                setUserProfile(profile);
          
                // 2. Ambil profil MUA yang terhubung
                const { data: muaData, error: muaError } = await supabase
                    .from('mua_profiles')
                    .select('*')
                    .eq('profile_id', profile.id)
                    .single();
        
                // PERBAIKAN UTAMA: Tangani jika profil MUA belum ada
                if (muaError && muaError.code === 'PGRST116') {
                    // PGRST116 berarti 'No rows found'
                    console.log("MUA profile not found, redirecting to onboarding.");
                    navigate('/mua/onboarding');
                    return; // Hentikan eksekusi lebih lanjut
                } else if (muaError) {
                    throw muaError; // Lemparkan error lain
                }

                setMuaProfile(muaData);
          
                // 3. Isi form edit
                setEditForm({
                  business_name: muaData?.business_name || '',
                  full_name: profile.full_name || '',
                  phone: profile.phone || '',
                  location_city: muaData?.location_city || '',
                  location_address: muaData?.location_address || '',
                  bio: profile.bio || '',
                });
          
                // 4. Ambil data booking dan layanan jika profil MUA ada
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
                console.error('Error fetching MUA data:', error);
                toast({ title: "Error", description: "Gagal memuat data profil. Silakan coba lagi.", variant: "destructive" });
                // Arahkan ke halaman utama jika ada error serius
                navigate('/');
            } finally {
                setPageLoading(false);
            }
        };

      if (user) {
        fetchAllData();
      } else if (!authLoading) {
        navigate('/auth', { replace: true });
      }
    }, [user, authLoading, navigate, toast]);
  
    const handleSignOut = async () => {
      await signOut();
      navigate('/');
    };
  
    const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => { /* ... (fungsi tidak berubah) ... */ };
    const handlePortfolioUpload = async (event: ChangeEvent<HTMLInputElement>) => { /* ... (fungsi tidak berubah) ... */ };
    const handleProfileUpdate = async (e: React.FormEvent) => { /* ... (fungsi tidak berubah) ... */ };
  
    if (pageLoading || authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Memuat Profil MUA...</p>
            </div>
        </div>
      );
    }

    if (!user || !userProfile || !muaProfile) {
        // Fallback jika terjadi kondisi aneh, akan diarahkan oleh useEffect
        return <div className="min-h-screen flex items-center justify-center">Mengalihkan...</div>;
    }
  
  function fetchAllData(): void {
    throw new Error("Function not implemented.");
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
                        <TabsTrigger value="jadwal" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 whitespace-nowrap px-4 py-2">Jadwal</TabsTrigger>
                    </TabsList>
                </div>
            </div>
            
            <TabsContent value="dashboard"><DashboardTab bookings={bookings} services={services} onBookingUpdate={fetchAllData} /></TabsContent>
            <TabsContent value="layanan"><ServicesPortfolioTab muaProfile={muaProfile} services={services} onPortfolioUpload={handlePortfolioUpload} onServiceAdded={fetchAllData} onProfileUpdate={fetchAllData} /></TabsContent>
            <TabsContent value="edit_profil"><EditProfileTab editForm={editForm} setEditForm={setEditForm} onSubmit={handleProfileUpdate} /></TabsContent>
            <TabsContent value="chat"><ChatList /></TabsContent>
            <TabsContent value="jadwal"><ScheduleTab unavailableDates={unavailableDates} setUnavailableDates={setUnavailableDates as (dates: Date[]) => void} /></TabsContent>
          </Tabs>
        </div>
      </div>
    );
};

export default MUAProfile;