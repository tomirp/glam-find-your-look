import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Scissors, Upload, X } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUploadProgress } from "@/hooks/useUploadProgress";
import { UploadProgress } from "@/components/ui/upload-progress";

interface Service {
  name: string;
  description: string;
  price_min: number;
  price_max: number;
  duration_minutes: number;
  image_url: string;
}

interface Step3Data {
  services: Service[];
}

interface OnboardingStep3Props {
  data: Step3Data;
  onUpdate: (data: Partial<Step3Data>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const OnboardingStep3: React.FC<OnboardingStep3Props> = ({ data, onUpdate, onNext, onBack }) => {
  const { toast } = useToast();
  const { progress, uploading, error, uploadFile } = useUploadProgress();
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const addService = () => {
    const newService: Service = {
      name: '',
      description: '',
      price_min: 0,
      price_max: 0,
      duration_minutes: 120,
      image_url: ''
    };
    onUpdate({ services: [...data.services, newService] });
  };

  const removeService = (index: number) => {
    const newServices = data.services.filter((_, i) => i !== index);
    onUpdate({ services: newServices });
  };

  const updateService = (index: number, field: keyof Service, value: any) => {
    const newServices = [...data.services];
    newServices[index] = { ...newServices[index], [field]: value };
    onUpdate({ services: newServices });
  };

  const handleImageUpload = async (file: File, serviceIndex: number) => {
    if (!file) return;

    setUploadingIndex(serviceIndex);
    try {
      const fileName = `service-${Date.now()}-${file.name}`;
      const imageUrl = await uploadFile('services', fileName, file);
      
      updateService(serviceIndex, 'image_url', imageUrl);
      
      toast({
        title: "Berhasil",
        description: "Foto layanan berhasil diunggah",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
    setUploadingIndex(null);
  };

  const handleNext = () => {
    if (data.services.length === 0) {
      toast({
        title: "Layanan Diperlukan",
        description: "Minimal tambahkan 1 layanan untuk melanjutkan",
        variant: "destructive"
      });
      return;
    }

    const invalidServices = data.services.filter(service => 
      !service.name || service.price_min <= 0
    );

    if (invalidServices.length > 0) {
      toast({
        title: "Data Tidak Lengkap",
        description: "Pastikan semua layanan memiliki nama dan harga minimum",
        variant: "destructive"
      });
      return;
    }

    onNext();
  };

  // Initialize with one service if empty
  if (data.services.length === 0) {
    addService();
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
          <Scissors className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Layanan & Harga</CardTitle>
        <CardDescription>
          Atur layanan yang Anda tawarkan beserta harganya
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.services.map((service, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Layanan {index + 1}</h4>
              {data.services.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeService(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Layanan *</Label>
                <Input
                  value={service.name}
                  onChange={(e) => updateService(index, 'name', e.target.value)}
                  placeholder="Contoh: Makeup Wedding"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Durasi (menit)</Label>
                <Input
                  type="number"
                  value={service.duration_minutes}
                  onChange={(e) => updateService(index, 'duration_minutes', parseInt(e.target.value) || 0)}
                  placeholder="120"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea
                value={service.description}
                onChange={(e) => updateService(index, 'description', e.target.value)}
                placeholder="Jelaskan detail layanan yang Anda berikan..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Harga Minimum (Rp) *</Label>
                <Input
                  type="number"
                  value={service.price_min}
                  onChange={(e) => updateService(index, 'price_min', parseInt(e.target.value) || 0)}
                  placeholder="300000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Harga Maksimum (Rp)</Label>
                <Input
                  type="number"
                  value={service.price_max}
                  onChange={(e) => updateService(index, 'price_max', parseInt(e.target.value) || 0)}
                  placeholder="500000"
                />
              </div>
            </div>

            {/* Service Image */}
            <div className="space-y-2">
              <Label>Foto Layanan (Opsional)</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                {service.image_url ? (
                  <div className="relative">
                    <img 
                      src={service.image_url} 
                      alt={service.name} 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => updateService(index, 'image_url', '')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], index)}
                      className="hidden"
                      id={`service-image-${index}`}
                      disabled={uploadingIndex === index}
                    />
                    <Label htmlFor={`service-image-${index}`} className="cursor-pointer">
                      <Button type="button" variant="outline" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Unggah Foto Layanan
                        </span>
                      </Button>
                    </Label>
                  </div>
                )}
              </div>
              
              {uploadingIndex === index && progress > 0 && progress < 100 && (
                <UploadProgress progress={progress} uploading={uploading} error={error} />
              )}
            </div>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={addService} className="w-full">
          <PlusCircle className="h-4 w-4 mr-2" />
          Tambah Layanan Lain
        </Button>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Kembali
          </Button>
          <Button 
            onClick={handleNext} 
            className="flex-1"
            disabled={data.services.length === 0 || uploadingIndex !== null}
          >
            Lanjut ke Fitur
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};