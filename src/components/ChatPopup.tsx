// src/components/ChatPopup.tsx

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

interface Message {
  id: number;
  content: string;
  sender_id: string;
  created_at: string;
}

interface ChatPopupProps {
  conversationId: string;
  onClose: () => void;
}

const ChatPopup = ({ conversationId, onClose }: ChatPopupProps) => {
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

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 h-[28rem] shadow-lg flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between p-2 border-b">
          <CardTitle className="text-base font-semibold">Chat</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 p-2 overflow-y-auto space-y-4">
          {loading ? <p>Memuat...</p> : messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              content={msg.content}
              isMine={msg.sender_id === profileId}
              timestamp={msg.created_at}
            />
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
        <ChatInput onSendMessage={handleSendMessage} />
      </Card>
    </div>
  );
};

export default ChatPopup;