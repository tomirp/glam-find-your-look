// src/components/CustomerProfile/ChatList.tsx

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
    business_name: string;
  }
}

// PERBAIKAN UTAMA: Mendefinisikan tipe untuk props yang diterima
interface CustomerChatListProps {
  onConversationSelect: (conversationId: string) => void;
}

const CustomerChatList = ({ onConversationSelect }: CustomerChatListProps) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
        if (!user) return;
        setLoading(true);
        const { data: customerProfile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
        if (!customerProfile) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .rpc('get_customer_conversations', { customer_profile_id: customerProfile.id });

        if (!error && data) {
            setConversations(data as Conversation[]);
        } else {
            console.error("Error fetching conversations:", error);
        }
        setLoading(false);
    };
    fetchConversations();
  }, [user]);

  if (loading) {
    return <p>Memuat percakapan...</p>;
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Percakapan Anda</CardTitle>
        <CardDescription>Lihat semua percakapan Anda dengan MUA.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {conversations.length > 0 ? (
          conversations.map(convo => (
            <div 
              key={convo.id} 
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
              // PERBAIKAN UTAMA: Menggunakan prop onConversationSelect yang sudah didefinisikan
              onClick={() => onConversationSelect(convo.id)}
            >
              <Avatar>
                <AvatarImage src={convo.profiles.avatar_url} />
                <AvatarFallback>{convo.profiles.business_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{convo.profiles.business_name}</p>
                <p className="text-sm text-muted-foreground">{convo.profiles.full_name}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Belum ada percakapan.</p>
            <p className="text-sm">Mulai chat dengan MUA dari halaman detail mereka.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerChatList;