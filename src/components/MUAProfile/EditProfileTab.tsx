// src/components/MUAProfile/EditProfileTab.tsx

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import type { EditForm } from "./types";
import { LoaderCircle, Save } from "lucide-react"; // 1. Pastikan ikon diimpor

// 2. Tambahkan 'isSaving: boolean' ke dalam interface props
interface EditProfileTabProps {
  editForm: EditForm;
  setEditForm: (form: EditForm) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSaving: boolean; 
}

export const EditProfileTab = ({ editForm, setEditForm, onSubmit, isSaving }: EditProfileTabProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleRadioChange = (value: 'none' | 'motorcycle' | 'car') => {
    setEditForm({ ...editForm, vehicle_availability: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profil</CardTitle>
        <CardDescription>Perbarui detail informasi bisnis dan kontak Anda di sini.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="business_name">Nama Bisnis</Label>
              <Input id="business_name" name="business_name" value={editForm.business_name} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap</Label>
              <Input id="full_name" name="full_name" value={editForm.full_name} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input id="phone" name="phone" value={editForm.phone} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location_city">Kota</Label>
              <Input id="location_city" name="location_city" value={editForm.location_city} onChange={handleInputChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_address">Alamat Lengkap</Label>
            <Textarea id="location_address" name="location_address" value={editForm.location_address} onChange={handleInputChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" value={editForm.bio} onChange={handleInputChange} />
          </div>

          <div className="space-y-2">
            <Label>Ketersediaan Kendaraan</Label>
            <RadioGroup name="vehicle_availability" value={editForm.vehicle_availability} onValueChange={handleRadioChange} className="flex space-x-4">
              <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="none" /><Label htmlFor="none">Tidak Ada</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="motorcycle" id="motorcycle" /><Label htmlFor="motorcycle">Motor</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="car" id="car" /><Label htmlFor="car">Mobil</Label></div>
            </RadioGroup>
          </div>

          <div className="flex justify-end pt-4">
            {/* 3. Tombol ini sekarang akan berfungsi dengan benar */}
            <Button type="submit" disabled={isSaving} size="lg">
              {isSaving ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};