// src/components/MUAProfile/MUAOnboardingForm.tsx

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, DollarSign, Instagram, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServiceItem {
  name: string;
  price: number;
}

interface OnboardingFormProps {
  userProfile: { id: string; email: string | undefined };
  muaProfile: { id: string };
  onSubmit: (formData: any) => Promise<void>;
}

export const MUAOnboardingForm: React.FC<OnboardingFormProps> = ({ userProfile, muaProfile, onSubmit }) => {
  const { toast } = useToast();
  const [businessName, setBusinessName] = useState('');
  const [locationCity, setLocationCity] = useState('Jakarta Selatan');
  const [address, setAddress] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [services, setServices] = useState<ServiceItem[]>([{ name: '', price: 0 }]);
  const [loading, setLoading] = useState(false);

  const handleServiceChange = (index: number, field: keyof ServiceItem, value: string | number) => {
    const newServices = [...services];
    (newServices[index] as any)[field] = value;
    setServices(newServices);
  };

  const addService = () => {
    setServices([...services, { name: '', price: 0 }]);
  };

  const removeService = (index: number) => {
    const newServices = services.filter((_, i) => i !== index);
    setServices(newServices);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || services.some(s => !s.name || s.price <= 0)) {
      toast({
        title: "Data Belum Lengkap",
        description: "Nama bisnis dan semua layanan (beserta harga) wajib diisi.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    await onSubmit({
      businessName,
      locationCity,
      address,
      instagram,
      tiktok,
      services
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-0 shadow-2xl">
        <CardHeader className="text-center">
          <Sparkles className="mx-auto h-12 w-12 text-purple-500 mb-2" />
          <CardTitle className="text-3xl font-heading">Selamat Datang di GlamFind!</CardTitle>
          <CardDescription>Lengkapi profil bisnis Anda untuk mulai menerima pesanan.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informasi Bisnis */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Informasi Bisnis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Nama Jasa / Bisnis MUA Anda *</Label>
                  <Input id="business_name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Contoh: Sarah Makeup" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location_city">Kota *</Label>
                  <Input id="location_city" value={locationCity} onChange={(e) => setLocationCity(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Alamat Lengkap</Label>
                <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Jalan, nomor, kelurahan, kecamatan..." />
              </div>
            </div>

            {/* Layanan & Harga */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Layanan yang Ditawarkan</h3>
              {services.map((service, index) => (
                <div key={index} className="flex items-end gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-grow space-y-2">
                    <Label htmlFor={`service-name-${index}`}>Nama Layanan *</Label>
                    <Input id={`service-name-${index}`} value={service.name} onChange={(e) => handleServiceChange(index, 'name', e.target.value)} placeholder="Contoh: Makeup Wisuda" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`service-price-${index}`}>Harga (Rp) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id={`service-price-${index}`} type="number" value={service.price} onChange={(e) => handleServiceChange(index, 'price', Number(e.target.value))} placeholder="350000" className="pl-8" />
                    </div>
                  </div>
                  {services.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeService(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addService} className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" /> Tambah Layanan Lain
              </Button>
            </div>

            {/* Media Sosial */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Media Sosial (Opsional)</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                   <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="username_instagram" className="pl-8" />
                    </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok</Label>
                   <div className="relative">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" viewBox="0 0 16 16"><path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/></svg>
                      <Input id="tiktok" value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="username_tiktok" className="pl-8" />
                    </div>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6">
              {loading ? 'Menyimpan...' : 'Simpan dan Lanjutkan'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};