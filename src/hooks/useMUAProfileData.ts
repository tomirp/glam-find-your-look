import { useState, useEffect, ChangeEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MUAProfile, UserProfile, Booking, Service, EditForm } from "@/components/MUAProfile/types";

export const useMUAProfileData = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [muaProfile, setMuaProfile] = useState<MUAProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  
  const [editForm, setEditForm] = useState<EditForm>({ 
    business_name: '', 
    full_name: '', 
    phone: '', 
    location_city: '', 
    location_address: '', 
    bio: '' 
  });

  const fetchAllData = async () => {
    if (!user) return;
    setPageLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, phone, avatar_url, bio')
        .eq('user_id', user.id)
        .single();
      
      if (profileError) throw profileError;
      setUserProfile(profile);

      const { data: muaData, error: muaError } = await supabase
        .from('mua_profiles')
        .select('*')
        .eq('profile_id', profile.id)
        .single();
      
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
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select(`
            id, booking_date, booking_time, status, total_price, customer_notes, 
            profiles!bookings_customer_id_fkey(full_name), 
            services(name)
          `)
          .eq('mua_profile_id', muaData.id)
          .order('booking_date', { ascending: false });
        
        setBookings(bookingsData || []);

        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('id, name, description, price_min, price_max, duration_minutes, is_active, image_url')
          .eq('mua_profile_id', muaData.id)
          .order('name');
        
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

  const handlePortfolioUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !muaProfile) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: "Error", 
        description: "Ukuran file maksimal 5MB", 
        variant: "destructive" 
      });
      return;
    }

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
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('portfolio')
        .getPublicUrl(fileName);
      
      const updatedImages = [...(muaProfile.portfolio_images || []), data.publicUrl];
      
      const { error: dbError } = await supabase
        .from('mua_profiles')
        .update({ portfolio_images: updatedImages })
        .eq('id', muaProfile.id);
        
      if (dbError) throw dbError;
      
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
    
    event.target.value = '';
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !userProfile) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: "Error", 
        description: "Ukuran file maksimal 5MB", 
        variant: "destructive" 
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({ 
        title: "Error", 
        description: "File harus berupa gambar", 
        variant: "destructive" 
      });
      return;
    }

    toast({ description: "Mengunggah foto profil..." });
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', userProfile.id);
        
      if (dbError) throw dbError;
      
      toast({ 
        title: "Berhasil", 
        description: "Foto profil berhasil diperbarui." 
      });
      
      await fetchAllData();
      
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast({ 
        title: "Gagal Unggah", 
        description: error.message || "Terjadi kesalahan saat mengunggah foto", 
        variant: "destructive" 
      });
    }
    
    event.target.value = '';
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setPageLoading(true);
    
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: editForm.full_name, phone: editForm.phone, bio: editForm.bio })
      .eq('id', userProfile.id);
    
    const { error: muaProfileError } = await supabase
      .from('mua_profiles')
      .update({ business_name: editForm.business_name, location_city: editForm.location_city, location_address: editForm.location_address })
      .eq('profile_id', userProfile.id);

    if (profileError || muaProfileError) {
      toast({ title: "Error", description: profileError?.message || muaProfileError?.message || "Gagal memperbarui profil.", variant: "destructive" });
    } else {
      toast({ title: "Berhasil!", description: "Profil Anda telah diperbarui." });
      await fetchAllData();
    }
    setPageLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
    } else if (!authLoading) {
      setPageLoading(false);
    }
  }, [user, authLoading]);

  return {
    muaProfile,
    userProfile,
    bookings,
    services,
    unavailableDates,
    setUnavailableDates,
    pageLoading,
    authLoading,
    editForm,
    setEditForm,
    fetchAllData,
    handlePortfolioUpload,
    handleAvatarUpload,
    handleProfileUpdate
  };
};