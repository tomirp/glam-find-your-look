// src/components/EditServiceModal.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Pencil } from "lucide-react";
import { Service } from "./MUAProfile/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditServiceModalProps {
  service: Service;
  onServiceUpdated: () => void;
}

const EditServiceModal = ({ service, onServiceUpdated }: EditServiceModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description || "");
  const [priceMin, setPriceMin] = useState(service.price_min);
  const [priceMax, setPriceMax] = useState(service.price_max || undefined);
  const [isActive, setIsActive] = useState(service.is_active ?? true); // Default to true if null
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsLoading(true);
    toast({ description: "Menyimpan perubahan..." });
    try {
      // PERBAIKAN: Nama tabel di database adalah 'services', bukan 'mua_services'
      const { error } = await supabase
        .from('services') 
        .update({
          name,
          description,
          price_min: priceMin,
          price_max: priceMax,
          is_active: isActive,
        })
        .eq('id', service.id);

      if (error) throw error;

      toast({ title: "Berhasil!", description: "Layanan telah diperbarui." });
      onServiceUpdated();
      setIsOpen(false);
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Pencil className="h-4 w-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Layanan</DialogTitle>
          <DialogDescription>
            Perbarui detail layanan Anda di sini. Klik simpan jika sudah selesai.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nama
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Deskripsi
            </Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priceMin" className="text-right">
              Harga Min
            </Label>
            <Input id="priceMin" type="number" value={priceMin} onChange={(e) => setPriceMin(Number(e.target.value))} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priceMax" className="text-right">
              Harga Max
            </Label>
            <Input id="priceMax" type="number" value={priceMax || ""} onChange={(e) => setPriceMax(Number(e.target.value) || undefined)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
             <Label htmlFor="is-active" className="text-right">
              Status
            </Label>
            <div className="flex items-center gap-2 col-span-3">
              <Switch
                id="is-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
               <span className={`text-sm ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
                {isActive ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditServiceModal;