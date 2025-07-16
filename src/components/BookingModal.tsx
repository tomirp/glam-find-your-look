import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter, // Impor DialogFooter
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
      id: string;
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
    
    if (date < today) return true;
    
    const disabledDates = [
      new Date(2025, 6, 10),
      new Date(2025, 6, 15),
      new Date(2025, 6, 22),
    ];
    
    return disabledDates.some(disabledDate => 
      date.getFullYear() === disabledDate.getFullYear() &&
      date.getMonth() === disabledDate.getMonth() &&
      date.getDate() === disabledDate.getDate()
    );
  };

    return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-background flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-center font-heading">
            Pilih Tanggal & Waktu
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-6">
          {/* ... (konten modal lainnya tetap sama) ... */}
        </div>
        
        <DialogFooter className="pt-4 border-t">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;