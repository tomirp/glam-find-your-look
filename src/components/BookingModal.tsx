// src/components/BookingModal.tsx

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Clock, Palette } from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  muaData: {
    id: string | undefined;
    name: string;
    location: string;
    vehicle: 'none' | 'motorcycle' | 'car'; // Tambahkan baris ini
    styles: Array<{
      id: string;
      name: string;
      price: string;
    }>;
  };
}

const BookingModal = ({ isOpen, onClose, muaData }: BookingModalProps) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedStyleId, setSelectedStyleId] = useState<string>(muaData.styles[0]?.id || "");

  const selectedStyle = useMemo(() => 
    muaData.styles.find(style => style.id === selectedStyleId) || muaData.styles[0],
    [selectedStyleId, muaData.styles]
  );
  
  const handleConfirm = () => {
    if (!selectedDate || !selectedTime || !selectedStyle) {
      alert("Silakan pilih layanan, tanggal, dan waktu.");
      return;
    }

    const bookingData = {
      muaId: muaData.id,
      muaName: muaData.name,
      muaLocation: muaData.location,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-background flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-center font-heading text-2xl">
            Pesan Jadwal
          </DialogTitle>
          <DialogDescription className="text-center">
            Pilih layanan, tanggal, dan waktu yang Anda inginkan.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-6 py-4">
          
          {/* PERUBAHAN: Pilihan Layanan/Gaya */}
          <div className="space-y-2">
            <Label htmlFor="style" className="flex items-center gap-2 font-medium">
              <Palette className="h-4 w-4" />
              Pilih Gaya Makeup
            </Label>
            <Select value={selectedStyleId} onValueChange={setSelectedStyleId}>
              <SelectTrigger id="style">
                <SelectValue placeholder="Pilih gaya makeup..." />
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

          {/* PERUBAHAN: Kalender untuk memilih tanggal */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-medium">
              <CalendarIcon className="h-4 w-4" />
              Pilih Tanggal
            </Label>
            <div className="flex justify-center rounded-md border">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={isDateDisabled}
                    className="p-0"
                />
            </div>
          </div>

          {/* PERUBAHAN: Input untuk memilih waktu */}
          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-2 font-medium">
              <Clock className="h-4 w-4" />
              Pilih Waktu
            </Label>
            <Input
              id="time"
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        
        <DialogFooter className="pt-4 border-t mt-auto">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!selectedDate || !selectedTime || !selectedStyleId}
              className="w-full sm:w-auto"
            >
              Lanjut ke Checkout
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;