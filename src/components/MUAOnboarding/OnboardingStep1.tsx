import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, MapPin, Phone } from 'lucide-react';

interface Step1Data {
  business_name: string;
  location_city: string;
  location_address: string;
  whatsapp_number: string;
  specializations: string;
  price_range: string;
  instagram_url: string;
}

interface OnboardingStep1Props {
  data: Step1Data;
  onUpdate: (data: Partial<Step1Data>) => void;
  onNext: () => void;
}

export const OnboardingStep1: React.FC<OnboardingStep1Props> = ({ data, onUpdate, onNext }) => {
  const handleNext = () => {
    if (!data.business_name || !data.location_city || !data.specializations || !data.whatsapp_number) {
      return;
    }
    onNext();
  };

  const isValid = data.business_name && data.location_city && data.specializations && data.whatsapp_number;

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Informasi Bisnis MUA</CardTitle>
        <CardDescription>
          Berikan detail bisnis makeup Anda untuk menarik lebih banyak klien
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="business_name">Nama Bisnis/Brand MUA *</Label>
            <Input 
              id="business_name" 
              value={data.business_name} 
              onChange={(e) => onUpdate({ business_name: e.target.value })}
              placeholder="Contoh: Cantika Makeup" 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp_number">Nomor WhatsApp *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="whatsapp_number" 
                value={data.whatsapp_number} 
                onChange={(e) => onUpdate({ whatsapp_number: e.target.value })}
                placeholder="081234567890" 
                className="pl-10"
                required 
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location_city">Kota *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              id="location_city" 
              value={data.location_city} 
              onChange={(e) => onUpdate({ location_city: e.target.value })}
              placeholder="Contoh: Jakarta Selatan" 
              className="pl-10"
              required 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location_address">Alamat Lengkap (Opsional)</Label>
          <Textarea 
            id="location_address" 
            value={data.location_address} 
            onChange={(e) => onUpdate({ location_address: e.target.value })}
            placeholder="Gedung, jalan, dan nomor" 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specializations">Spesialisasi *</Label>
          <Input 
            id="specializations" 
            value={data.specializations} 
            onChange={(e) => onUpdate({ specializations: e.target.value })}
            placeholder="Pisahkan dengan koma, contoh: Wedding, Graduation, Party" 
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="price_range">Rentang Harga (Opsional)</Label>
            <Input 
              id="price_range" 
              value={data.price_range} 
              onChange={(e) => onUpdate({ price_range: e.target.value })}
              placeholder="Contoh: Rp 300.000 - Rp 1.500.000" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram_url">Instagram (Opsional)</Label>
            <Input 
              id="instagram_url" 
              value={data.instagram_url} 
              onChange={(e) => onUpdate({ instagram_url: e.target.value })}
              placeholder="https://instagram.com/akunanda" 
            />
          </div>
        </div>

        <Button 
          onClick={handleNext} 
          className="w-full" 
          disabled={!isValid}
        >
          Lanjut ke Portofolio
        </Button>
      </CardContent>
    </Card>
  );
};