import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building, Send } from "lucide-react";

const MUAOnboarding = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    business_name: "",
    location_city: "",
    location_address: "",
    specializations: "",
    price_range: "",
    instagram_url: "",
    whatsapp_number: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Error", description: "Anda harus masuk untuk melanjutkan.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
        const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();

        if (profile) {
            const { error } = await supabase.from("mua_profiles").insert({
                profile_id: profile.id,
                business_name: formData.business_name,
                location_city: formData.location_city,
                location_address: formData.location_address,
                specializations: formData.specializations.split(",").map(s => s.trim()),
                price_range: formData.price_range,
                instagram_url: formData.instagram_url,
                whatsapp_number: formData.whatsapp_number,
            });

            if (error) throw error;

            toast({ title: "Berhasil!", description: "Profil MUA Anda telah dibuat." });
            navigate("/mua/profile");
        }

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
                <Building className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Selesaikan Profil MUA Anda</CardTitle>
            <CardDescription>
              Berikan detail bisnis makeup Anda untuk menarik lebih banyak klien.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Nama Bisnis/Brand MUA</Label>
                  <Input id="business_name" value={formData.business_name} onChange={handleChange} placeholder="Contoh: Cantika Makeup" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_number">Nomor WhatsApp</Label>
                  <Input id="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} placeholder="081234567890" required />
                </div>
              </div>
              
              <div className="space-y-2">
                  <Label htmlFor="location_city">Kota</Label>
                  <Input id="location_city" value={formData.location_city} onChange={handleChange} placeholder="Contoh: Jakarta Selatan" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_address">Alamat Lengkap (Opsional)</Label>
                <Textarea id="location_address" value={formData.location_address} onChange={handleChange} placeholder="Gedung, jalan, dan nomor" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specializations">Spesialisasi</Label>
                <Input id="specializations" value={formData.specializations} onChange={handleChange} placeholder="Pisahkan dengan koma, contoh: Wedding, Graduation" required/>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price_range">Rentang Harga</Label>
                  <Input id="price_range" value={formData.price_range} onChange={handleChange} placeholder="Contoh: Rp 300.000 - Rp 1.500.000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram_url">Instagram (Opsional)</Label>
                  <Input id="instagram_url" value={formData.instagram_url} onChange={handleChange} placeholder="https://instagram.com/akunanda" />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan dan Lanjutkan"}
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MUAOnboarding;