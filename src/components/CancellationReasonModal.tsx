import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { LoaderCircle } from 'lucide-react';

interface CancellationReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  title: string;
  description: string;
}

export const CancellationReasonModal = ({ isOpen, onClose, onSubmit, title, description }: CancellationReasonModalProps) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setIsSubmitting(true);
    await onSubmit(reason);
    setIsSubmitting(false);
    onClose();
    setReason(''); // Kosongkan textarea setelah submit
  };

  const handleClose = () => {
    setReason(''); // Kosongkan textarea saat modal ditutup
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Berikan alasan singkat Anda di sini..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>Batal</Button>
          <Button onClick={handleSubmit} disabled={!reason || isSubmitting}>
            {isSubmitting && <LoaderCircle className="animate-spin h-4 w-4 mr-2" />}
            Kirim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};