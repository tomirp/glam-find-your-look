// src/components/ChatPopup.tsx

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, LoaderCircle } from 'lucide-react';
import { ChatMessage } from './ChatMessage'; // <-- PERBAIKAN 1: Nama impor diubah
import { ChatInput } from './ChatInput';

interface ChatPopupProps {
  conversationId: string;
  onClose: () => void;
}

const ChatPopup = ({ conversationId, onClose }: ChatPopupProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [otherParticipant, setOtherParticipant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchConversationDetails = async () => {
      if (!user) return;
      
      try {
        const { data: convData, error: convError } = await supabase
          .from('conversations')
          .select('participant_ids')
          .eq('id', conversationId)
          .single();

        if (convError || !convData) throw convError || new Error("Percakapan tidak ditemukan.");
        
        const participantIds = convData.participant_ids;
        const otherUserId = participantIds.find((id: string) => id !== user.id); 

        if (otherUserId) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, business_name, avatar_url')
            .eq('id', otherUserId)
            .single();
          
          if (profileError) throw profileError;
          setOtherParticipant(profileData);
        }
        
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*, profiles(full_name, avatar_url)')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;
        setMessages(messagesData || []);

      } catch (error: any) {
        toast({ title: "Error", description: `Gagal memuat detail chat: ${error.message}`, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchConversationDetails();

    const subscription = supabase
      .channel(`chat:${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const fetchNewMessageWithProfile = async () => {
            const { data } = await supabase.from('messages').select('*, profiles(full_name, avatar_url)').eq('id', payload.new.id).single();
            if (data) setMessages((prev) => [...prev, data]);
          };
          fetchNewMessageWithProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [conversationId, toast, user]);

  const handleSendMessage = async (text: string, file?: File) => {
    if (!user || (!text.trim() && !file)) return;
    setIsSending(true);

    let imageUrl: string | null = null;

    try {
      // Upload file jika ada
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${conversationId}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from('chat_images').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('chat_images').getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }

      // Insert message dengan image URL
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: text,
        image_url: imageUrl,
      });

      if (error) throw error;

    } catch (error: any) {
      toast({ title: "Gagal Mengirim Pesan", description: error.message, variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96 h-[600px] flex flex-col shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
          <div className="font-bold text-lg">{otherParticipant?.business_name || otherParticipant?.full_name || 'Chat'}</div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="flex-grow p-0 overflow-y-auto">
          {loading ? (
            <div className="flex h-full items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <ChatMessage messages={messages} currentUserId={user?.id || ''} /> // <-- PERBAIKAN 2: Nama komponen diubah
          )}
        </CardContent>
        <CardFooter className="p-0">
          <ChatInput onSendMessage={handleSendMessage} isSending={isSending} />
        </CardFooter>
      </Card>
    </div>
  );
};

export default ChatPopup;