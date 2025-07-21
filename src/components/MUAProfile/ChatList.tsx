// src/components/MUAProfile/ChatList.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

interface Conversation {
  id: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string;
  }
}

const ChatList = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
        if (!user) return;
        setLoading(true);
        const { data: muaProfile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
        if (!muaProfile) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .rpc('get_mua_conversations', { mua_profile_id: muaProfile.id });

        if (!error && data) {
            // PERBAIKAN UTAMA: Gunakan type assertion (as Conversation[]) untuk mengatasi error
            setConversations(data as Conversation[]);
        } else {
            console.error("Error fetching conversations:", error);
        }
        setLoading(false);
    };
    fetchConversations();
  }, [user]);

  const handleConversationClick = (conversationId: string) => {
    if (isMobile) {
      navigate(`/chat/${conversationId}`);
    } else {
      // Di sini Anda bisa menggunakan state management (seperti Zustand atau Context)
      // untuk membuka popup chat dari sini.
      alert(`Buka popup chat untuk ID: ${conversationId}`);
    }
  };

  if (loading) {
    return <p>Memuat percakapan...</p>;
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Daftar Percakapan</CardTitle>
        <CardDescription>Lihat semua percakapan dengan pelanggan Anda.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {conversations.length > 0 ? (
          conversations.map(convo => (
            <div 
              key={convo.id} 
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
              onClick={() => handleConversationClick(convo.id)}
            >
              <Avatar>
                <AvatarImage src={convo.profiles.avatar_url} />
                <AvatarFallback>{convo.profiles.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{convo.profiles.full_name}</p>
                <p className="text-sm text-muted-foreground">Klik untuk melihat percakapan</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Belum ada percakapan.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatList;