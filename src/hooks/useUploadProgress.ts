import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UploadProgressState {
  uploading: boolean;
  progress: number;
  error: string | null;
}

export const useUploadProgress = () => {
  const [state, setState] = useState<UploadProgressState>({
    uploading: false,
    progress: 0,
    error: null,
  });

  const uploadFile = async (
    bucket: string,
    path: string,
    file: File,
    options?: { cacheControl?: string; upsert?: boolean }
  ): Promise<string> => {
    setState({ uploading: true, progress: 0, error: null });

    try {
      // Simulate progress for now since Supabase doesn't support onUploadProgress
      const progressInterval = setInterval(() => {
        setState(prev => {
          if (prev.progress < 90) {
            return { ...prev, progress: prev.progress + 10 };
          }
          return prev;
        });
      }, 100);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: options?.cacheControl || '3600',
          upsert: options?.upsert || false,
        });

      clearInterval(progressInterval);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      
      setState({ uploading: false, progress: 100, error: null });
      return urlData.publicUrl;
    } catch (error: any) {
      setState({ uploading: false, progress: 0, error: error.message });
      throw error;
    }
  };

  const reset = () => {
    setState({ uploading: false, progress: 0, error: null });
  };

  return {
    ...state,
    uploadFile,
    reset,
  };
};