// src/components/MUAProfile/EditProfileTab.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // PERUBAHAN: Impor Select
import { Save } from "lucide-react";
import { EditForm } from "./types";

interface EditProfileTabProps {
  editForm: EditForm;
  setEditForm: (form: EditForm) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const EditProfileTab = ({ editForm, setEditForm, onSubmit }: EditProfileTabProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // PERUBAHAN: Fungsi baru untuk menangani perubahan pada Select
  const handleSelectChange = (name: string, value: string) => {
    setEditForm({ ...editForm, [name]: value });
  };


  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Edit Profil</CardTitle>
        <CardDescription>Perbarui detail personal dan bisnis Anda di sini.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="business_name">Nama Bisnis MUA</Label>
              <Input id="business_name" name="business_name" value={editForm.business_name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap Anda</Label>
              <Input id="full_name" name="full_name" value={editForm.full_name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input id="phone" name="phone" value={editForm.phone} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location_city">Kota</Label>
              <Input id="location_city" name="location_city" value={editForm.location_city} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_address">Alamat Lengkap</Label>
            <Textarea id="location_address" name="location_address" value={editForm.location_address} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio Singkat</Label>
            <Textarea id="bio" name="bio" value={editForm.bio} onChange={handleChange} />
          </div>

          {/* PERUBAHAN: Tambahkan field baru untuk ketersediaan kendaraan */}
          <div className="space-y-2">
            <Label htmlFor="vehicle_availability">Ketersediaan Kendaraan Pribadi</Label>
            <Select 
              name="vehicle_availability" 
              value={editForm.vehicle_availability || 'none'}
              onValueChange={(value) => handleSelectChange('vehicle_availability', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih ketersediaan kendaraan..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak ada</SelectItem>
                <SelectItem value="motorcycle">Motor</SelectItem>
                <SelectItem value="car">Mobil</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Ini akan menentukan apakah opsi "Menggunakan Kendaraan Pribadi" muncul untuk pelanggan.</p>
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};