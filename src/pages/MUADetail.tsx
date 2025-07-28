// src/pages/MUADetail.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBottomNav } from "@/contexts/BottomNavContext";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Heart, Palette, MessageSquare, ArrowLeft, CheckCircle, X } from "lucide-react";
import BookingModal from "@/components/BookingModal";
import { Skeleton } from "@/components/ui/skeleton";
import ChatPopup from "@/components/ChatPopup";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Tipe Data
interface Service { id: string; name: string; description: string; price_min: number; price_max: number | null; duration_minutes: number | null; image_url: string | null; }
interface Review { id: string; rating: number; review_text: string | null; created_at: string; profiles: { full_name: string | null; avatar_url: string | null; } | null; }
interface MUAProfile { id: string; business_name: string; location_city: string; specializations: string[] | null; rating: number | null; total_reviews: number | null; cover_image_url: string; vehicle_availability: 'none' | 'motorcycle' | 'car'; profiles: { id: string; full_name: string | null; avatar_url: string | null; bio: string | null; } | null; }

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1 text-xs text-muted-foreground">
    {Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
    ))}
  </div>
);

const MUADetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, role } = useAuth();
  const { setBottomNavVisible } = useBottomNav();

  const [mua, setMua] = useState<MUAProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentUserProfileId, setCurrentUserProfileId] = useState<string | null>(null);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const isMobile = useIsMobile();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (isModalOpen || selectedService) {
      setBottomNavVisible(false);
    } else {
      setBottomNavVisible(true);
    }
    return () => setBottomNavVisible(true);
  }, [isModalOpen, selectedService, setBottomNavVisible]);

  const handleSelectService = (service: Service) => {
    setSelectedService(prev => (prev?.id === service.id ? null : service));
  };

  const handleBookingClick = () => {
    if (!selectedService) return;
    if (!user) {
      navigate('/auth', { state: { from: location, action: 'openBookingModal', selectedServiceId: selectedService.id } });
      return;
    }
    if (role === 'mua' && currentUserProfileId === mua?.profiles?.id) {
      toast({ title: "Aksi Tidak Diizinkan", description: "Anda tidak dapat memesan layanan Anda sendiri.", variant: "destructive" });
      return;
    }
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (location.state?.action === 'openBookingModal' && user && services.length > 0) {
      const serviceToRestore = services.find(s => s.id === location.state.selectedServiceId);
      if (serviceToRestore) {
        setSelectedService(serviceToRestore);
        setIsModalOpen(true);
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, user, services, navigate]);

  useEffect(() => {
    const fetchMUADetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data: muaData, error: muaError } = await supabase.from('mua_profiles').select(`*, profiles(id, full_name, avatar_url, bio)`).eq('id', id).single();
        if (muaError || !muaData) throw new Error("MUA tidak ditemukan");
        setMua(muaData as MUAProfile);

        const { data: servicesData, error: servicesError } = await supabase.from('services').select('*').eq('mua_profile_id', id).eq('is_active', true);
        if (servicesError) throw servicesError;
        setServices(servicesData || []);

        const { data: reviewsData, error: reviewsError } = await supabase.from('reviews').select(`*, profiles(full_name, avatar_url)`).eq('mua_profile_id', id).order('created_at', { ascending: false });
        if (reviewsError) throw reviewsError;
        setReviews(reviewsData as Review[] || []);
      } catch (error: any) {
        toast({ title: "Gagal Memuat Data", description: error.message, variant: "destructive" });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchMUADetail();
  }, [id, navigate, toast]);

  useEffect(() => {
    const checkUserAndFavoriteStatus = async () => {
      if (!user) return;
      const { data: profileData } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
      if (profileData) {
        setCurrentUserProfileId(profileData.id);
        if (role === 'customer' && id) {
          const { data } = await supabase.from('favorites').select('id').eq('customer_id', profileData.id).eq('mua_profile_id', id).single();
          setIsFavorited(!!data);
        }
      }
    };
    if (mua) checkUserAndFavoriteStatus();
  }, [user, id, role, mua]);

  const handleFavoriteClick = async () => {
    if (!user) { setShowLoginAlert(true); return; }
    if (role !== 'customer') { toast({ title: "Aksi Tidak Diizinkan", description: "Hanya pelanggan yang dapat memfavoritkan MUA.", variant: "destructive" }); return; }
    if (!currentUserProfileId || !id) return;
    if (isFavorited) {
      await supabase.from('favorites').delete().eq('customer_id', currentUserProfileId).eq('mua_profile_id', id);
      setIsFavorited(false);
    } else {
      const { error } = await supabase.from('favorites').insert({ customer_id: currentUserProfileId, mua_profile_id: id });
      if (!error) {
        setIsFavorited(true);
        setShowLikeAnimation(true);
        setTimeout(() => setShowLikeAnimation(false), 1000);
      } else {
        toast({ title: "Gagal", description: "Mungkin sudah ada di favorit.", variant: "destructive" });
      }
    }
  };

  const handleInitiateChat = async () => {
    if (!user) { setShowLoginAlert(true); return; }
    const muaProfileId = mua?.profiles?.id;
    if (!muaProfileId) { toast({ title: "Error", description: "Profil MUA tidak valid.", variant: "destructive" }); return; }
    if (!currentUserProfileId) { toast({ title: "Error", description: "Profil Anda tidak ditemukan.", variant: "destructive" }); return; }
    if (muaProfileId === currentUserProfileId) { toast({ title: "Aksi Tidak Diizinkan", description: "Anda tidak dapat memulai chat dengan diri sendiri.", variant: "destructive" }); return; }

    try {
        const { data: existing } = await supabase.from('conversations').select('id').contains('participant_ids', [currentUserProfileId, muaProfileId]);
        let conversationId;
        if (existing && existing.length > 0) {
            conversationId = existing[0].id;
        } else {
            const { data: newConversation } = await supabase.from('conversations').insert({ participant_ids: [currentUserProfileId, muaProfileId] }).select('id').single();
            if (!newConversation) throw new Error("Gagal membuat percakapan baru.");
            conversationId = newConversation.id;
        }
        if (isMobile) {
            navigate(`/chat/${conversationId}`);
        } else {
            setActiveConversationId(conversationId);
            setIsChatOpen(true);
        }
    } catch (error: any) {
        toast({ title: "Gagal Memulai Chat", description: error.message, variant: "destructive" });
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  if (loading) { return <div className="min-h-screen bg-background flex justify-center items-center"><p>Loading...</p></div>; }
  if (!mua) return null;

  const safeMua = { ...mua, rating: mua.rating ?? 0, total_reviews: mua.total_reviews ?? 0, specializations: mua.specializations ?? [], profiles: mua.profiles ?? { id: '', full_name: 'Nama MUA', avatar_url: '', bio: 'Bio tidak tersedia.' }};
  const isOwnProfile = role === 'mua' && currentUserProfileId === mua.profiles?.id;

  return (
    <>
      <AlertDialog open={showLoginAlert} onOpenChange={setShowLoginAlert}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Anda Belum Login</AlertDialogTitle><AlertDialogDescription>Untuk dapat memesan, memfavoritkan, atau memulai chat, Anda perlu login atau daftar terlebih dahulu.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Nanti Saja</AlertDialogCancel><AlertDialogAction onClick={() => navigate('/auth', { state: { from: location } })}>Login / Daftar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>

      {showLikeAnimation && (<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 backdrop-blur-sm pointer-events-none"><Heart className="w-32 h-32 text-red-500 fill-red-500 animate-like-popup" /></div>)}

      <div className="min-h-screen bg-background pb-28">
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b"><div className="container mx-auto px-4 flex items-center justify-between h-16"><Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 mr-2" />Kembali</Button><div className="h-10 w-10 rounded-full hover:bg-accent flex items-center justify-center transition-colors cursor-pointer" onClick={handleFavoriteClick} role="button"><Heart className={`w-5 h-5 transition-all ${isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} /></div></div></div>

        <div className="relative">
          <div className="absolute h-64 md:h-96 w-full"><img src={safeMua.cover_image_url} alt={safeMua.business_name} className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" /></div>
          <div className="relative container mx-auto px-4 pt-48 md:pt-72 pb-16">
            <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
              <Avatar className="h-40 w-40 border-4 border-background shadow-lg"><AvatarImage src={safeMua.profiles.avatar_url || ''} /><AvatarFallback className="text-4xl">{safeMua.business_name.charAt(0)}</AvatarFallback></Avatar>
              <div className="flex-1"><h1 className="text-4xl font-bold font-heading">{safeMua.business_name}</h1><p className="text-lg text-muted-foreground mt-1">{safeMua.profiles.full_name}</p><div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground"><div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /><span>{safeMua.rating.toFixed(1)} ({safeMua.total_reviews} ulasan)</span></div><div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /><span>{safeMua.location_city}</span></div></div></div>
              <div className="flex gap-2 w-full md:w-auto self-start md:self-end"><Button variant="outline" size="lg" className="flex-1" onClick={handleInitiateChat}><MessageSquare className="w-4 h-4 mr-2" />Chat</Button></div>
            </div>

            {/* --- INI BAGIAN YANG DIDESAIN ULANG --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card className="border-0 shadow-lg">
                  <CardHeader><CardTitle className="flex items-center gap-3"><Palette className="w-6 h-6 text-primary" />Layanan Makeup</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {services.map(service => {
                        const isSelected = selectedService?.id === service.id;
                        return (
                          <div key={service.id} className={`relative group cursor-pointer transition-all duration-300 transform ${isSelected ? 'scale-105' : 'hover:scale-105'}`} onClick={() => handleSelectService(service)}>
                            <div className={`aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg shadow-md border-2 ${isSelected ? 'border-primary' : 'border-transparent'}`}>
                              <img src={service.image_url || 'https://placehold.co/400x400/png?text=GlamFind'} alt={service.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300"></div>
                              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                <h4 className="font-bold text-sm md:text-base truncate">{service.name}</h4>
                              </div>
                            </div>
                            {isSelected && <div className="absolute -top-2 -right-2 bg-primary rounded-full p-1 shadow-lg"><CheckCircle className="h-5 w-5 text-white" /></div>}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              {/* --- AKHIR DARI BAGIAN DESAIN ULANG --- */}

                <Card className="border-0 shadow-lg">
                  <CardHeader><CardTitle className="flex items-center gap-2"><Star className="w-5 h-5 text-primary" />Ulasan Pelanggan ({reviews.length})</CardTitle></CardHeader>
                  <CardContent className="space-y-6">{reviews.length > 0 ? reviews.map(review => (<div key={review.id} className="flex gap-4"><Avatar><AvatarImage src={review.profiles?.avatar_url || ''} /><AvatarFallback>{review.profiles?.full_name?.charAt(0)}</AvatarFallback></Avatar><div className="flex-1"><div className="flex items-center justify-between"><h4 className="font-semibold">{review.profiles?.full_name}</h4><StarRating rating={review.rating} /></div><p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p><p className="text-sm mt-2">{review.review_text}</p></div></div>)) : (<p className="text-center text-muted-foreground py-8">Belum ada ulasan untuk MUA ini.</p>)}</CardContent>
                </Card>
              </div>
              <div className="lg:col-span-1 space-y-8">
                <Card className="border-0 shadow-lg">
                  <CardHeader><CardTitle>Tentang MUA</CardTitle></CardHeader>
                  <CardContent className="text-muted-foreground text-sm space-y-4"><p>{safeMua.profiles.bio}</p><div><h4 className="font-semibold text-foreground mb-2">Spesialisasi</h4><div className="flex flex-wrap gap-2">{safeMua.specializations.map(spec => (<Badge key={spec} variant="secondary">{spec}</Badge>))}</div></div></CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedService && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t z-30 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.1)]">
          <div className="container mx-auto px-4 py-3 h-[84px] flex items-center">
            <div className="w-full flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{selectedService.name}</p>
                <p className="text-lg font-bold text-primary">{formatCurrency(selectedService.price_min)}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="lg" onClick={() => setSelectedService(null)}><X className="h-4 w-4 mr-2" />Batal</Button>
                <Button size="lg" onClick={handleBookingClick} disabled={isOwnProfile}>Pesan</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isModalOpen && mua && ( <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} muaData={{ id: mua.id, name: mua.business_name }} selectedService={selectedService} /> )}
      {!isMobile && isChatOpen && activeConversationId && ( <ChatPopup conversationId={activeConversationId} onClose={() => setIsChatOpen(false)} /> )}
    </>
  );
};

export default MUADetail;