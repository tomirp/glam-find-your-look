// src/components/ChatInput.tsx

import { useState, useRef, ChangeEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, X, LoaderCircle } from 'lucide-react';
import { useUploadProgress } from '@/hooks/useUploadProgress';
import { UploadProgress } from '@/components/ui/upload-progress';

// 1. Perbarui tipe props untuk menangani pengiriman file
interface ChatInputProps {
  onSendMessage: (text: string, file?: File) => void;
  isSending: boolean;
}

export const ChatInput = ({ onSendMessage, isSending }: ChatInputProps) => {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, progress } = useUploadProgress();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = () => {
    // Memastikan tidak mengirim pesan kosong (baik teks maupun gambar)
    if ((!text.trim() && !selectedFile) || isSending || uploading) return;

    onSendMessage(text, selectedFile || undefined);
    
    // Reset state setelah mengirim
    setText('');
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clearFileSelection = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-background p-4">
      {/* 2. Tambahkan area untuk menampilkan pratinjau gambar */}
      {filePreview && (
        <div className="mb-2 space-y-2">
          <div className="relative w-24 h-24">
            <img src={filePreview} alt="Pratinjau gambar" className="rounded-md object-cover w-full h-full" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={clearFileSelection}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <UploadProgress 
            uploading={uploading} 
            progress={progress} 
            error={null}
            filename={selectedFile?.name}
          />
        </div>
      )}

      <div className="relative flex items-center">
        {/* 3. Tambahkan tombol klip kertas untuk memilih gambar */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        <Button variant="ghost" size="icon" onClick={handleImageButtonClick} className="mr-2">
          <Paperclip className="h-5 w-5" />
        </Button>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ketik pesan Anda di sini..."
          className="flex-1 resize-none pr-20"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={isSending || uploading || (!text.trim() && !selectedFile)}
          className="absolute right-2 top-1/2 -translate-y-1/2"
          size="icon"
        >
          {(isSending || uploading) ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};