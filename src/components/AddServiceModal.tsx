
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Upload } from "lucide-react";

interface AddServiceModalProps {
  muaProfileId: string;
  onServiceAdded: () => void;
}

const AddServiceModal = ({ muaProfileId, onServiceAdded }: AddServiceModalProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_min: '',
    price_max: '',
    duration_minutes: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price_min) {
      toast({
        title: "Error",
        description: "Nama layanan dan harga minimum wajib diisi",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `service-${muaProfileId}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('portfolio')
          .upload(fileName, imageFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from('portfolio')
          .getPublicUrl(fileName);
        
        imageUrl = data.publicUrl;
      }

      // Create service
      const { error: serviceError } = await supabase
        .from('services')
        .insert({
          mua_profile_id: muaProfileId,
          name: formData.name,
          description: formData.description || null,
          price_min: parseInt(formData.price_min),
          price_max: formData.price_max ? parseInt(formData.price_max) : null,
          duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
          image_url: imageUrl,
          is_active: true
        });

      if (serviceError) {
        throw serviceError;
      }

      toast({
        title: "Berhasil",
        description: "Layanan makeup berhasil ditambahkan"
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        price_min: '',
        price_max: '',
        duration_minutes: '',
      });
      setImageFile(null);
      setOpen(false);
      onServiceAdded();

    } catch (error: any) {
      console.error('Error adding service:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan layanan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Ukuran file maksimal 5MB",
          variant: "destructive"
        });
        return;
      }
      setImageFile(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <PlusCircle className="h-4 w-4 mr-2" />
          Tambah Layanan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Layanan Makeup Baru</DialogTitle>
          <DialogDescription>
            Tambahkan layanan makeup baru dengan foto, nama style, dan harga
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service-image">Foto Layanan</Label>
            <div className="flex items-center gap-4">
              <Input
                id="service-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1"
              />
              <Upload className="h-4 w-4 text-gray-400" />
            </div>
            {imageFile && (
              <p className="text-sm text-gray-600">
                File dipilih: {imageFile.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-name">Nama Style Makeup *</Label>
            <Input
              id="service-name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Contoh: Natural Glow, Glamour Night, dll"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-description">Deskripsi (Opsional)</Label>
            <Textarea
              id="service-description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Jelaskan detail tentang style makeup ini..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price-min">Harga Minimum (Rp) *</Label>
              <Input
                id="price-min"
                type="number"
                value={formData.price_min}
                onChange={(e) => setFormData({...formData, price_min: e.target.value})}
                placeholder="150000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price-max">Harga Maksimum (Rp)</Label>
              <Input
                id="price-max"
                type="number"
                value={formData.price_max}
                onChange={(e) => setFormData({...formData, price_max: e.target.value})}
                placeholder="300000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Durasi (Menit)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
              placeholder="90"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? "Menyimpan..." : "Simpan Layanan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddServiceModal;
