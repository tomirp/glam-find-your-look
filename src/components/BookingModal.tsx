import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Clock } from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  muaData: {
    id: string | undefined;
    name: string;
    location: string;
    styles: Array<{
      id: number;
      name: string;
      price: string;
    }>;
  };
}

const BookingModal = ({ isOpen, onClose, muaData }: BookingModalProps) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(muaData.styles[0]);

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) {
      alert("Silakan pilih tanggal dan waktu");
      return;
    }

    // Navigate to checkout with booking data
    const bookingData = {
      muaId: muaData.id,
      muaName: muaData.name,
      muaLocation: muaData.location,
      service: selectedStyle.name,
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
    
    // Disable past dates
    if (date < today) return true;
    
    // Mock: disable some random dates as "already booked"
    const disabledDates = [
      new Date(2025, 6, 10), // July 10, 2025
      new Date(2025, 6, 15), // July 15, 2025
      new Date(2025, 6, 22), // July 22, 2025
    ];
    
    return disabledDates.some(disabledDate => 
      date.getFullYear() === disabledDate.getFullYear() &&
      date.getMonth() === disabledDate.getMonth() &&
      date.getDate() === disabledDate.getDate()
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-background">
        <DialogHeader>
          <DialogTitle className="text-center font-heading">
            Pilih Tanggal & Waktu
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Service Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Pilih Layanan</Label>
            <select
              value={selectedStyle.id}
              onChange={(e) => {
                const style = muaData.styles.find(s => s.id === parseInt(e.target.value));
                if (style) setSelectedStyle(style);
              }}
              className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-foreground"
            >
              {muaData.styles.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.name} - {style.price}
                </option>
              ))}
            </select>
          </div>

          {/* Calendar */}
          <div>
            <Label className="text-sm font-medium mb-2 block flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1" />
              Pilih Tanggal
            </Label>
            <div className="border border-input rounded-md p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={isDateDisabled}
                initialFocus
                className="w-full"
              />
            </div>
          </div>

          {/* Time Input */}
          <div>
            <Label htmlFor="time" className="text-sm font-medium mb-2 block flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Pilih Waktu
            </Label>
            <Input
              id="time"
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              min="08:00"
              max="20:00"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Jam operasional: 08:00 - 20:00
            </p>
          </div>

          {/* Selected Info */}
          {selectedDate && selectedTime && (
            <div className="bg-secondary/20 p-3 rounded-md">
              <p className="text-sm font-medium">Booking untuk:</p>
              <p className="text-sm text-muted-foreground">
                {selectedDate.toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} pada {selectedTime}
              </p>
              <p className="text-sm text-muted-foreground">
                Layanan: {selectedStyle.name}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Batal
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!selectedDate || !selectedTime}
              className="flex-1"
            >
              Konfirmasi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;