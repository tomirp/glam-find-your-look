import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2 } from "lucide-react";

interface ClientVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  muaProfileId: string;
  portfolioImageUrl: string;
}

export const ClientVerificationModal = ({ 
  isOpen, 
  onClose, 
  muaProfileId, 
  portfolioImageUrl 
}: ClientVerificationModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    clientWhatsapp: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-verification-whatsapp', {
        body: {
          muaProfileId,
          portfolioImageUrl,
          clientName: formData.clientName,
          clientPhone: formData.clientPhone,
          clientWhatsapp: formData.clientWhatsapp,
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Permintaan Verifikasi Terkirim",
          description: "Klien akan menerima pesan WhatsApp untuk verifikasi portofolio.",
        });
        
        // Reset form
        setFormData({
          clientName: "",
          clientPhone: "",
          clientWhatsapp: "",
        });
        
        onClose();
      } else {
        throw new Error(data?.error || 'Gagal mengirim permintaan verifikasi');
      }
    } catch (error: any) {
      console.error('Verification request error:', error);
      toast({
        title: "Gagal Mengirim Permintaan",
        description: error.message || "Terjadi kesalahan saat mengirim permintaan verifikasi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Minta Verifikasi Klien
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <img 
              src={portfolioImageUrl} 
              alt="Portfolio untuk diverifikasi" 
              className="w-full h-32 object-cover rounded-lg mb-2"
            />
            <p className="text-sm text-muted-foreground">
              Sistem akan mengirim WhatsApp ke klien untuk memverifikasi bahwa ini adalah karya yang dibuat untuk mereka.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="clientName">Nama Klien</Label>
              <Input
                id="clientName"
                type="text"
                placeholder="Masukkan nama klien"
                value={formData.clientName}
                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="clientPhone">Nomor Telepon</Label>
              <Input
                id="clientPhone"
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={formData.clientPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="clientWhatsapp">Nomor WhatsApp</Label>
              <Input
                id="clientWhatsapp"
                type="tel"
                placeholder="628xxxxxxxxxx (dengan kode negara)"
                value={formData.clientWhatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, clientWhatsapp: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: 628xxxxxxxxxx (gunakan 628 untuk Indonesia)
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={loading || !formData.clientName || !formData.clientPhone || !formData.clientWhatsapp}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  'Kirim Permintaan'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};