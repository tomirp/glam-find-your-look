// src/pages/MUADetail.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowLeft, Star, MapPin, Heart, Calendar } from "lucide-react";
import BookingModal from "@/components/BookingModal";
import { supabase } from "@/integrations/supabase/client";
import type { MUAProfile } from "@/components/MUAProfile/types"; 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


interface Service {
    id: string;
    name: string;
    description: string | null;
    price_min: number;
    rating?: number;
    image_url: string | null;
}

const MUADetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const [muaData, setMuaData] = useState<MUAProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMUADetails = async () => {
      if (!id) return;
      setLoading(true);

      const { data: muaProfile, error: muaError } = await supabase
        .from('mua_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (muaError || !muaProfile) {
        console.error("Error fetching MUA details:", muaError);
        navigate('/404');
        return;
      }
      setMuaData(muaProfile);

      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('mua_profile_id', muaProfile.id)
        .eq('is_active', true);

      if (servicesError) {
        console.error("Error fetching services:", servicesError);
      } else {
        setServices(servicesData || []);
      }

      setLoading(false);
    };

    fetchMUADetails();
  }, [id, navigate]);

 if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat detail MUA...</div>;
  }

  if (!muaData) {
    return <div className="min-h-screen flex items-center justify-center">MUA tidak ditemukan.</div>;
  }

  const legacyMuaDataForModal = {
    id: muaData.id,
    name: muaData.business_name || '',
    location: muaData.location_city || '',
    styles: services.map(s => ({
        id: s.id,
        name: s.name,
        price: `Rp ${s.price_min.toLocaleString('id-ID')}`
    }))
  };
  
  const renderBookingButton = () => {
    if (role === 'mua') {
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Pesan Sekarang
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tidak Bisa Memesan</AlertDialogTitle>
              <AlertDialogDescription>
                Anda tidak dapat memesan layanan Anda sendiri. Silakan masuk sebagai pelanggan untuk melanjutkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>Mengerti</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }

    return (
      <Button 
        onClick={() => setIsBookingModalOpen(true)}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        size="lg"
      >
        <Calendar className="w-4 h-4 mr-2" />
        Pesan Sekarang
      </Button>
    );
  };


  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali</span>
          </Button>
          
          <Button variant="ghost" size="icon">
            <Heart className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Carousel className="w-full">
              <CarouselContent>
                {(muaData.portfolio_images && muaData.portfolio_images.length > 0) ? muaData.portfolio_images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/30 rounded-lg overflow-hidden">
                      <img 
                        src={image} 
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                )) : (
                    <CarouselItem>
                        <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/30 rounded-lg overflow-hidden flex items-center justify-center">
                            <p className="text-muted-foreground">Tidak ada foto portfolio</p>
                        </div>
                    </CarouselItem>
                )}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-heading mb-2">
                {muaData.business_name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{muaData.rating?.toFixed(1) || 'Baru'}</span>
                  <span className="text-muted-foreground">({muaData.total_reviews || 0} ulasan)</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{muaData.location_city}</span>
                </div>
              </div>

              <p className="text-muted-foreground mb-6">
                Professional makeup artist dengan pengalaman bertahun-tahun dalam berbagai acara.
              </p>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Spesialisasi</h3>
                <div className="flex flex-wrap gap-2">
                  {muaData.specializations?.map((specialty, index) => (
                    <Badge key={index} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              {renderBookingButton()}

            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground font-heading mb-8">
            Gaya Make-Up yang Ditawarkan
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((style) => (
              <Card key={style.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/30 rounded-t-lg overflow-hidden">
                    <img 
                      src={style.image_url || "/placeholder.svg"} 
                      alt={style.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2">
                      {style.name}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {style.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-primary">{`Rp ${style.price_min.toLocaleString('id-ID')}`}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{style.rating || 'Baru'}</span>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => setIsBookingModalOpen(true)}
                    >
                      Pilih Gaya Ini
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {isBookingModalOpen && (
        <BookingModal 
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          muaData={legacyMuaDataForModal}
        />
      )}
    </div>
  );
};

export default MUADetail;