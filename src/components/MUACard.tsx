import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Heart } from "lucide-react";

interface MUACardProps {
  name: string;
  rating: number;
  reviews: number;
  location: string;
  distance: string;
  specialty: string;
  price: string;
  image?: string;
  isPopular?: boolean;
}

const MUACard = ({ 
  name, 
  rating, 
  reviews, 
  location, 
  distance, 
  specialty, 
  price,
  isPopular = false 
}: MUACardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-border group">
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/30 rounded-t-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{name.charAt(0)}</span>
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

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-foreground mb-2 font-heading">
            {name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center space-x-1 mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{rating}</span>
            <span className="text-sm text-muted-foreground">({reviews} ulasan)</span>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-1 mb-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{location}</span>
            <span className="text-sm text-muted-foreground">• {distance}</span>
          </div>

          {/* Specialty */}
          <p className="text-sm text-muted-foreground mb-3">{specialty}</p>

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">{price}</span>
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