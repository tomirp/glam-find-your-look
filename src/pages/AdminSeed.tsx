import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const AdminSeed = () => {
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const runSeeding = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('seed-mua', { method: 'POST', body: {} });
      if (error) throw error;
      toast({ title: 'Seeding selesai', description: `Users: ${data?.createdUsers ?? 0}, MUA: ${data?.createdMua ?? 0}, Services: ${data?.createdServices ?? 0}, Filled: ${data?.filledExisting ?? 0}` });
    } catch (e: any) {
      toast({ title: 'Seeding gagal', description: e?.message ?? String(e), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const setupMUAData = async () => {
    try {
      setSetupLoading(true);
      const { data, error } = await supabase.functions.invoke('setup-mua-data', { method: 'POST', body: {} });
      if (error) throw error;
      toast({ title: 'Setup berhasil', description: 'Data MUA kegiatanpus02@gmail.com telah disetup dengan 5 layanan' });
    } catch (e: any) {
      toast({ title: 'Setup gagal', description: e?.message ?? String(e), variant: 'destructive' });
    } finally {
      setSetupLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="container mx-auto px-4 py-10">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Admin: Seed MUA Dummy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Silakan masuk terlebih dahulu untuk mengakses halaman ini.</p>
            <Button onClick={() => (window.location.href = '/auth')}>Masuk / Daftar</Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Admin: Seed MUA Dummy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p>Tekan tombol di bawah untuk membuat 6 akun MUA dummy dan mengisi layanan yang belum ada di Jakarta/Bandung.</p>
            <Button onClick={runSeeding} disabled={loading || setupLoading}>
              {loading ? 'Memproses...' : 'Jalankan Seeding Sekarang'}
            </Button>
          </div>
          
          <div className="pt-4 border-t space-y-4">
            <p className="font-semibold">Setup layanan untuk kegiatanpus02@gmail.com:</p>
            <p className="text-sm text-muted-foreground">Melengkapi profil dan menambahkan 5 layanan makeup untuk akun ini.</p>
            <Button onClick={setupMUAData} disabled={setupLoading || loading} variant="secondary">
              {setupLoading ? 'Memproses...' : 'Setup Data MUA (kegiatanpus02)'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default AdminSeed;
