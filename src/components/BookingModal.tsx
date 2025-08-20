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
  // --- PERUBAHAN: Tambahkan initialData untuk mode "Ubah Jadwal" ---
  initialData?: {
    date: string;
    time: string;
  } | null;
  // --------------------------------------------------------------------
}

const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
const timeSlots = Array.from({ length: 12 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

const BookingModal = ({ isOpen, onClose, muaData, selectedService, initialData }: BookingModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  // --- PERUBAHAN: Gunakan initialData untuk mengisi state awal ---
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialData?.date ? new Date(initialData.date) : undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(initialData?.time);
  // -------------------------------------------------------------
  
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [unavailableTimes, setUnavailableTimes] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(true);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (!initialData) {
        // Hanya reset jika ini bukan mode "Ubah Jadwal"
        setStep(1);
        setSelectedDate(undefined);
        setSelectedTime(undefined);
      }
      setUnavailableDates([]);
      
      const fetchUnavailableDates = async () => {
        // ... (logika fetchUnavailableDates tidak berubah) ...
      };
      fetchUnavailableDates();
    }
  }, [isOpen, muaData.id, toast, initialData]);

  useEffect(() => {
    // ... (useEffect untuk fetchUnavailableTimes tidak berubah) ...
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
      navigate("/checkout", { state: { bookingData }, replace: true }); // Gunakan replace untuk alur yang lebih baik
      onClose();
      setIsSubmitting(false);
  };
  
  const progressValue = (step / 2) * 100;

  const isDateDisabled = (date: Date) => {
    // ... (fungsi isDateDisabled tidak berubah) ...
  };

  if (!selectedService) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md flex flex-col max-h-[90vh]">
        {/* ... sisa JSX tidak berubah ... */}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;