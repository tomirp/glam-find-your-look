// src/components/MUAProfile/ScheduleTab.tsx

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { add, format, startOfDay, isSameDay } from "date-fns";

interface Booking {
    id: string;
    booking_date: string;
    booking_time: string;
    profiles: { full_name: string | null };
    services: { name: string | null };
}

interface BlockedSlot {
    id: number;
    start_time: string;
    end_time: string;
    notes: string | null;
}

interface ScheduleTabProps {
    muaProfile: { id: string } | null;
}

export const ScheduleTab = ({ muaProfile }: ScheduleTabProps) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("17:00");

    const fetchScheduleData = async () => {
        if (!muaProfile) return;

        // Fetch accepted bookings
        const { data: bookingsData, error: bookingsError } = await supabase
            .from('bookings')
            .select(`id, booking_date, booking_time, profiles!bookings_customer_id_fkey(full_name), services(name)`)
            .eq('mua_profile_id', muaProfile.id)
            .eq('status', 'accepted');

        if (bookingsError) console.error("Error fetching bookings:", bookingsError);
        else setBookings(bookingsData || []);

        // Fetch blocked slots
        const { data: slotsData, error: slotsError } = await supabase
            .from('mua_blocked_slots')
            .select('*')
            .eq('mua_profile_id', muaProfile.id);

        if (slotsError) console.error("Error fetching blocked slots:", slotsError);
        else setBlockedSlots(slotsData || []);
    };

    useEffect(() => {
        fetchScheduleData();
    }, [muaProfile]);

    const handleBlockTime = async () => {
        if (!selectedDate || !muaProfile) return;

        const startDateTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${startTime}`);
        const endDateTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${endTime}`);

        if (startDateTime >= endDateTime) {
            toast({ title: "Waktu tidak valid", description: "Waktu mulai harus sebelum waktu selesai.", variant: "destructive" });
            return;
        }

        const { error } = await supabase.from('mua_blocked_slots').insert({
            mua_profile_id: muaProfile.id,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            notes: "Diblokir manual"
        });

        if (error) {
            toast({ title: "Gagal memblokir waktu", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Berhasil", description: "Slot waktu telah diblokir." });
            fetchScheduleData(); // Refresh data
        }
    };

    const scheduledDates = useMemo(() => {
        const bookingDates = bookings.map(b => startOfDay(new Date(b.booking_date)));
        const blockedDates = blockedSlots.map(s => startOfDay(new Date(s.start_time)));
        return [...bookingDates, ...blockedDates];
    }, [bookings, blockedSlots]);
    
    const todaysEvents = useMemo(() => {
        if (!selectedDate) return [];

        const todaysBookings = bookings
            .filter(b => isSameDay(new Date(b.booking_date), selectedDate))
            .map(b => ({
                type: 'booking' as const,
                time: b.booking_time,
                title: `${b.profiles.full_name}`,
                description: b.services.name,
            }));

        const todaysBlocked = blockedSlots
            .filter(s => isSameDay(new Date(s.start_time), selectedDate))
            .map(s => ({
                type: 'blocked' as const,
                time: `${format(new Date(s.start_time), 'HH:mm')} - ${format(new Date(s.end_time), 'HH:mm')}`,
                title: 'Waktu Diblokir',
                description: s.notes,
            }));

        return [...todaysBookings, ...todaysBlocked].sort((a, b) => a.time.localeCompare(b.time));

    }, [selectedDate, bookings, blockedSlots]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Kolom Kiri: Kalender dan Form Blokir Waktu */}
            <div className="md:col-span-1 space-y-6">
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-2">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="w-full"
                            modifiers={{ scheduled: scheduledDates }}
                            modifiersStyles={{
                                scheduled: {
                                    fontWeight: 'bold',
                                    color: '#8B5CF6', // Purple
                                    textDecoration: 'underline',
                                },
                            }}
                        />
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle>Blokir Waktu</CardTitle>
                        <CardDescription>Tandai waktu tidak tersedia di tanggal yang dipilih.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Label htmlFor="start-time">Mulai</Label>
                                <Input id="start-time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                            </div>
                            <div className="flex-1">
                                <Label htmlFor="end-time">Selesai</Label>
                                <Input id="end-time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                            </div>
                        </div>
                        <Button onClick={handleBlockTime} className="w-full">Blokir Jadwal</Button>
                    </CardContent>
                </Card>
            </div>

            {/* Kolom Kanan: Detail Jadwal Harian */}
            <div className="md:col-span-2">
                <Card className="border-0 shadow-lg min-h-[400px]">
                    <CardHeader>
                        <CardTitle>Jadwal untuk {selectedDate ? format(selectedDate, 'd MMMM yyyy') : '...'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {todaysEvents.length > 0 ? (
                            <ul className="space-y-4">
                                {todaysEvents.map((event, index) => (
                                    <li key={index} className={`flex items-start gap-4 p-4 rounded-lg ${event.type === 'booking' ? 'bg-blue-50' : 'bg-gray-100'}`}>
                                        <div className="font-semibold text-sm w-24 text-gray-600">{event.time}</div>
                                        <div className="flex-1">
                                            <p className="font-semibold">{event.title}</p>
                                            <p className="text-sm text-muted-foreground">{event.description}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-16 text-muted-foreground">
                                <p>Tidak ada jadwal untuk tanggal ini.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};