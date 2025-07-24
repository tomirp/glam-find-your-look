// src/pages/CustomerProfile.tsx

import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, User, Star, MapPin, Phone, Save, CreditCard, Wallet, QrCode, PlusCircle, ShieldCheck, Clock, Calendar, Heart, Settings, BookOpen, LogOut, MessageSquare, ArrowRight } from "lucide-react";
import MUACard, { MUAProfileForCard } from "@/components/MUACard";
import MUACardSkeleton from "@/components/MUACardSkeleton";
import { SearchingReplacementCard } from "@/components/SearchingReplacementCard";
import CustomerChatList from "@/components/CustomerProfile/ChatList";
import ChatPopup from "@/components/ChatPopup";

// Tipe Data
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

// Fungsi Helper
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
  const isMobile = useIsMobile();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [favorites, setFavorites] = useState<MUAProfileForCard[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [editForm, setEditForm] = useState({ full_name: "", phone: "", address: "" });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    if (!user) return;
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
  }, [user, toast]);

  const fetchFavorites = useCallback(async () => {
    if (!profile) return;
    setLoadingFavorites(true);
    try {
        const { data, error } = await supabase
            .from('favorites')
            .select(`mua_profiles (id, business_name, rating, total_reviews, location_city, specializations, cover_image_url)`)
            .eq('customer_id', profile.id);

        if (error) throw error;
        const favoriteMUAProfiles = data.map(fav => fav.mua_profiles).filter(Boolean);
        setFavorites(favoriteMUAProfiles as MUAProfileForCard[]);

    } catch (error: any) {
        toast({ title: "Error", description: "Gagal memuat MUA favorit.", variant: "destructive" });
    } finally {
        setLoadingFavorites(false);
    }
  }, [profile, toast]);

  useEffect(() => {
    if (user && !authLoading) { fetchAllData(); }
  }, [user, authLoading, fetchAllData]);

  useEffect(() => {
    if (profile) { fetchFavorites(); }
  }, [profile, fetchFavorites]);
  
  useEffect(() => {
    if (!authLoading && !user) { navigate('/', { replace: true }); }
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
      await fetchAllData();
    }
    setPageLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    // PERBAIKAN: Menambahkan notifikasi toast setelah berhasil logout
    toast({
      title: "Berhasil!",
      description: "Anda telah keluar dari akun Anda.",
    });
    navigate("/");
  };
  
  const handleConversationSelect = (conversationId: string) => {
    if (isMobile) {
      navigate(`/chat/${conversationId}`);
    } else {
      setActiveConversationId(conversationId);
      setIsChatOpen(true);
    }
  };
  
  if (pageLoading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div><p className="text-gray-600">Memuat Profil Anda...</p></div></div>;
  }
  
  if (!user || !profile) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="container mx-auto max-w-5xl px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Kembali</span></Button>
            <h2 className="text-lg font-semibold">Profil Saya</h2>
            <Button variant="ghost" size="icon" onClick={handleSignOut}><LogOut className="h-5 w-5" /></Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <Avatar className="h-24 w-24 border-4 border-white shadow-lg"><AvatarImage src={profile.avatar_url || ''} /><AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">{profile.full_name?.charAt(0) || <User className="h-10 w-10" />}</AvatarFallback></Avatar>
          <div className="flex-1 space-y-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading">{profile.full_name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center sm:justify-start text-sm text-muted-foreground">
              {profile.phone && ( <div className="flex items-center gap-2"> <Phone className="h-4 w-4" /> <span>{profile.phone}</span> </div> )}
              {profile.address && ( <div className="flex items-center gap-2"> <MapPin className="h-4 w-4" /> <span>{profile.address}</span> </div> )}
            </div>
          </div>
          <div className="flex flex-row gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{bookings.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Booking</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{reviews.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Ulasan</div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="riwayat" className="w-full">
          <div className="overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none]">
              <TabsList className="bg-gray-100 p-1 inline-flex rounded-lg">
                  <TabsTrigger value="riwayat"><BookOpen className="h-4 w-4 mr-2" />Riwayat</TabsTrigger>
                  <TabsTrigger value="ulasan"><Star className="h-4 w-4 mr-2" />Ulasan</TabsTrigger>
                  <TabsTrigger value="percakapan"><MessageSquare className="h-4 w-4 mr-2" />Percakapan</TabsTrigger>
                  <TabsTrigger value="favorit"><Heart className="h-4 w-4 mr-2" />Favorit</TabsTrigger>
                  <TabsTrigger value="profil"><Settings className="h-4 w-4 mr-2" />Profil</TabsTrigger>
              </TabsList>
          </div>

          <TabsContent value="riwayat" className="mt-6">
            <div className="space-y-4">
              {bookings.length > 0 ? (
                bookings.map(booking => (
                  booking.status === 'rejected' ? (
                    <SearchingReplacementCard key={booking.id} booking={booking} />
                  ) : (
                    <div key={booking.id} className="p-4 sm:p-6 bg-white rounded-xl border">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold font-heading text-lg text-foreground truncate">{booking.mua_profiles?.business_name || 'N/A'}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{booking.services?.name || 'N/A'}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(booking.booking_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          </div>
                        </div>
                        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="flex flex-col items-start sm:items-end gap-2">
                            <Badge className={`${getStatusColor(booking.status)} border`}>{booking.status}</Badge>
                            <p className="font-bold text-lg text-primary sm:mt-1 text-right whitespace-nowrap">{formatCurrency(booking.total_price)}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/confirmation', { state: { bookingId: booking.id } })}
                            className="w-full sm:w-auto"
                          >
                            Lihat Invoice
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                ))
              ) : ( 
                <div className="text-center py-16 text-muted-foreground bg-gray-50 rounded-lg">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Belum ada riwayat pesanan.</p>
                  <p className="text-sm mb-6">Mulai booking makeup artist favorit Anda!</p>
                  <Button onClick={() => navigate("/")}>Mulai Booking Sekarang</Button>
                </div> 
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="ulasan" className="mt-6">
            <div className="space-y-4">
              {reviews.length > 0 ? reviews.map(review => ( <Card key={review.id} className="bg-white"><CardContent className="p-6"><div className="flex justify-between items-start mb-4"><div><h4 className="font-semibold text-foreground font-heading">{review.mua_profiles?.business_name || 'N/A'}</h4><p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString('id-ID')}</p></div><div className="flex items-center gap-1 bg-gray-100 rounded-full px-4 py-2 shadow-sm border">{[...Array(5)].map((_, i) => (<Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />))}<span className="ml-2 text-sm font-bold">{review.rating}</span></div></div>{review.review_text && (<p className="text-foreground text-sm italic leading-relaxed">"{review.review_text}"</p>)}</CardContent></Card> )) : ( <div className="text-center py-16 text-muted-foreground bg-gray-50 rounded-lg"><Heart className="h-16 w-16 mx-auto mb-4 opacity-50" /><p className="text-lg font-medium mb-2">Anda belum memberikan ulasan.</p><p className="text-sm">Setelah booking selesai, berikan ulasan Anda di sini!</p></div> )}
            </div>
          </TabsContent>
          
          <TabsContent value="percakapan" className="mt-6">
            <CustomerChatList onConversationSelect={handleConversationSelect} />
          </TabsContent>

          <TabsContent value="favorit" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">{loadingFavorites ? ( Array.from({ length: 2 }).map((_, index) => <MUACardSkeleton key={index} />) ) : favorites.length > 0 ? ( favorites.map(mua => ( <Link key={mua.id} to={`/mua/${mua.id}`}><MUACard {...mua} /></Link> )) ) : ( <div className="text-center py-16 text-muted-foreground col-span-2 bg-gray-50 rounded-lg"><Heart className="h-16 w-16 mx-auto mb-4 opacity-50" /><p className="text-lg font-medium mb-2">Anda belum memiliki MUA favorit.</p><p className="text-sm">Klik ikon hati pada MUA yang Anda sukai untuk menyimpannya di sini.</p></div> )}</div>
          </TabsContent>

          <TabsContent value="profil" className="mt-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 font-heading">Edit Profil</CardTitle><CardDescription>Update informasi personal Anda.</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="space-y-2"><Label htmlFor="full_name">Nama Lengkap</Label><Input id="full_name" value={editForm.full_name} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} className="h-12"/></div>
                  <div className="space-y-2"><Label htmlFor="phone">Nomor Telepon</Label><Input id="phone" value={editForm.phone || ''} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} placeholder="08XXXXXXXXXX" className="h-12"/></div>
                  <div className="space-y-2"><Label htmlFor="address">Alamat</Label><Textarea id="address" value={editForm.address || ''} onChange={(e) => setEditForm({...editForm, address: e.target.value})} placeholder="Alamat lengkap Anda..." rows={4} className="resize-none"/></div>
                  <div className="flex justify-end pt-2"><Button type="submit" className="h-12 px-8"><Save className="h-4 w-4 mr-2"/>Simpan Perubahan</Button></div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {isChatOpen && activeConversationId && (
        <ChatPopup 
          conversationId={activeConversationId} 
          onClose={() => {
            setIsChatOpen(false);
            setActiveConversationId(null);
          }} 
        />
      )}
    </div>
  );
};

export default CustomerProfile;