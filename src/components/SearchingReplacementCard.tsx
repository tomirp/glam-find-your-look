// src/components/SearchingReplacementCard.tsx

import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

// Komponen loading bar dengan animasi
const LoadingBar = () => (
    <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div className="absolute top-0 left-0 h-full bg-purple-500 rounded-full w-full animate-[slide_2s_linear_infinite]"></div>
      <style>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
);

// Tipe data booking yang dibutuhkan oleh komponen ini
interface BookingForCard {
    mua_profiles: { business_name: string | null; };
    services: { name: string | null; };
    booking_date: string;
}

interface SearchingReplacementCardProps {
    booking: BookingForCard;
}

export const SearchingReplacementCard = ({ booking }: SearchingReplacementCardProps) => {
    return (
        <div className="p-4 sm:p-6 bg-yellow-50/50 rounded-xl border-2 border-dashed border-yellow-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Info Utama */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
                        <h4 className="font-semibold font-heading text-lg text-yellow-800">MUA Membatalkan Pesanan</h4>
                    </div>
                    <p className="text-sm text-yellow-700">
                        Pesanan Anda untuk layanan "{booking.services?.name || 'N/A'}" pada tanggal {new Date(booking.booking_date).toLocaleDateString('id-ID')} telah dibatalkan.
                    </p>
                </div>

                {/* Status Pencarian */}
                <div className="w-full sm:w-1/3 text-left sm:text-right space-y-2">
                     <p className="text-sm font-semibold text-purple-700">
                       Sistem sedang mencari MUA pengganti...
                    </p>
                    <LoadingBar />
                </div>
            </div>
        </div>
    );
}