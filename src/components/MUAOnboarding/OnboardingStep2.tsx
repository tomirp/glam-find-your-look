import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUploadProgress } from "@/hooks/useUploadProgress";
import { UploadProgress } from "@/components/ui/upload-progress";

interface Step2Data {
  portfolio_images: string[];
  cover_image_url: string;
  bio: string;
}

interface OnboardingStep2Props {
  data: Step2Data;
  onUpdate: (data: Partial<Step2Data>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const OnboardingStep2: React.FC<OnboardingStep2Props> = ({ data, onUpdate, onNext, onBack }) => {
  const { toast } = useToast();
  const { progress, uploading, error, uploadFile } = useUploadProgress();
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (file: File, type: 'portfolio' | 'cover') => {
    if (!file) return;

    setIsUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const bucket = type === 'portfolio' ? 'portfolio' : 'avatars';
      
      const imageUrl = await uploadFile(bucket, fileName, file);
      
      if (type === 'portfolio') {
        onUpdate({ 
          portfolio_images: [...data.portfolio_images, imageUrl] 
        });
      } else {
        onUpdate({ cover_image_url: imageUrl });
      }
      
      toast({
        title: "Berhasil",
        description: `${type === 'portfolio' ? 'Foto portofolio' : 'Foto cover'} berhasil diunggah`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
    setIsUploading(false);
  };

  const removePortfolioImage = (index: number) => {
    const newImages = data.portfolio_images.filter((_, i) => i !== index);
    onUpdate({ portfolio_images: newImages });
  };

  const handleNext = () => {
    if (data.portfolio_images.length === 0) {
      toast({
        title: "Portofolio Diperlukan",
        description: "Minimal unggah 1 foto portofolio untuk melanjutkan",
        variant: "destructive"
      });
      return;
    }
    onNext();
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
          <Camera className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Portofolio & Foto Profil</CardTitle>
        <CardDescription>
          Tampilkan karya terbaik Anda untuk menarik perhatian klien
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cover Image */}
        <div className="space-y-2">
          <Label>Foto Cover Profil (Opsional)</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            {data.cover_image_url ? (
              <div className="relative">
                <img 
                  src={data.cover_image_url} 
                  alt="Cover" 
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => onUpdate({ cover_image_url: "" })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div>
                <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover')}
                  className="hidden"
                  id="cover-upload"
                />
                <Label htmlFor="cover-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Unggah Foto Cover
                    </span>
                  </Button>
                </Label>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Images */}
        <div className="space-y-2">
          <Label>Foto Portofolio * (Minimal 1 foto)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.portfolio_images.map((image, index) => (
              <div key={index} className="relative">
                <img 
                  src={image} 
                  alt={`Portfolio ${index + 1}`} 
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => removePortfolioImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 flex items-center justify-center">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'portfolio')}
                className="hidden"
                id="portfolio-upload"
                disabled={isUploading}
              />
              <Label htmlFor="portfolio-upload" className="cursor-pointer text-center">
                <div className="flex flex-col items-center">
                  <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-sm text-muted-foreground">Tambah Foto</span>
                </div>
              </Label>
            </div>
          </div>
          
          {progress > 0 && progress < 100 && (
            <UploadProgress progress={progress} uploading={uploading} error={error} />
          )}
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio/Deskripsi Singkat (Opsional)</Label>
          <Textarea 
            id="bio"
            value={data.bio}
            onChange={(e) => onUpdate({ bio: e.target.value })}
            placeholder="Ceritakan sedikit tentang pengalaman dan keahlian Anda..."
            rows={3}
          />
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Kembali
          </Button>
          <Button 
            onClick={handleNext} 
            className="flex-1"
            disabled={data.portfolio_images.length === 0 || isUploading}
          >
            Lanjut ke Layanan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};