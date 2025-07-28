// src/components/AddServiceModal.tsx

import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Upload, Save, LoaderCircle } from "lucide-react"; // Pastikan LoaderCircle diimpor
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AddServiceModalProps {
  muaProfileId: string;
  onServiceAdded: () => void;
}

const AddServiceModal = ({ muaProfileId, onServiceAdded }: AddServiceModalProps) => {
  const [open, setOpen] = useState(false);
  const [newService, setNewService] = useState({ name: '', description: '', price_min: 0, duration_minutes: 0 });
  const [newServiceFile, setNewServiceFile] = useState<File | null>(null);
  const [newServicePreview, setNewServicePreview] = useState<string | null>(null);
  const [isAddingService, setIsAddingService] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleServiceChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewService(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewServiceFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setNewServicePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceFile || !user) {
      toast({ title: "Data Tidak Lengkap", description: "Mohon isi semua field dan pilih gambar untuk layanan.", variant: "destructive" });
      return;
    }
    
    setIsAddingService(true);
    toast({ description: "Menambahkan layanan baru..." });
    
    try {
      const fileExt = newServiceFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage.from('services').upload(filePath, newServiceFile);
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage.from('services').getPublicUrl(filePath);
      
      const { error: insertError } = await supabase.from('services').insert({
        mua_profile_id: muaProfileId,
        name: newService.name,
        description: newService.description,
        price_min: newService.price_min,
        duration_minutes: newService.duration_minutes,
        image_url: urlData.publicUrl,
        is_active: true
      });
      
      if (insertError) throw insertError;
      
      toast({ title: "Berhasil!", description: `Layanan "${newService.name}" telah ditambahkan.` });
      
      // Reset form
      setNewService({ name: '', description: '', price_min: 0, duration_minutes: 0 });
      setNewServiceFile(null);
      setNewServicePreview(null);
      setOpen(false);
      onServiceAdded();
      
    } catch (error: any) {
      toast({ title: "Gagal Menambahkan Layanan", description: error.message, variant: "destructive" });
    } finally {
      setIsAddingService(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-primary hover:bg-primary/90">
        <PlusCircle className="h-4 w-4 mr-2" />
        Tambah Layanan
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <form onSubmit={handleSubmit}>
          <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Tambah Layanan Baru</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Layanan</Label>
                    <Input id="name" name="name" value={newService.name} onChange={handleServiceChange} placeholder="contoh: Makeup Wisuda" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea id="description" name="description" value={newService.description} onChange={handleServiceChange} placeholder="Deskripsi layanan..." required />
                  </div>
                  <div className="flex gap-4">
                    <div className="space-y-2 w-1/2">
                      <Label htmlFor="price_min">Harga (Rp)</Label>
                      <Input id="price_min" name="price_min" type="number" value={newService.price_min} onChange={handleServiceChange} required />
                    </div>
                    <div className="space-y-2 w-1/2">
                      <Label htmlFor="duration_minutes">Durasi (menit)</Label>
                      <Input id="duration_minutes" name="duration_minutes" type="number" value={newService.duration_minutes} onChange={handleServiceChange} required />
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <Label>Foto Layanan</Label>
                  <div className="mt-2 aspect-video border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-card">
                    {newServicePreview ? (
                      <img src={newServicePreview} alt="Preview" className="h-full w-full object-cover rounded-md" />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Upload className="mx-auto h-8 w-8 mb-2" />
                        <p className="text-sm">Pilih gambar</p>
                      </div>
                    )}
                  </div>
                  <Input type="file" className="mt-2" accept="image/*" onChange={handleFileSelect} required />
                </div>
              </div>
            </div>
            
            {/* --- PERBAIKAN UTAMA PADA TOMBOL --- */}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isAddingService} className="bg-primary hover:bg-primary/90">
                {isAddingService ? (
                  <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isAddingService ? "Menyimpan..." : "Simpan Layanan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    </>
  );
};

export default AddServiceModal;