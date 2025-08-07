import { CheckCircle } from "lucide-react";

interface VerifiedBadgeProps {
  clientName?: string;
  verifiedAt?: string;
  className?: string;
}

export const VerifiedBadge = ({ clientName, verifiedAt, className = "" }: VerifiedBadgeProps) => {
  return (
    <div className={`inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      <CheckCircle className="h-3 w-3" />
      <span>Terverifikasi Klien</span>
      {clientName && (
        <span className="text-green-600">• {clientName}</span>
      )}
    </div>
  );
};