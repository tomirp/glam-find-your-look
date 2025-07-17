// src/components/MUAProfile/ServicesPortfolioTab.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
// PERUBAHAN: Ikon Star sekarang memiliki alias untuk kejelasan
import { Eye, Upload, Star as StarIcon, PlusCircle, Star as MakeCoverPhotoIcon } from "lucide-react"; 
import { MUAProfile, Service } from "./types";
import { formatCurrency } from "./utils";
import { ChangeEvent, useState } from "react"; // PERUBAHAN: Import useState
import AddServiceModal from "@/components/AddServiceModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
// PERUBAHAN: Impor komponen modal edit yang akan kita buat
import EditServiceModal from "@/components/EditServiceModal"; 

interface ServicesPortfolioTabProps {
  muaProfile: MUAProfile | null;
  services: Service[];
  onPortfolioUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onServiceAdded: () => void;
  // PERUBAHAN: Tambahkan prop untuk refresh data setelah update foto utama
  onProfileUpdate: () => void; 
}

export const ServicesPortfolioTab = ({ 
  muaProfile, 
  services, 
  onPortfolioUpload, 
  onServiceAdded,
  onProfileUpdate // PERUBAHAN: Terima prop baru
}: ServicesPortfolioTabProps) => {
  const { toast } = useToast();

  // PERUBAHAN: Fungsi untuk handle set cover image
  const handleSetCoverImage = async (imageUrl: string) => {
    if (!muaProfile) return;

    // Jangan lakukan apa-apa jika gambar sudah menjadi foto utama
    if (muaProfile.cover_image_url === imageUrl) {
        toast({ description: "Gambar ini sudah menjadi foto utama." });
        return;
    }

    toast({ description: "Menyimpan foto utama..." });
    try {
      const { error } = await supabase
        .from('mua_profiles')
        .update({ cover_image_url: imageUrl })
        .eq('id', muaProfile.id);

      if (error) throw error;

      toast({ title: "Berhasil!", description: "Foto utama telah diperbarui." });
      onProfileUpdate(); // Memanggil fungsi refresh dari MUAProfile.tsx
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-600" />
            Galeri Portofolio
          </CardTitle>
          <CardDescription>Pamerkan karya terbaik Anda. Foto dengan tanda bintang adalah foto utama Anda saat ini.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {(muaProfile?.portfolio_images || []).map((url, index) => {
              // PERUBAHAN: Cek apakah gambar ini adalah foto utama
              const isCoverImage = muaProfile?.cover_image_url === url;

              return (
                <div key={index} className="relative aspect-square group">
                  <img 
                    src={url} 
                    alt={`Portfolio ${index+1}`} 
                    // PERUBAHAN: Tambahkan style ring jika ini adalah foto utama
                    className={`w-full h-full object-cover rounded-lg shadow-md transition-all ${isCoverImage ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
                  />
                  
                  {/* PERUBAHAN: Tampilkan ikon bintang jika ini adalah foto utama */}
                  {isCoverImage && (
                    <div className="absolute top-2 right-2 bg-purple-600 text-white p-1.5 rounded-full shadow-lg pointer-events-none">
                      <StarIcon className="h-4 w-4" fill="white" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center">
                    {/* PERUBAHAN: Jangan tampilkan tombol jika sudah menjadi foto utama */}
                    {!isCoverImage && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2"
                        onClick={() => handleSetCoverImage(url)}
                      >
                        <MakeCoverPhotoIcon className="h-4 w-4" />
                        Jadikan Utama
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {(muaProfile?.portfolio_images || []).length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada foto portofolio.</p>
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="portfolio-upload" className="cursor-pointer">
              <Button asChild variant="outline" className="border-purple-200 hover:bg-purple-50" disabled={!muaProfile}>
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4"/> 
                  Unggah Foto Portofolio
                </span>
              </Button>
            </Label>
            <Input 
              id="portfolio-upload" 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={onPortfolioUpload} 
              disabled={!muaProfile}
            />
             {!muaProfile && (
              <p className="text-sm text-red-500 mt-2">
                Harap lengkapi dan simpan profil Anda terlebih dahulu di tab 'Edit Profil' untuk mengunggah portofolio.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Services Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <StarIcon className="h-5 w-5 text-purple-600" />
              Layanan Makeup
            </CardTitle>
            <CardDescription>Kelola paket layanan dan harga Anda.</CardDescription>
          </div>
          {muaProfile ? (
            <AddServiceModal 
              muaProfileId={muaProfile.id} 
              onServiceAdded={onServiceAdded}
            />
          ) : (
             <Button disabled>
              <PlusCircle className="h-4 w-4 mr-2" />
              Tambah Layanan
            </Button>
          )}
        </CardHeader>
        <CardContent>
           {!muaProfile && (
            <div className="text-center py-6 text-red-500 bg-red-50 border border-red-200 rounded-lg">
              <p>Harap lengkapi dan simpan profil Anda di tab 'Edit Profil' untuk mulai menambah layanan.</p>
            </div>
            )}
          <div className="grid gap-4 mt-4">
            {services.map(service => (
              <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
                      {service.price_max ? ` - ${formatCurrency(service.price_max)}` : ''}
                    </p>
                    {service.duration_minutes && (
                      <p className="text-xs text-gray-500">{service.duration_minutes} menit</p>
                    )}
                  </div>
                </div>
                {/* PERUBAHAN: Tombol edit sekarang memanggil komponen EditServiceModal */}
                <EditServiceModal 
                  service={service}
                  onServiceUpdated={onServiceAdded} // Menggunakan onServiceAdded untuk refresh data
                />
              </div>
            ))}
            {services.length === 0 && muaProfile && (
              <div className="text-center py-12 text-gray-500">
                <StarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada layanan ditambahkan.</p>
                <p className="text-sm mt-2">Klik tombol "Tambah Layanan" untuk memulai.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};