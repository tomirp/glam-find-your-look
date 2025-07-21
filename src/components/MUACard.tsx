// src/components/MUACard.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export interface MUAProfileForCard {
  id?: string;
  business_name: string | null;
  rating: number | null;
  total_reviews: number | null;
  location_city: string;
  specializations: string[] | null;
  price_range?: string | null;
  isPopular?: boolean;
  cover_image_url: string | null;
}

const MUACard = ({ id, business_name, rating, total_reviews, location_city, price_range, isPopular = false, cover_image_url }: MUAProfileForCard) => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

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
    checkFavoriteStatus();
  }, [user, id, role]);

  const handleFavoriteClick = async (event: React.MouseEvent) => {
    event.preventDefault(); 
    event.stopPropagation();

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
        // Memicu animasi saat berhasil memfavoritkan
        setShowLikeAnimation(true);
        // Sembunyikan animasi setelah 1 detik (sesuai durasi animasi)
        setTimeout(() => setShowLikeAnimation(false), 1000); 
      } else {
        toast({ title: "Gagal", description: "Mungkin MUA ini sudah ada di daftar favorit Anda.", variant: "destructive" });
      }
    }
  };

  const nameText = business_name || 'MUA Profesional';
  const priceText = price_range || 'Harga bersaing';
  const duplicatedPriceText = `${priceText} \u00A0 | \u00A0 ${priceText}`;

  return (
    <>
      {/* Elemen baru untuk animasi pop-up di tengah layar */}
      {showLikeAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm pointer-events-none">
          <Heart className="w-32 h-32 text-red-500 fill-red-500 animate-like-popup" />
        </div>
      )}

      <Card className="hover:shadow-lg transition-shadow cursor-pointer border-border group h-full flex flex-col">
        <CardContent className="p-0 flex flex-col flex-grow">
          <div className="relative aspect-square bg-gradient-to-br from-primary/20 to-secondary/30 rounded-t-lg overflow-hidden">
            {cover_image_url ? <img src={cover_image_url} alt={nameText} className="h-full w-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center"><span className="text-xl font-bold text-primary">{nameText.charAt(0)}</span></div></div>}
            {isPopular && (<Badge className="absolute top-2 left-2 text-xs">Popular</Badge>)}
            
            {/* PERBAIKAN UTAMA: Menggunakan <div>, bukan <Button>, untuk menghilangkan blok kotak */}
            <div 
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 hover:bg-background flex items-center justify-center transition-colors" 
              onClick={handleFavoriteClick}
              role="button"
              aria-label="Toggle Favorite"
            >
              <Heart className={`w-4 h-4 transition-all ${isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
            </div>
          </div>
          <div className="p-3 md:p-4 flex flex-col flex-grow">
            <h3 className="font-semibold text-base md:text-lg text-foreground mb-1 font-heading truncate">{nameText}</h3>
            <div className="flex flex-col items-start gap-1 mb-3">
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-foreground">{rating?.toFixed(1) || 'Baru'}</span>
                <span>({total_reviews || 0} ulasan)</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground truncate">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{location_city}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto pt-2">
              <div className="relative w-2/3 overflow-hidden [mask-image:linear-gradient(to_right,black_80%,transparent)]">
                <div className="text-sm md:text-lg font-bold text-primary whitespace-nowrap animate-marquee-infinite">
                  {duplicatedPriceText}
                </div>
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 hidden md:flex">Lihat Detail</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
export default MUACard;