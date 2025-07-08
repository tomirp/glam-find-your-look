import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Eye, Upload, Star } from "lucide-react";
import { MUAProfile, Service } from "./types";
import { formatCurrency } from "./utils";
import { ChangeEvent } from "react";
import AddServiceModal from "@/components/AddServiceModal";

interface ServicesPortfolioTabProps {
  muaProfile: MUAProfile | null;
  services: Service[];
  onPortfolioUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onServiceAdded: () => void;
}

export const ServicesPortfolioTab = ({ 
  muaProfile, 
  services, 
  onPortfolioUpload, 
  onServiceAdded 
}: ServicesPortfolioTabProps) => {
  return (
    <div className="space-y-6">
      {/* Portfolio Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-600" />
            Portfolio Gallery
          </CardTitle>
          <CardDescription>Showcase your best work to attract more clients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {(muaProfile?.portfolio_images || []).map((url, index) => (
              <div key={index} className="relative aspect-square group">
                <img 
                  src={url} 
                  alt={`Portfolio ${index+1}`} 
                  className="w-full h-full object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow" 
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
              </div>
            ))}
            {(muaProfile?.portfolio_images || []).length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada foto portfolio</p>
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="portfolio-upload" className="cursor-pointer">
              <Button asChild variant="outline" className="border-purple-200 hover:bg-purple-50">
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4"/> 
                  Unggah Foto Portfolio
                </span>
              </Button>
            </Label>
            <Input 
              id="portfolio-upload" 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={onPortfolioUpload} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Services Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-600" />
              Layanan Makeup
            </CardTitle>
            <CardDescription>Kelola paket layanan dan harga Anda</CardDescription>
          </div>
          {muaProfile && (
            <AddServiceModal 
              muaProfileId={muaProfile.id} 
              onServiceAdded={onServiceAdded}
            />
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {services.map(service => (
              <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-4 flex-1">
                  {service.image_url && (
                    <img 
                      src={service.image_url} 
                      alt={service.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium">{service.name}</h4>
                      <Badge variant={service.is_active ? "default" : "secondary"}>
                        {service.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                    {service.description && (
                      <p className="text-sm text-gray-600 mb-1">{service.description}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      {formatCurrency(service.price_min)} 
                      {service.price_max && ` - ${formatCurrency(service.price_max)}`}
                    </p>
                    {service.duration_minutes && (
                      <p className="text-xs text-gray-500">{service.duration_minutes} menit</p>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </div>
            ))}
            {services.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada layanan ditambahkan</p>
                <p className="text-sm mt-2">Klik tombol "Tambah Layanan" untuk memulai</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};