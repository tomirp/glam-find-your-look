import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Copy, QrCode } from 'lucide-react';

const WaitingForPayment = () => {
    const { paymentId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const { orderData, paymentData } = location.state || {};

    if (!orderData || !paymentData) {
        useEffect(() => {
            navigate('/');
        }, [navigate]);
        return null;
    }

    const handleConfirmPayment = async () => {
        setLoading(true);
        toast({ description: "Mengonfirmasi pembayaran..." });
        try {
            const { error } = await supabase
                .from('payments')
                .update({ payment_status: 'paid' })
                .eq('id', paymentId);

            if (error) throw error;
            
            // Siapkan data untuk halaman konfirmasi
            const confirmationData = {
                ...orderData,
                paymentMethod: paymentData.payment_method,
                orderId: paymentData.id,
                timestamp: new Date().toISOString()
            };
            
            navigate('/confirmation', { state: { paymentData: confirmationData }, replace: true });

        } catch (error: any) {
            toast({ title: "Gagal Konfirmasi", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    
    const getPaymentInstructions = () => {
        switch (paymentData.payment_method) {
            case 'qris':
                return <div className="text-center"><QrCode className="mx-auto h-32 w-32" /><p className="mt-2 text-sm text-muted-foreground">Scan kode QR ini dengan aplikasi pembayaran Anda.</p></div>;
            case 'virtual_account':
                return <p>Silakan transfer ke nomor Virtual Account: <strong>8888 1234 5678 9012</strong> atas nama GlamFind.</p>;
            default:
                return <p>Silakan transfer ke rekening Bank BCA <strong>123-456-7890</strong> a/n PT GlamFind Indonesia.</p>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg shadow-lg">
                <CardHeader className="text-center">
                    <Clock className="mx-auto h-12 w-12 text-yellow-500 mb-4"/>
                    <CardTitle>Menunggu Pembayaran</CardTitle>
                    <p className="text-muted-foreground">Selesaikan pembayaran Anda dalam 1x24 jam.</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                        <p className="text-sm">Total Pembayaran</p>
                        <p className="text-2xl font-bold text-yellow-800">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(paymentData.amount)}
                        </p>
                    </div>
                    
                    <div className="space-y-2 text-center">
                        <h3 className="font-semibold">Instruksi Pembayaran</h3>
                        <div className="text-gray-700 p-4 bg-gray-100 rounded-md">
                            {getPaymentInstructions()}
                        </div>
                    </div>

                    <Button onClick={handleConfirmPayment} className="w-full" disabled={loading}>
                        {loading ? 'Memproses...' : 'Saya Sudah Bayar'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default WaitingForPayment;