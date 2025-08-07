import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Upload, Trash2, Shield } from "lucide-react";
import AddServiceModal from "@/components/AddServiceModal";
import EditServiceModal from "@/components/EditServiceModal";
import { ClientVerificationModal } from "@/components/ClientVerificationModal";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { useUploadProgress } from "@/hooks/useUploadProgress";
import { UploadProgress } from "@/components/ui/upload-progress";
import { MUAProfile, Service } from "./types";
import { formatCurrency } from "./utils";

interface ServicesPortfolioTabProps {
  muaProfile: MUAProfile | null;
  services: Service[];
  onPortfolioUpload: (imageUrl: string) => Promise<void>;
  onRefreshData: () => void;
}

export const ServicesPortfolioTab = ({
  muaProfile,
  services,
  onPortfolioUpload,
  onRefreshData,
}: ServicesPortfolioTabProps) => {
  const [showAddService, setShowAddService] = useState(false);
  const [showEditService, setShowEditService] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedImageForVerification, setSelectedImageForVerification] = useState<string>("");
  const { uploading, progress, uploadFile } = useUploadProgress();

  const handlePortfolioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const imageUrl = await uploadFile('portfolio', `portfolio/${fileName}`, file);
      
      await onPortfolioUpload(imageUrl);
    } catch (error: any) {
      console.error('Upload error:', error);
    }
  };

  const handleRequestVerification = (imageUrl: string) => {
    setSelectedImageForVerification(imageUrl);
    setShowVerificationModal(true);
  };

  const isImageVerified = (imageUrl: string) => {
    if (!muaProfile?.verified_portfolio_images) return null;
    
    const verifiedImages = Array.isArray(muaProfile.verified_portfolio_images) 
      ? muaProfile.verified_portfolio_images 
      : [];
      
    return verifiedImages.find((item: any) => item.image_url === imageUrl);
  };

  const handleDeletePortfolioImage = async (imageUrl: string) => {
    // Implementation for deleting portfolio images
    console.log('Delete portfolio image:', imageUrl);
  };

  const portfolioImages = muaProfile?.portfolio_images || [];

  return (
    <div className="space-y-6">
      {/* Portfolio Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Portofolio</h3>
            <div className="flex items-center gap-2">
              <input
                type="file"
                id="portfolio-upload"
                className="hidden"
                accept="image/*"
                onChange={handlePortfolioUpload}
                disabled={uploading}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('portfolio-upload')?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Mengunggah...' : 'Unggah Foto'}
              </Button>
            </div>
          </div>

          <UploadProgress 
            uploading={uploading} 
            progress={progress} 
            error={null}
            filename="Portfolio"
          />

          {portfolioImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {portfolioImages.map((image, index) => {
                const verifiedData = isImageVerified(image);
                
                return (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    
                    {/* Verification badge */}
                    {verifiedData && (
                      <div className="absolute top-2 left-2">
                        <VerifiedBadge 
                          clientName={verifiedData.client_name}
                          verifiedAt={verifiedData.verified_at}
                        />
                      </div>
                    )}
                    
                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                      {!verifiedData && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleRequestVerification(image)}
                          title="Minta verifikasi klien"
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePortfolioImage(image)}
                        title="Hapus gambar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada portofolio. Unggah karya terbaik Anda!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Layanan</h3>
            <Button
              onClick={() => setShowAddService(true)}
              disabled={!muaProfile}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Layanan
            </Button>
          </div>

          {services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <Card key={service.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{service.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedService(service);
                        setShowEditService(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {service.description && (
                    <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-primary">
                      {formatCurrency(service.price_min)}
                      {service.price_max && service.price_max !== service.price_min && 
                        ` - ${formatCurrency(service.price_max)}`
                      }
                    </span>
                    <Badge variant={service.is_active ? "default" : "secondary"}>
                      {service.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                  
                  {service.duration_minutes && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Durasi: {service.duration_minutes} menit
                    </p>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada layanan. Tambahkan layanan pertama Anda!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {showAddService && (
        <AddServiceModal
          muaProfileId={muaProfile?.id || ""}
          onServiceAdded={() => {
            setShowAddService(false);
            onRefreshData();
          }}
        />
      )}

      {showEditService && selectedService && (
        <EditServiceModal
          service={selectedService}
          onServiceUpdated={() => {
            setShowEditService(false);
            setSelectedService(null);
            onRefreshData();
          }}
        />
      )}

      <ClientVerificationModal
        isOpen={showVerificationModal}
        onClose={() => {
          setShowVerificationModal(false);
          setSelectedImageForVerification("");
        }}
        muaProfileId={muaProfile?.id || ""}
        portfolioImageUrl={selectedImageForVerification}
      />
    </div>
  );
};