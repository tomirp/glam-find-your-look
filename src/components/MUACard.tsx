// src/components/MUACard.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Heart } from "lucide-react";

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

const MUACard = ({ 
  business_name, 
  rating, 
  total_reviews, 
  location_city, 
  price_range,
  isPopular = false,
  cover_image_url
}: MUAProfileForCard) => {
  const nameText = business_name || 'MUA Profesional';
  const priceText = price_range || 'Harga bersaing';
  // PERUBAHAN: Gandakan teks harga untuk loop animasi yang mulus
  const duplicatedPriceText = `${priceText} \u00A0 | \u00A0 ${priceText}`;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-border group h-full flex flex-col">
      <CardContent className="p-0 flex flex-col flex-grow">
        <div className="relative aspect-square bg-gradient-to-br from-primary/20 to-secondary/30 rounded-t-lg overflow-hidden">
          {cover_image_url ? (
            <img src={cover_image_url} alt={nameText} className="h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-primary">{nameText.charAt(0)}</span>
              </div>
            </div>
          )}
          {isPopular && (<Badge className="absolute top-2 left-2 text-xs">Popular</Badge>)}
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"><Heart className="w-4 h-4" /></Button>
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
            
            {/* PERUBAHAN: Wrapper untuk harga dengan efek gradasi (mask) */}
            <div className="relative w-2/3 overflow-hidden [mask-image:linear-gradient(to_right,black_80%,transparent)]">
              <div className="text-sm md:text-lg font-bold text-primary whitespace-nowrap animate-marquee-infinite">
                {duplicatedPriceText}
              </div>
            </div>
            
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 hidden md:flex">
              Lihat Detail
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default MUACard;