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

  // --- TAMBAHAN BARU: State untuk menyimpan data awal saat mengubah jadwal ---
  const [initialBookingData, setInitialBookingData] = useState(null);
  // -------------------------------------------------------------------------

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
    // --- PERBAIKAN: Pastikan data awal kosong untuk booking baru ---
    setInitialBookingData(null); 
    // ----------------------------------------------------------
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

  // --- TAMBAHAN BARU: useEffect untuk menangani permintaan "Ubah Jadwal" ---
  useEffect(() => {
    const { state } = location;
    // Cek apakah ada permintaan untuk membuka kembali modal dari halaman checkout
    if (state?.reopenBookingModal && state?.service) {
      setSelectedService(state.service);
      setInitialBookingData(state.initialData);
      setIsModalOpen(true);
      
      // Hapus state dari histori agar tidak terbuka lagi saat refresh atau kembali
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);
  // -------------------------------------------------------------------------

  useEffect(() => {
    const fetchMUADetail = async () => {
      // ... (fungsi fetchMUADetail tidak berubah)
    };
    fetchMUADetail();
  }, [id, navigate, toast]);

  useEffect(() => {
    const checkUserAndFavoriteStatus = async () => {
      // ... (fungsi checkUserAndFavoriteStatus tidak berubah)
    };
    if (mua) checkUserAndFavoriteStatus();
  }, [user, id, role, mua]);

  const handleFavoriteClick = async () => {
    // ... (fungsi handleFavoriteClick tidak berubah)
  };

  const handleInitiateChat = async () => {
    // ... (fungsi handleInitiateChat tidak berubah)
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  if (loading) { return <div className="min-h-screen bg-background flex justify-center items-center"><p>Loading...</p></div>; }
  if (!mua) return null;

  const safeMua = { ...mua, rating: mua.rating ?? 0, total_reviews: mua.total_reviews ?? 0, specializations: mua.specializations ?? [], profiles: mua.profiles ?? { id: '', full_name: 'Nama MUA', avatar_url: '', bio: 'Bio tidak tersedia.' }};
  const isOwnProfile = role === 'mua' && currentUserProfileId === mua.profiles?.id;

  return (
    <>
      {/* ... (AlertDialog, showLikeAnimation, dan JSX lainnya tidak berubah) ... */}
      
      {/* --- PERBAIKAN: Teruskan `initialData` ke BookingModal --- */}
      {isModalOpen && mua && ( 
        <BookingModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          muaData={{ id: mua.id, business_name: mua.business_name, avatar_url: mua.profiles?.avatar_url }} 
          selectedService={selectedService}
          initialData={initialBookingData} // <-- Teruskan data jadwal awal di sini
        /> 
      )}
      {/* ------------------------------------------------------ */}
      
      {!isMobile && isChatOpen && activeConversationId && ( <ChatPopup conversationId={activeConversationId} onClose={() => setIsChatOpen(false)} /> )}
    </>
  );
};

export default MUADetail;