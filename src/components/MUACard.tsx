import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Heart } from "lucide-react";

// Diperbarui agar cocok dengan struktur data dari Supabase
export interface MUAProfileForCard {
  id?: string;
  business_name: string | null;
  rating: number | null;
  total_reviews: number | null;
  location_city: string;
  specializations: string[] | null;
  price_range: string | null;
  isPopular?: boolean;
}

const MUACard = ({ 
  id,
  business_name, 
  rating, 
  total_reviews, 
  location_city, 
  specializations, 
  price_range,
  isPopular = false 
}: MUAProfileForCard) => {
  const specialtyText = specializations?.join(', ') || 'Berbagai layanan makeup';
  const nameText = business_name || 'MUA Profesional';

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-border group h-full flex flex-col">
      <CardContent className="p-0 flex flex-col flex-grow">
        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/30 rounded-t-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{nameText.charAt(0)}</span>
            </div>
          </div>
          {isPopular && (
            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
              Popular
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute top-3 right-3 bg-background/80 hover:bg-background"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-semibold text-lg text-foreground mb-2 font-heading">
            {nameText}
          </h3>
          
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
            <span className="text-lg font-bold text-primary">{price_range || 'Harga bersaing'}</span>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Lihat Detail
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MUACard;