// src/components/BookingModal.tsx

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Clock, Palette, ShoppingCart, Info } from "lucide-react";
import { format } from "date-fns";
import { id as indonesiaLocale } from 'date-fns/locale';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  muaData: {
    id: string | undefined;
    name: string;
    location: string;
    vehicle: 'none' | 'motorcycle' | 'car';
    styles: Array<{
      id: string;
      name: string;
      price: string;
    }>;
  };
}

// PERBAIKAN UTAMA: Membuat slot waktu 24 jam secara dinamis
const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
});


const BookingModal = ({ isOpen, onClose, muaData }: BookingModalProps) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedStyleId, setSelectedStyleId] = useState<string | undefined>(undefined);

  const selectedStyle = useMemo(() => 
    muaData.styles.find(style => style.id === selectedStyleId),
    [selectedStyleId, muaData.styles]
  );
  
  const handleConfirm = () => {
    if (!selectedDate || !selectedTime || !selectedStyle) {
      alert("Silakan lengkapi semua pilihan.");
      return;
    }

    const bookingData = {
      muaId: muaData.id,
      muaName: muaData.name,
      muaLocation: muaData.location,
      vehicle: muaData.vehicle,
      service: selectedStyle.name,
      serviceId: selectedStyle.id,
      price: selectedStyle.price,
      date: selectedDate.toISOString(),
      time: selectedTime
    };

    navigate("/checkout", { state: { bookingData } });
    onClose();
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isComplete = selectedDate && selectedTime && selectedStyleId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md md:max-w-3xl flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-center font-heading text-2xl">
            Buat Jadwal Pesanan
          </DialogTitle>
          <DialogDescription className="text-center">
            Ikuti langkah-langkah di bawah untuk mengamankan jadwal Anda.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-6 py-4">
          
          {/* Langkah 1: Pilih Layanan */}
          <div className="space-y-3">
            <Label className="flex items-center gap-3 font-semibold text-lg">
              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-base">1</span>
              Pilih Layanan Makeup
            </Label>
            <Select value={selectedStyleId} onValueChange={setSelectedStyleId}>
              <SelectTrigger id="style" className="h-12 text-base">
                <SelectValue placeholder="Klik untuk memilih gaya makeup..." />
              </SelectTrigger>
              <SelectContent>
                {muaData.styles.map((style) => (
                  <SelectItem key={style.id} value={style.id}>
                    <div className="flex justify-between w-full">
                      <span>{style.name}</span>
                      <span className="text-muted-foreground">{style.price}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Langkah 2 & 3: Pilih Tanggal & Waktu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
            <div className="space-y-3">
                <Label className="flex items-center gap-3 font-semibold text-lg">
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-base">2</span>
                    Pilih Tanggal
                </Label>
                <div className="flex justify-center rounded-md border bg-background">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={isDateDisabled}
                        className="p-3"
                    />
                </div>
            </div>

            <div className="space-y-3">
                <Label className="flex items-center gap-3 font-semibold text-lg">
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-base">3</span>
                    Pilih Waktu Tersedia
                </Label>
                {!selectedDate ? (
                    <div className="h-60 flex items-center justify-center text-center bg-accent/30 rounded-md">
                        <p className="text-muted-foreground"><Info className="h-5 w-5 mx-auto mb-2" />Pilih tanggal terlebih dahulu<br/>untuk melihat slot waktu.</p>
                    </div>
                ) : (
                    // PERBAIKAN: Grid sekarang menjadi 4 kolom agar pas
                    <ToggleGroup type="single" variant="outline" onValueChange={(value) => {if (value) setSelectedTime(value)}} className="grid grid-cols-4 gap-2">
                        {timeSlots.map(time => (
                            <ToggleGroupItem key={time} value={time} className="h-12 text-base">
                                {time}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                )}
            </div>
          </div>
        </div>
        
        {/* Ringkasan & Footer */}
        <Separator className="mt-4" />
        <DialogFooter className="flex-col sm:flex-row sm:justify-between items-stretch sm:items-center pt-4">
            <div className="text-sm text-muted-foreground text-center sm:text-left mb-4 sm:mb-0 min-h-[40px] flex items-center justify-center sm:justify-start">
                {isComplete ? (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <div className="flex items-center gap-2"><Palette className="h-4 w-4" /><span className="font-semibold">{selectedStyle?.name}</span></div>
                        <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" /><span className="font-semibold">{selectedDate ? format(selectedDate, 'd MMM yyyy') : ''}</span></div>
                        <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span className="font-semibold">{selectedTime}</span></div>
                    </div>
                ) : (
                    <p>Harap lengkapi semua pilihan di atas.</p>
                )}
            </div>
            <Button 
              onClick={handleConfirm}
              disabled={!isComplete}
              size="lg"
              className="h-12 text-base"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Lanjut ke Checkout
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;