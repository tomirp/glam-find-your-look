// src/components/MUAProfile/ServicesPortfolioTab.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Eye, Upload, Star as StarIcon, PlusCircle, Star as MakeCoverPhotoIcon, MoreVertical } from "lucide-react";
import { MUAProfile, Service } from "./types";
import { formatCurrency } from "./utils";
import { ChangeEvent } from "react";
import AddServiceModal from "@/components/AddServiceModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EditServiceModal from "@/components/EditServiceModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ServicesPortfolioTabProps {
  muaProfile: MUAProfile | null;
  services: Service[];
  onPortfolioUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onServiceAdded: () => void;
  onProfileUpdate: () => void;
}

export const ServicesPortfolioTab = ({
  muaProfile,
  services,
  onPortfolioUpload,
  onServiceAdded,
  onProfileUpdate
}: ServicesPortfolioTabProps) => {
  const { toast } = useToast();

  const handleSetCoverImage = async (imageUrl: string) => {
    if (!muaProfile) return;

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
      onProfileUpdate();
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      {/* Portfolio Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-600" />
            Galeri Portofolio
          </CardTitle>
          <CardDescription>Pamerkan karya terbaik Anda. Foto dengan tanda bintang adalah foto utama profil Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {(muaProfile?.portfolio_images || []).map((url, index) => {
              const isCoverImage = muaProfile?.cover_image_url === url;
              return (
                <div key={index} className="relative aspect-square group rounded-lg overflow-hidden">
                  <img
                    src={url}
                    alt={`Portfolio ${index + 1}`}
                    className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${isCoverImage ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
                  />
                  {isCoverImage && (
                    <div className="absolute top-2 right-2 bg-purple-600 text-white p-1.5 rounded-full shadow-lg pointer-events-none">
                      <StarIcon className="h-4 w-4" fill="white" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    {!isCoverImage && (
                      <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2" onClick={() => handleSetCoverImage(url)}>
                        <MakeCoverPhotoIcon className="h-4 w-4" />
                        Jadikan Utama
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {(muaProfile?.portfolio_images || []).length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada foto portofolio.</p>
                <p className="text-sm">Unggah karya terbaik Anda untuk menarik pelanggan.</p>
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="portfolio-upload" className="cursor-pointer">
              <Button asChild variant="outline" className="border-purple-200 hover:bg-purple-50" disabled={!muaProfile}>
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Unggah Foto Portofolio
                </span>
              </Button>
            </Label>
            <Input id="portfolio-upload" type="file" className="hidden" accept="image/*" onChange={onPortfolioUpload} disabled={!muaProfile} />
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
        <CardHeader>
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <StarIcon className="h-5 w-5 text-purple-600" />
              Layanan Makeup
            </CardTitle>
            <CardDescription>Kelola paket layanan dan harga Anda.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <Card key={service.id} className="overflow-hidden group flex flex-col">
                {service.image_url && (
                  <div className="relative">
                    {/* PERBAIKAN 1: Foto jasa dibuat rasio 1:1 (square) */}
                    <img src={service.image_url} alt={service.name} className="w-full h-auto object-cover aspect-square transition-transform group-hover:scale-105" />
                    <Badge variant={service.is_active ? "default" : "secondary"} className="absolute top-2 right-2">
                      {service.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                )}
                <div className="p-4 flex flex-col flex-grow">
                  <h4 className="font-semibold flex-grow">{service.name}</h4>
                  {service.description && (
                    <p className="text-sm text-gray-600 mt-1 mb-3">{service.description}</p>
                  )}
                </div>
                <CardFooter className="p-4 pt-0 mt-auto flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-purple-700">
                      {formatCurrency(service.price_min)}
                    </p>
                    {service.duration_minutes && (
                      <p className="text-xs text-gray-500">{service.duration_minutes} menit</p>
                    )}
                  </div>
                  <EditServiceModal service={service} onServiceUpdated={onServiceAdded} />
                </CardFooter>
              </Card>
            ))}
            
            {/* PERBAIKAN 2: Tombol "Tambah Layanan" dipindahkan ke sini */}
            {muaProfile && (
              <div className="flex items-center justify-center border-2 border-dashed rounded-lg min-h-[200px] hover:border-purple-400 transition-colors">
                 <AddServiceModal muaProfileId={muaProfile.id} onServiceAdded={onServiceAdded} />
              </div>
            )}
          </div>
          {services.length === 0 && muaProfile && (
            <div className="text-center py-16 text-gray-500">
              <StarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Klik tombol di atas untuk menambahkan layanan pertama Anda.</p>
            </div>
          )}
          {!muaProfile && (
            <div className="text-center py-6 text-red-500 bg-red-50 border border-red-200 rounded-lg">
              <p>Harap lengkapi dan simpan profil Anda di tab 'Edit Profil' untuk mulai menambah layanan.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};