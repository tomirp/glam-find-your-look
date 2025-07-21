// src/pages/ChatPage.tsx

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import ChatInput from '@/components/ChatInput';
import ChatMessage from '@/components/ChatMessage';
import { Skeleton } from '@/components/ui/skeleton';

interface Message {
  id: number;
  content: string;
  sender_id: string;
  created_at: string;
}

const ChatPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfileAndMessages = async () => {
      if (!user || !conversationId) return;

      const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
      if (profile) setProfileId(profile.id);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (!error) setMessages(data);
      setLoading(false);
    };
    fetchProfileAndMessages();
  }, [user, conversationId]);

  useEffect(() => {
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!profileId || !conversationId) return;
    await supabase.from('messages').insert({ content, conversation_id: conversationId, sender_id: profileId });
  };

  if (loading) {
      return (
        <div className="flex flex-col h-screen bg-background">
            <header className="flex items-center p-4 border-b">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-24 ml-4" />
            </header>
            <main className="flex-1 p-4 space-y-4">
                <Skeleton className="h-10 w-3/5 rounded-lg" />
                <div className="flex justify-end">
                    <Skeleton className="h-12 w-2/5 rounded-lg" />
                </div>
                <Skeleton className="h-8 w-1/2 rounded-lg" />
            </main>
            <div className="p-2 border-t">
                <Skeleton className="h-10 w-full rounded-lg" />
            </div>
        </div>
      );
  }

  return (
    // PERBAIKAN UTAMA: Struktur layout baru
    <div className="relative h-screen bg-background">
      {/* Header diposisikan fixed di atas */}
      <header className="fixed top-0 left-0 right-0 flex items-center p-4 border-b bg-background/80 backdrop-blur-sm z-10 h-16">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold ml-4">Chat</h1>
      </header>

      {/* Area Pesan diberi padding atas & bawah agar tidak tertutup header/input */}
      <main className="overflow-y-auto h-full pt-20 pb-16 px-4 space-y-4">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            content={msg.content}
            isMine={msg.sender_id === profileId}
            timestamp={msg.created_at}
          />
        ))}
        <div ref={messagesEndRef} />
      </main>
      
      {/* Input diposisikan fixed di bawah */}
      <div className="fixed bottom-0 left-0 right-0 bg-background z-10">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatPage;