import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle } from "lucide-react";

interface UploadProgressProps {
  uploading: boolean;
  progress: number;
  error: string | null;
  filename?: string;
  className?: string;
}

export const UploadProgress = ({ 
  uploading, 
  progress, 
  error, 
  filename,
  className = "" 
}: UploadProgressProps) => {
  if (!uploading && !error && progress === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {filename && (
        <div className="text-sm text-muted-foreground truncate">
          {filename}
        </div>
      )}
      
      {uploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Mengunggah...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      {!uploading && error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <XCircle className="h-4 w-4" />
          <span>Upload gagal: {error}</span>
        </div>
      )}
      
      {!uploading && !error && progress === 100 && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <span>Upload berhasil!</span>
        </div>
      )}
    </div>
  );
};