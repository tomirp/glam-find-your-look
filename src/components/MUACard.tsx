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
  price_range: string | null;
  isPopular?: boolean;
  cover_image_url: string | null;
}

const MUACard = ({ 
  business_name, 
  rating, 
  total_reviews, 
  location_city, 
  specializations, 
  price_range,
  isPopular = false,
  cover_image_url
}: MUAProfileForCard) => {
  const specialtyText = specializations?.join(', ') || 'Berbagai layanan makeup';
  const nameText = business_name || 'MUA Profesional';
  const priceText = price_range || 'Harga bersaing';

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-border group h-full flex flex-col">
      <CardContent className="p-0 flex flex-col flex-grow">
        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/30 rounded-t-lg overflow-hidden">
          {cover_image_url ? (
            <img src={cover_image_url} alt={nameText} className="h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{nameText.charAt(0)}</span>
              </div>
            </div>
          )}
          {isPopular && (<Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">Popular</Badge>)}
          <Button variant="ghost" size="icon" className="absolute top-3 right-3 bg-background/80 hover:bg-background"><Heart className="w-4 h-4" /></Button>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-semibold text-lg text-foreground mb-2 font-heading">{nameText}</h3>
          <div className="flex items-center space-x-1 mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{rating?.toFixed(1) || 'Baru'}</span>
            <span className="text-sm text-muted-foreground">({total_reviews || 0} ulasan)</span>
          </div>
          <div className="flex items-center space-x-1 mb-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{location_city}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3 flex-grow">{specialtyText}</p>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-lg font-bold text-primary">{priceText}</span>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">Lihat Detail</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default MUACard;