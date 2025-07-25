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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, LoaderCircle, Palette, CalendarIcon, Clock, Info } from "lucide-react";
import { format } from "date-fns";

// Tipe Data
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

const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
const timeSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
const isDateDisabled = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

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
      toast({ title: "Belum Lengkap", description: "Pastikan Anda telah memilih layanan, tanggal, dan waktu.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    const bookingData = {
      muaId: muaData.id,
      muaName: muaData.name,
      muaLocation: muaData.location,
      vehicle: muaData.vehicle,
      serviceId: selectedService!.id,
      serviceName: selectedService!.name,
      // --- PERBAIKAN UTAMA: Kirim harga sebagai string yang sudah diformat ---
      price: formatCurrency(selectedService!.price_min),
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
          <DialogDescription className="text-center">Ikuti langkah-langkah di bawah untuk mengamankan jadwal Anda.</DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-6 py-4">
          <div className="space-y-3">
            <Label className="flex items-center gap-3 font-semibold text-lg">
              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground">1</span>
              Pilih Layanan
            </Label>
            <Select onValueChange={setSelectedServiceId} value={selectedServiceId}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Klik untuk memilih gaya makeup..." />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex justify-between w-full">
                      <span>{service.name}</span>
                      <span className="text-muted-foreground">{formatCurrency(service.price_min)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
            <div className="space-y-3">
              <Label className="flex items-center gap-3 font-semibold text-lg">
                <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground">2</span>
                Pilih Tanggal
              </Label>
              <div className="flex justify-center rounded-md border bg-background">
                <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} disabled={isDateDisabled} className="p-3" />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="flex items-center gap-3 font-semibold text-lg">
                <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground">3</span>
                Pilih Waktu
              </Label>
              {!selectedDate ? (
                <div className="h-60 flex items-center justify-center text-center bg-accent/30 rounded-md">
                  <p className="text-muted-foreground"><Info className="h-5 w-5 mx-auto mb-2" />Pilih tanggal terlebih dahulu.</p>
                </div>
              ) : loadingTimes ? (
                <div className="h-60 flex items-center justify-center"><LoaderCircle className="animate-spin h-8 w-8 text-primary"/></div>
              ) : (
                <ToggleGroup type="single" variant="outline" onValueChange={setSelectedTime} value={selectedTime} className="grid grid-cols-4 gap-2">
                  {timeSlots.map(time => (
                    <ToggleGroupItem key={time} value={time} className="h-12 text-base" disabled={unavailableTimes.includes(time)}>
                      {time}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              )}
            </div>
          </div>
        </div>

        <Separator className="!mt-4" />

        <DialogFooter className="flex-col sm:flex-row sm:justify-between items-stretch sm:items-center pt-4">
          <div className="text-sm text-muted-foreground text-center sm:text-left mb-4 sm:mb-0 min-h-[40px] flex items-center justify-center sm:justify-start">
            {isSelectionComplete ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <div className="flex items-center gap-2"><Palette className="h-4 w-4" /><span className="font-semibold">{selectedService?.name}</span></div>
                <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" /><span className="font-semibold">{selectedDate ? format(selectedDate, 'd MMM yyyy') : ''}</span></div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span className="font-semibold">{selectedTime}</span></div>
              </div>
            ) : (
              <p>Lengkapi semua pilihan di atas.</p>
            )}
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