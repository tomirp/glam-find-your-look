// src/pages/ChatPage.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { ChatInput } from '@/components/ChatInput'; // 1. Impor yang benar
import { ChatMessage } from '@/components/ChatMessage'; // 2. Impor yang benar

const ChatPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<any[]>([]);
  const [otherParticipant, setOtherParticipant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false); // 3. State untuk loading kirim pesan

  useEffect(() => {
    if (!conversationId || !user) {
      navigate('/');
      return;
    }

    const fetchConversationDetails = async () => {
      setLoading(true);
      try {
        // Ambil info percakapan
        const { data: convData, error: convError } = await supabase
          .from('conversations')
          .select('participant_ids')
          .eq('id', conversationId)
          .single();

        if (convError) throw convError;

        const otherUserId = convData.participant_ids.find((id: string) => id !== user.id);
        if (otherUserId) {
          const { data: profileData } = await supabase.from('profiles').select('*').eq('id', otherUserId).single();
          setOtherParticipant(profileData);
        }

        // Ambil pesan
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*, profiles(full_name, avatar_url)')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
        
        if (messagesError) throw messagesError;
        setMessages(messagesData || []);

      } catch (error: any) {
        toast({ title: "Error", description: `Gagal memuat chat: ${error.message}`, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchConversationDetails();

    // Setup listener untuk pesan baru (realtime)
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

  }, [conversationId, user, navigate, toast]);

  // --- INI ADALAH LOGIKA PENGIRIMAN GAMBAR YANG BARU ---
  const handleSendMessage = async (content: string, file?: File) => {
    if (!user || (!content.trim() && !file)) return;

    setIsSending(true);
    let imageUrl: string | null = null;

    try {
      // Langkah A: Jika ada file, unggah terlebih dahulu
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        // Path file dibuat unik untuk setiap percakapan
        const filePath = `${conversationId}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from('chat_images').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('chat_images').getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }

      // Langkah B: Simpan pesan ke database (termasuk URL gambar jika ada)
      const { error: insertError } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content,
        image_url: imageUrl, // Simpan URL gambar di sini
      });

      if (insertError) throw insertError;

    } catch (error: any) {
      toast({ title: "Gagal Mengirim Pesan", description: error.message, variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center p-4 border-b bg-background sticky top-0 z-10">
        <Button variant="ghost" size="icon" className="mr-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">{otherParticipant?.business_name || otherParticipant?.full_name || 'Chat'}</h2>
      </header>
      <main className="flex-grow overflow-y-auto">
        <ChatMessage messages={messages} currentUserId={user?.id || ''} />
      </main>
      <footer className="sticky bottom-0">
        {/* 4. Berikan prop 'isSending' ke ChatInput */}
        <ChatInput onSendMessage={handleSendMessage} isSending={isSending} />
      </footer>
    </div>
  );
};

export default ChatPage;