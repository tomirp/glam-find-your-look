// src/components/BookingModal.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ShoppingCart, LoaderCircle, Palette, Calendar as CalendarIcon, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { id as indonesiaLocale } from 'date-fns/locale';
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";

// --- Tipe Data ---
interface SelectedService {
  id: string;
  name: string;
  price_min: number;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  muaData: {
    id: string;
    business_name: string;
    avatar_url?: string;
  };
  selectedService: SelectedService | null;
}

// --- Fungsi Helper ---
const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
const timeSlots = Array.from({ length: 12 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

// --- Komponen Utama ---
const BookingModal = ({ isOpen, onClose, muaData, selectedService }: BookingModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [unavailableTimes, setUnavailableTimes] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(true);
  const [loadingTimes, setLoadingTimes] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedDate(undefined);
      setSelectedTime(undefined);
      setUnavailableDates([]);
      
      const fetchUnavailableDates = async () => {
        setLoadingDates(true);
        try {
          const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('booking_date')
            .eq('mua_profile_id', muaData.id)
            .in('status', ['accepted', 'pending']);
          if (bookingsError) throw bookingsError;

          // --- PERBAIKAN DI SINI: Gunakan nama tabel dan kolom yang benar ---
          const { data: blockedSlots, error: blockedSlotsError } = await supabase
            .from('mua_blocked_slots') // Nama tabel yang benar
            .select('start_time')      // Nama kolom yang benar
            .eq('mua_profile_id', muaData.id);
          // -----------------------------------------------------------------
          if (blockedSlotsError) throw blockedSlotsError;
          
          const bookedDates = bookings.map(b => new Date(b.booking_date + 'T00:00:00'));
          // --- PERBAIKAN DI SINI: Proses kolom 'start_time' ---
          const blockedDates = blockedSlots.map(s => {
            const date = new Date(s.start_time);
            date.setHours(0, 0, 0, 0); // Normalisasi ke awal hari
            return date;
          });
          // ----------------------------------------------------
          
          setUnavailableDates([...bookedDates, ...blockedDates]);

        } catch (error) {
          console.error("Gagal mengambil tanggal tidak tersedia:", error);
          toast({ title: "Error", description: "Gagal memuat jadwal MUA.", variant: "destructive" });
        } finally {
          setLoadingDates(false);
        }
      };
      fetchUnavailableDates();
    }
  }, [isOpen, muaData.id, toast]);

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
        const { data, error } = await supabase.from('bookings').select('booking_time').eq('mua_profile_id', muaData.id).eq('booking_date', formattedDate).in('status', ['accepted', 'pending']);
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

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleConfirm = () => {
    if (!selectedService || !selectedDate || !selectedTime) {
        toast({ title: "Belum Lengkap", description: "Terjadi kesalahan, data tidak lengkap.", variant: "destructive" });
        return;
      }
      setIsSubmitting(true);
      const bookingData = {
        muaId: muaData.id,
        muaName: muaData.business_name,
        muaAvatar: muaData.avatar_url,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        price: selectedService.price_min,
        date: selectedDate.toISOString(),
        time: selectedTime,
      };
      navigate("/checkout", { state: { bookingData } });
      onClose();
      setIsSubmitting(false);
  };
  
  const progressValue = (step / 2) * 100;
  
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return true;

    return unavailableDates.some(
      unavailableDate =>
        date.getFullYear() === unavailableDate.getFullYear() &&
        date.getMonth() === unavailableDate.getMonth() &&
        date.getDate() === unavailableDate.getDate()
    );
  };

  if (!selectedService) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-center font-heading text-2xl">Buat Jadwal Pesanan</DialogTitle>
          <DialogDescription className="text-center">Lengkapi pesanan untuk layanan:</DialogDescription>
          <p className="text-center font-semibold text-primary text-lg">{selectedService.name}</p>
        </DialogHeader>

        <Progress value={progressValue} className="w-full mt-2" />

        <div className="flex-grow py-4 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4">
                <div>
                <Label className="font-semibold text-base">Langkah 1: Pilih Tanggal & Waktu</Label>
                    <div className="flex justify-center rounded-md border bg-background mt-2">
                        {loadingDates ? (
                            <div className="p-2 w-full">
                                <Skeleton className="h-[280px] w-full" />
                            </div>
                        ) : (
                            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} disabled={isDateDisabled} className="p-2" />
                        )}
                    </div>
                </div>
                {selectedDate && (
                    <div>
                        <Label className="font-semibold text-base">Pilih Waktu</Label>
                        <Card className="mt-2">
                            <CardContent className="p-2">
                            {loadingTimes ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
                            ) : (
                                <ScrollArea className="h-48">
                                <ToggleGroup type="single" variant="outline" value={selectedTime} onValueChange={(value) => { if (value) setSelectedTime(value); }} className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2">
                                    {timeSlots.map(time => (<ToggleGroupItem key={time} value={time} className="h-10 text-base" disabled={unavailableTimes.includes(time)}>{time}</ToggleGroupItem>))}
                                </ToggleGroup>
                                </ScrollArea>
                            )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-center">
                <Label className="font-semibold text-base">Langkah 2: Konfirmasi Pesanan</Label>
                <Card className="mt-2 text-left">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-start gap-4"><Palette className="h-5 w-5 text-primary mt-1 flex-shrink-0" /><span className="font-semibold">{selectedService.name}</span></div>
                        <div className="flex items-center gap-4"><CalendarIcon className="h-5 w-5 text-primary" /><span className="font-semibold">{selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: indonesiaLocale }) : ''}</span></div>
                        <div className="flex items-center gap-4"><Clock className="h-5 w-5 text-primary" /><span className="font-semibold">{selectedTime}</span></div>
                        <Separator />
                        <div className="flex justify-between items-center"><span className="font-semibold">Harga Layanan</span><span className="font-bold text-lg text-primary">{formatCurrency(selectedService.price_min)}</span></div>
                    </CardContent>
                </Card>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex-shrink-0 pt-4">
          <div className="w-full flex justify-between items-center space-x-2">
            {step > 1 ? (<Button variant="outline" onClick={handleBack}><ArrowLeft className="h-4 w-4 mr-2" />Kembali</Button>) : (<div></div>)}
            {step === 1 && (<Button onClick={handleNext} disabled={!selectedDate || !selectedTime}>Lanjut <ArrowRight className="h-4 w-4 ml-2" /></Button>)}
            {step === 2 && (<Button onClick={handleConfirm} disabled={isSubmitting}>{isSubmitting ? <LoaderCircle className="animate-spin h-5 w-5 mr-2" /> : <ShoppingCart className="h-5 w-5 mr-2" />}{isSubmitting ? 'Proses...' : 'Konfirmasi Pesanan'}</Button>)}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;