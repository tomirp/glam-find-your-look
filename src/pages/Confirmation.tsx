// src/pages/Confirmation.tsx

import { useState, useEffect, useCallback } from "react"; // PERBAIKAN: Impor useCallback
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Calendar, Home, Printer } from "lucide-react";

interface ConfirmationDetails {
  id: string;
  total_price: number;
  booking_date: string;
  booking_time: string;
  mua_profiles: {
    business_name: string;
    location_address: string;
  };
  services: {
    name: string;
  };
  profiles: {
    full_name: string;
    address: string;
  };
}

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookingDetails, setBookingDetails] = useState<ConfirmationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const bookingId = location.state?.bookingId;

  // PERBAIKAN UTAMA: Bungkus fungsi fetchBookingDetails dengan useCallback
  const fetchBookingDetails = useCallback(async () => {
    if (!bookingId || !user) {
      navigate('/');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, total_price, booking_date, booking_time,
        mua_profiles ( business_name, location_address ),
        services ( name ),
        profiles!bookings_customer_id_fkey ( full_name, address )
      `)
      .eq('id', bookingId)
      .maybeSingle();

    if (error || !data) {
      console.error("Error fetching confirmation details:", error);
      navigate('/');
    } else {
      setBookingDetails(data as ConfirmationDetails);
    }
    setLoading(false);
  }, [bookingId, user, navigate]); // Definisikan dependensi untuk useCallback

  useEffect(() => {
    fetchBookingDetails();
  }, [fetchBookingDetails]); // Sekarang useEffect hanya bergantung pada fungsi yang stabil

  const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  if (loading || !bookingDetails) {
    return <div className="min-h-screen flex items-center justify-center">Memuat Invoice...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Card className="shadow-lg">
          <CardHeader className="items-center bg-green-50 p-6">
            <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
            <CardTitle className="text-2xl font-bold">Pembayaran Berhasil!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Invoice untuk pesanan #{bookingDetails.id.substring(0, 8).toUpperCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-semibold mb-2 text-gray-500">DITAGIHKAN KEPADA:</h3>
                <p className="font-bold">{bookingDetails.profiles.full_name}</p>
                <p className="text-muted-foreground">{bookingDetails.profiles.address || 'Alamat tidak tersedia'}</p>
              </div>
              <div className="text-right">
                <h3 className="font-semibold mb-2 text-gray-500">DIBAYAR KEPADA:</h3>
                <p className="font-bold">{bookingDetails.mua_profiles.business_name}</p>
                <p className="text-muted-foreground">{bookingDetails.mua_profiles.location_address || 'Alamat MUA tidak tersedia'}</p>
              </div>
            </div>
            
            <Separator />

            <div>
              <h3 className="font-semibold mb-4">Rincian Layanan</h3>
              <div className="flow-root">
                <dl className="-my-4 divide-y divide-gray-200 text-sm">
                  <div className="flex items-center justify-between py-4">
                    <dt className="text-muted-foreground">Layanan</dt>
                    <dd className="font-medium">{bookingDetails.services.name}</dd>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <dt className="text-muted-foreground">Jadwal</dt>
                    <dd className="font-medium">
                      {new Date(bookingDetails.booking_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}, {bookingDetails.booking_time}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <Separator />
            
            <div className="flow-root">
              <dl className="space-y-4 text-sm">
                 <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="font-medium">{formatCurrency(bookingDetails.total_price - 5000)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Biaya Platform</dt>
                    <dd className="font-medium">{formatCurrency(5000)}</dd>
                  </div>
                   <div className="flex items-center justify-between font-bold text-base">
                    <dt>Total</dt>
                    <dd>{formatCurrency(bookingDetails.total_price)}</dd>
                  </div>
              </dl>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button onClick={() => navigate('/aktivitas')} className="flex-1 h-14 text-base font-semibold">
                <Calendar className="h-5 w-5 mr-3" />
                Lihat Aktivitas Pesanan
              </Button>
              <Button onClick={() => window.print()} variant="outline" className="flex-1 h-14 text-base font-semibold">
                <Printer className="h-5 w-5 mr-3" />
                Cetak Invoice
              </Button>
            </div>
            <div className="text-center">
                <Button onClick={() => navigate('/')} variant="link" className="text-muted-foreground">
                    Kembali ke Beranda
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Confirmation;