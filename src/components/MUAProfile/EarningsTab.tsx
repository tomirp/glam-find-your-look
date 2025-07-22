// src/components/MUAProfile/EarningsTab.tsx

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, Wallet } from 'lucide-react';

interface Booking {
    id: string;
    booking_date: string;
    total_price: number;
    platform_fee: number;
    profiles: { full_name: string | null };
    services: { name: string | null };
}

interface EarningsTabProps {
  muaProfileId: string | null;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

const EarningsTab = ({ muaProfileId }: EarningsTabProps) => {
    const [completedBookings, setCompletedBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEarnings = async () => {
            if (!muaProfileId) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    id,
                    booking_date,
                    total_price,
                    platform_fee,
                    profiles!bookings_customer_id_fkey(full_name),
                    services(name)
                `)
                .eq('mua_profile_id', muaProfileId)
                .eq('status', 'completed')
                .order('booking_date', { ascending: false });

            if (error) {
                console.error("Error fetching earnings:", error);
            } else {
                setCompletedBookings(data as Booking[]);
            }
            setLoading(false);
        };
        fetchEarnings();
    }, [muaProfileId]);

    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.total_price, 0);
    const totalPlatformFee = completedBookings.reduce((sum, b) => sum + b.platform_fee, 0);
    const netRevenue = totalRevenue - totalPlatformFee;
    
    const currentMonthRevenue = completedBookings
        .filter(b => new Date(b.booking_date).getMonth() === new Date().getMonth())
        .reduce((sum, b) => sum + (b.total_price - b.platform_fee), 0);

    if (loading) return <p>Memuat data pendapatan...</p>;

    return (
        <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendapatan Bulan Ini</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(currentMonthRevenue)}</div>
                        <p className="text-xs text-muted-foreground">Pendapatan bersih bulan ini</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pendapatan Bersih</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(netRevenue)}</div>
                        <p className="text-xs text-muted-foreground">Dari semua pesanan selesai</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Biaya Platform</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalPlatformFee)}</div>
                         <p className="text-xs text-muted-foreground">Dari semua pesanan</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Riwayat Transaksi</CardTitle>
                    <CardDescription>Daftar semua pesanan yang telah selesai.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pelanggan</TableHead>
                                <TableHead>Layanan</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead className="text-right">Total Bayar</TableHead>
                                <TableHead className="text-right">Biaya Platform</TableHead>
                                <TableHead className="text-right">Pendapatan Bersih</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {completedBookings.map(booking => (
                                <TableRow key={booking.id}>
                                    <TableCell className="font-medium">{booking.profiles.full_name}</TableCell>
                                    <TableCell>{booking.services.name}</TableCell>
                                    <TableCell>{new Date(booking.booking_date).toLocaleDateString('id-ID')}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(booking.total_price)}</TableCell>
                                    <TableCell className="text-right text-red-600">-{formatCurrency(booking.platform_fee)}</TableCell>
                                    <TableCell className="text-right font-semibold text-green-600">{formatCurrency(booking.total_price - booking.platform_fee)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default EarningsTab;