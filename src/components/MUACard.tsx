
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Heart } from "lucide-react";

interface MUACardProps {
  id: string;
  name: string;
  businessName?: string;
  rating: number;
  reviews: number;
  location: string;
  address?: string;
  specializations: string[];
  priceRange: string;
  avatarUrl?: string;
  portfolioImages?: string[];
  isPopular?: boolean;
}

const MUACard = ({ 
  id,
  name,
  businessName,
  rating, 
  reviews, 
  location,
  address,
  specializations,
  priceRange,
  avatarUrl,
  portfolioImages,
  isPopular = false 
}: MUACardProps) => {
  const displayName = businessName || name;
  const specialty = specializations?.length > 0 ? specializations.join(", ") : "Makeup Artist";
  const imageUrl = portfolioImages?.length > 0 ? portfolioImages[0] : null;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-border group">
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/30 rounded-t-lg overflow-hidden">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {displayName.charAt(0)}
                </span>
              </div>
            </div>
          )}
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
            {displayName}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center space-x-1 mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{rating || 0}</span>
            <span className="text-sm text-muted-foreground">({reviews || 0} ulasan)</span>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-1 mb-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{location}</span>
          </div>

          {/* Specialty */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{specialty}</p>

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">{priceRange || "Hubungi"}</span>
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
