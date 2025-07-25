// src/components/BookingModal.tsx

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"; // <-- Dikembalikan
import { ShoppingCart, LoaderCircle, Palette, Calendar as CalendarIcon, Clock, Info } from "lucide-react";
import { format } from "date-fns";
import { id as indonesiaLocale } from 'date-fns/locale';
import { Card, CardContent } from "./ui/card";

// --- Tipe Data ---
interface Service {
  id: string;
  name: string;
  price_min: number;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  muaData: {
    id: string;
    name: string;
    location: string;
    vehicle: 'none' | 'motorcycle' | 'car';
  };
  services: Service[];
  initialServiceId?: string;
}

// --- Fungsi Helper ---
const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
const timeSlots = Array.from({ length: 12 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`); // Jam 08:00 - 19:00
const isDateDisabled = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

// --- Komponen Utama ---
const BookingModal = ({ isOpen, onClose, muaData, services, initialServiceId }: BookingModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [unavailableTimes, setUnavailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedServiceId(initialServiceId);
      setSelectedDate(undefined);
      setSelectedTime(undefined);
    }
  }, [isOpen, initialServiceId]);

  useEffect(() => {
    if (!selectedDate || !muaData.id) {
      setUnavailableTimes([]);
      return;
    }
    const fetchUnavailableTimes = async () => {
      setLoadingTimes(true);
      setSelectedTime(undefined);
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('booking_time')
          .eq('mua_profile_id', muaData.id)
          .eq('booking_date', formattedDate)
          .in('status', ['accepted', 'pending']);
        if (error) throw error;
        setUnavailableTimes(data.map(d => d.booking_time));
      } catch (error: any) {
        toast({ title: "Error", description: "Gagal memuat ketersediaan waktu.", variant: "destructive" });
      } finally {
        setLoadingTimes(false);
      }
    };
    fetchUnavailableTimes();
  }, [selectedDate, muaData.id, toast]);

  const selectedService = useMemo(() =>
    services.find(s => s.id === selectedServiceId),
    [selectedServiceId, services]
  );

  const isSelectionComplete = !!selectedServiceId && !!selectedDate && !!selectedTime;

  const handleConfirm = () => {
    if (!isSelectionComplete) {
      toast({ title: "Belum Lengkap", description: "Pastikan Anda memilih layanan, tanggal, dan waktu.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const bookingData = {
      muaId: muaData.id,
      muaName: muaData.name,
      muaLocation: muaData.location,
      muaAvatar: (muaData as any).profiles?.avatar_url || '',
      vehicle: muaData.vehicle,
      serviceId: selectedService!.id,
      serviceName: selectedService!.name,
      price: selectedService!.price_min,
      date: selectedDate!.toISOString(),
      time: selectedTime!,
    };
    navigate("/checkout", { state: { bookingData } });
    onClose();
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md md:max-w-3xl flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-center font-heading text-2xl">Buat Jadwal Pesanan</DialogTitle>
          <DialogDescription className="text-center">Lengkapi detail pesanan Anda di bawah ini.</DialogDescription>
        </DialogHeader>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 overflow-hidden py-4">
          {/* Kolom Kiri: Layanan & Kalender */}
          <div className="space-y-6 flex flex-col">
            <div className="space-y-3">
              <Label className="flex items-center gap-3 font-semibold text-base"><span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm">1</span>Pilih Layanan</Label>
              <Select onValueChange={setSelectedServiceId} value={selectedServiceId}>
                <SelectTrigger className="h-11 text-base"><SelectValue placeholder="Klik untuk memilih..." /></SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex justify-between w-full">
                        <span>{service.name}</span>
                        <span className="text-muted-foreground ml-4">{formatCurrency(service.price_min)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="flex items-center gap-3 font-semibold text-base"><span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm">2</span>Pilih Tanggal</Label>
              <div className="flex justify-center rounded-md border bg-background">
                <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} disabled={isDateDisabled} className="p-2" />
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Pilihan Waktu */}
          <div className="space-y-3 flex flex-col min-h-0">
            <Label className="flex items-center gap-3 font-semibold text-base"><span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm">3</span>Pilih Waktu</Label>
            <Card className="flex-grow flex flex-col">
              <CardContent className="p-2 flex-grow">
                {!selectedDate ? (
                  <div className="h-full flex items-center justify-center text-center text-muted-foreground p-4">
                    <p><Info className="h-5 w-5 mx-auto mb-2" />Pilih tanggal di sebelah kiri untuk melihat waktu yang tersedia.</p>
                  </div>
                ) : loadingTimes ? (
                  <div className="grid grid-cols-3 gap-2 p-2">
                    {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}
                  </div>
                ) : (
                  <ScrollArea className="h-80">
                    {/* --- INI BAGIAN YANG DIPERBAIKI --- */}
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      value={selectedTime}
                      onValueChange={(value) => {
                        // Mencegah value menjadi string kosong saat di-unselect
                        if (value) setSelectedTime(value);
                      }}
                      className="grid grid-cols-3 gap-2 p-2"
                    >
                      {timeSlots.map(time => {
                        const isDisabled = unavailableTimes.includes(time);
                        return (
                          <ToggleGroupItem
                            key={time}
                            value={time}
                            className="h-11 text-base data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                            disabled={isDisabled}
                          >
                            {time}
                          </ToggleGroupItem>
                        );
                      })}
                    </ToggleGroup>
                    {/* --- AKHIR DARI BAGIAN YANG DIPERBAIKI --- */}
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Separator className="!my-2" />
        
        <DialogFooter className="flex-col sm:flex-row sm:justify-between items-stretch sm:items-center pt-2">
          <div className="text-sm text-muted-foreground text-center sm:text-left mb-4 sm:mb-0 min-h-[40px] flex items-center justify-center sm:justify-start">
            {isSelectionComplete ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <div className="flex items-center gap-2"><Palette className="h-4 w-4 text-primary" /><span className="font-semibold">{selectedService?.name}</span></div>
                <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-primary" /><span className="font-semibold">{selectedDate ? format(selectedDate, 'd MMM yyyy', { locale: indonesiaLocale }) : ''}</span></div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /><span className="font-semibold">{selectedTime}</span></div>
              </div>
            ) : (<p>Lengkapi semua pilihan di atas.</p>)}
          </div>
          <Button onClick={handleConfirm} disabled={!isSelectionComplete || isSubmitting} size="lg" className="h-12 text-base">
            {isSubmitting ? <LoaderCircle className="animate-spin h-5 w-5 mr-2" /> : <ShoppingCart className="h-5 w-5 mr-2" />}
            {isSubmitting ? 'Memproses...' : 'Lanjut ke Checkout'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;