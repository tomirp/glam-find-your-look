// src/pages/ChatPage.tsx

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import ChatInput from '@/components/ChatInput';
import ChatMessage from '@/components/ChatMessage';

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!profileId || !conversationId) return;
    // PERBAIKAN: Menggunakan snake_case `conversation_id` sesuai skema database
    await supabase.from('messages').insert({ content, conversation_id: conversationId, sender_id: profileId });
  };

  if (loading) return <div>Memuat percakapan...</div>;

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold ml-4">Chat</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
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
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatPage;