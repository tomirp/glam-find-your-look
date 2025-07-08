import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save } from "lucide-react";
import { EditForm } from "./types";

interface EditProfileTabProps {
  editForm: EditForm;
  setEditForm: (form: EditForm) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const EditProfileTab = ({ editForm, setEditForm, onSubmit }: EditProfileTabProps) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-purple-600" />
          Edit Profil
        </CardTitle>
        <CardDescription>Update informasi profil dan bisnis Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="business_name">Nama Bisnis</Label>
              <Input 
                id="business_name" 
                value={editForm.business_name} 
                onChange={(e) => setEditForm({...editForm, business_name: e.target.value})}
                className="border-gray-200 focus:border-purple-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap</Label>
              <Input 
                id="full_name" 
                value={editForm.full_name} 
                onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                className="border-gray-200 focus:border-purple-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input 
                id="phone" 
                value={editForm.phone} 
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                className="border-gray-200 focus:border-purple-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location_city">Kota</Label>
              <Input 
                id="location_city" 
                value={editForm.location_city} 
                onChange={(e) => setEditForm({...editForm, location_city: e.target.value})}
                className="border-gray-200 focus:border-purple-400"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location_address">Alamat Lengkap</Label>
            <Textarea 
              id="location_address" 
              value={editForm.location_address} 
              onChange={(e) => setEditForm({...editForm, location_address: e.target.value})}
              placeholder="Jalan, nomor, kelurahan, kecamatan..."
              className="border-gray-200 focus:border-purple-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio / Deskripsi</Label>
            <Textarea 
              id="bio" 
              value={editForm.bio} 
              onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
              placeholder="Ceritakan tentang keahlian dan pengalaman Anda..."
              className="border-gray-200 focus:border-purple-400"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              <Save className="h-4 w-4 mr-2" />
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};