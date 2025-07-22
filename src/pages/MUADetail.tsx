// src/pages/MUADetail.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Heart, Palette, Clock, MessageSquare, ArrowLeft } from "lucide-react";
import BookingModal from "@/components/BookingModal";
import { Skeleton } from "@/components/ui/skeleton";
import ChatPopup from "@/components/ChatPopup";

// Tipe Data
interface Service {
  id: string;
  name: string;
  description: string;
  price_min: number;
  price_max: number | null;
  duration_minutes: number | null;
  image_url: string | null;
}

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface MUAProfile {
  id: string;
  business_name: string;
  location_city: string;
  specializations: string[] | null;
  rating: number | null;
  total_reviews: number | null;
  cover_image_url: string;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
  } | null;
}

const MUADetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, role } = useAuth();
  
  const [mua, setMua] = useState<MUAProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [isFavorited, setIsFavorited] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  const isMobile = useIsMobile();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);


  useEffect(() => {
    const fetchMUADetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data: muaData, error: muaError } = await supabase
          .from('mua_profiles')
          .select(`*, profiles(id, full_name, avatar_url, bio)`)
          .eq('id', id)
          .single();

        if (muaError || !muaData) {
          toast({ title: "MUA Tidak Ditemukan", description: "Profil MUA yang Anda cari tidak ada atau telah dihapus.", variant: "destructive" });
          navigate('/');
          return;
        }
        setMua(muaData as MUAProfile);

        const { data: servicesData, error: servicesError } = await supabase.from('services').select('*').eq('mua_profile_id', id);
        if (servicesError) toast({ title: "Gagal Memuat Layanan", description: servicesError.message, variant: "destructive" });
        else setServices(servicesData || []);

        const { data: reviewsData, error: reviewsError } = await supabase.from('reviews').select(`*, profiles(full_name, avatar_url)`).eq('mua_profile_id', id).order('created_at', { ascending: false });
        if (reviewsError) toast({ title: "Gagal Memuat Ulasan", description: reviewsError.message, variant: "destructive" });
        else setReviews(reviewsData as Review[] || []);

      } catch (error: any) {
        toast({ title: "Terjadi Kesalahan", description: "Gagal memuat halaman detail MUA.", variant: "destructive" });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchMUADetail();
  }, [id, navigate, toast]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user || role !== 'customer' || !id) return;
      const { data: profileData } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
      if (profileData) {
        setProfileId(profileData.id);
        const { data } = await supabase.from('favorites').select('id').eq('customer_id', profileData.id).eq('mua_profile_id', id).single();
        setIsFavorited(!!data);
      }
    };
    if (mua) {
      checkFavoriteStatus();
    }
  }, [user, id, role, mua]);

  const handleFavoriteClick = async () => {
    if (!user || role !== 'customer') {
      toast({ title: "Login Diperlukan", description: "Anda harus masuk sebagai pelanggan untuk menambahkan favorit.", variant: "destructive" });
      navigate('/auth');
      return;
    }
    if (!profileId || !id) return;
    if (isFavorited) {
      const { error } = await supabase.from('favorites').delete().eq('customer_id', profileId).eq('mua_profile_id', id);
      if (!error) setIsFavorited(false);
    } else {
      const { error } = await supabase.from('favorites').insert({ customer_id: profileId, mua_profile_id: id });
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
    if (!user || !mua?.profiles?.id) {
      toast({ title: "Login Diperlukan", description: "Anda harus login untuk memulai chat.", variant: "destructive" });
      navigate('/auth');
      return;
    }

    const { data: currentUserProfile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
    if (!currentUserProfile) return;

    const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .contains('participant_ids', [currentUserProfile.id, mua.profiles.id])
        .single();

    let conversationId = existingConversation?.id;

    if (!conversationId) {
        const { data: newConversation, error } = await supabase
            .from('conversations')
            .insert({ participant_ids: [currentUserProfile.id, mua.profiles.id] })
            .select('id')
            .single();
        if (error || !newConversation) {
            toast({ title: "Gagal memulai chat", description: error?.message, variant: "destructive"});
            return;
        }
        conversationId = newConversation.id;
    }

    if (isMobile) {
        navigate(`/chat/${conversationId}`);
    } else {
        setActiveConversationId(conversationId);
        setIsChatOpen(true);
    }
  };
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  if (loading) {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-4 border-b h-16 flex items-center">
                <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-64 md:h-96 w-full" />
            <div className="container mx-auto px-4 -mt-24 pb-16">
                <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
                    <Skeleton className="h-40 w-40 rounded-full border-4 border-background" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                    </div>
                </div>
            </div>
        </div>
    );
  }

  if (!mua) {
    return null;
  }

  const safeMua = {
    ...mua,
    rating: mua.rating ?? 0,
    total_reviews: mua.total_reviews ?? 0,
    specializations: mua.specializations ?? [],
    profiles: mua.profiles ?? { id: '', full_name: 'Nama MUA', avatar_url: '', bio: 'Bio tidak tersedia.' }
  };

  return (
    <>
      {showLikeAnimation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 backdrop-blur-sm pointer-events-none">
          <Heart className="w-32 h-32 text-red-500 fill-red-500 animate-like-popup" />
        </div>
      )}
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Kembali
            </Button>
            <div 
              className="h-10 w-10 rounded-full hover:bg-accent flex items-center justify-center transition-colors cursor-pointer" 
              onClick={handleFavoriteClick}
              role="button"
              aria-label="Toggle Favorite"
            >
              <Heart className={`w-5 h-5 transition-all ${isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute h-64 md:h-96 w-full">
            <img src={safeMua.cover_image_url} alt={safeMua.business_name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>

          <div className="relative container mx-auto px-4 pt-48 md:pt-72 pb-16">
            <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
              <Avatar className="h-40 w-40 border-4 border-background shadow-lg">
                <AvatarImage src={safeMua.profiles.avatar_url || ''} />
                <AvatarFallback className="text-4xl">{safeMua.business_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-4xl font-bold font-heading">{safeMua.business_name}</h1>
                <p className="text-lg text-muted-foreground mt-1">{safeMua.profiles.full_name}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /><span>{safeMua.rating.toFixed(1)} ({safeMua.total_reviews} ulasan)</span></div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /><span>{safeMua.location_city}</span></div>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outline" size="lg" className="flex-1" onClick={handleInitiateChat}><MessageSquare className="w-4 h-4 mr-2" />Chat</Button>
                <Button onClick={() => setIsModalOpen(true)} size="lg" className="flex-1">Pesan Sekarang</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card className="border-0 shadow-lg">
                  <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5 text-primary" />Layanan Makeup</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {services.map(service => (
                      <div key={service.id} className="flex gap-4 p-4 bg-accent/30 rounded-lg">
                        <img src={service.image_url || ''} alt={service.name} className="w-24 h-24 object-cover rounded-md" />
                        <div className="flex-1">
                          <h4 className="font-semibold">{service.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <p className="font-bold text-primary">{formatCurrency(service.price_min)}{service.price_max ? ` - ${formatCurrency(service.price_max)}` : ''}</p>
                            {service.duration_minutes && <div className="flex items-center gap-1 text-muted-foreground"><Clock className="w-3.5 h-3.5" /><span>{service.duration_minutes} min</span></div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                  <CardHeader><CardTitle className="flex items-center gap-2"><Star className="w-5 h-5 text-primary" />Ulasan Pelanggan ({reviews.length})</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    {reviews.map(review => (
                      <div key={review.id} className="flex gap-4">
                        <Avatar><AvatarImage src={review.profiles?.avatar_url || ''} /><AvatarFallback>{review.profiles?.full_name?.charAt(0)}</AvatarFallback></Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{review.profiles?.full_name}</h4>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">{[...Array(5)].map((_, i) => (<Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />))}</div>
                          </div>
                          <p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          <p className="text-sm mt-2">{review.review_text}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-8">
                <Card className="border-0 shadow-lg">
                  <CardHeader><CardTitle>Tentang MUA</CardTitle></CardHeader>
                  <CardContent className="text-muted-foreground text-sm space-y-4">
                    <p>{safeMua.profiles.bio}</p>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Spesialisasi</h4>
                      <div className="flex flex-wrap gap-2">{safeMua.specializations.map(spec => (<Badge key={spec} variant="secondary">{spec}</Badge>))}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      
        {!isMobile && isChatOpen && activeConversationId && (
        <ChatPopup 
            conversationId={activeConversationId} 
            onClose={() => setIsChatOpen(false)} 
        />
      )}

      {isModalOpen && mua && (
        <BookingModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          muaData={{ 
            id: mua.id, 
            name: mua.business_name, 
            location: mua.location_city, 
            styles: services.map(s => ({ id: s.id, name: s.name, price: formatCurrency(s.price_min) })) 
          }}
        />
      )}
    </>
  );
};

export default MUADetail;