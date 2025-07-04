import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { ArrowLeft, Star, MapPin, Heart, Calendar } from "lucide-react";
import BookingModal from "@/components/BookingModal";

const MUADetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Mock data - in real app this would come from API
  const muaData = {
    id: id,
    name: "Sarah Makeup Artist",
    rating: 4.8,
    reviews: 127,
    location: "Kemang, Jakarta Selatan",
    distance: "2.5 km",
    description: "Professional makeup artist dengan pengalaman 5+ tahun dalam wedding, party, dan photoshoot makeup. Menggunakan produk berkualitas tinggi dan teknik terdepan untuk hasil yang sempurna.",
    brands: ["MAC", "Urban Decay", "Charlotte Tilbury", "Dior", "NARS"],
    portfolio: [
      "/placeholder.svg",
      "/placeholder.svg", 
      "/placeholder.svg",
      "/placeholder.svg"
    ],
    styles: [
      {
        id: 1,
        name: "Bridal Makeup",
        description: "Makeup pernikahan dengan hasil tahan lama",
        price: "Rp 500.000",
        rating: 4.9,
        image: "/placeholder.svg"
      },
      {
        id: 2,
        name: "Party Makeup",
        description: "Makeup glamour untuk acara khusus",
        price: "Rp 300.000", 
        rating: 4.8,
        image: "/placeholder.svg"
      },
      {
        id: 3,
        name: "Natural Look",
        description: "Makeup natural untuk sehari-hari",
        price: "Rp 200.000",
        rating: 4.7,
        image: "/placeholder.svg"
      },
      {
        id: 4,
        name: "Photoshoot Makeup",
        description: "Makeup khusus untuk foto profesional",
        price: "Rp 400.000",
        rating: 4.9,
        image: "/placeholder.svg"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Button>
          
          <Button variant="ghost" size="icon">
            <Heart className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Portfolio Carousel */}
          <div className="space-y-6">
            <Carousel className="w-full">
              <CarouselContent>
                {muaData.portfolio.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/30 rounded-lg overflow-hidden">
                      <img 
                        src={image} 
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>

          {/* MUA Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-heading mb-2">
                {muaData.name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{muaData.rating}</span>
                  <span className="text-muted-foreground">({muaData.reviews} ulasan)</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{muaData.location}</span>
                </div>
              </div>

              <p className="text-muted-foreground mb-6">
                {muaData.description}
              </p>

              {/* Brands */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Brand yang Digunakan</h3>
                <div className="flex flex-wrap gap-2">
                  {muaData.brands.map((brand, index) => (
                    <Badge key={index} variant="secondary">
                      {brand}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Pesan Sekarang
              </Button>
            </div>
          </div>
        </div>

        {/* Makeup Styles */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground font-heading mb-8">
            Gaya Make-Up yang Ditawarkan
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {muaData.styles.map((style) => (
              <Card key={style.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/30 rounded-t-lg overflow-hidden">
                    <img 
                      src={style.image} 
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
                      <span className="font-bold text-primary">{style.price}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{style.rating}</span>
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

      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        muaData={muaData}
      />
    </div>
  );
};

export default MUADetail;