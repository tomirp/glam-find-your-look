// src/components/ChatMessage.tsx

import { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Definisikan tipe untuk sebuah pesan
interface Message {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  sender_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ChatMessageProps {
  messages: Message[];
  currentUserId: string;
}

export const ChatMessage = ({ messages, currentUserId }: ChatMessageProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fungsi untuk scroll otomatis ke pesan terbaru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="p-4 space-y-4">
      {messages.map((message) => {
        const isCurrentUser = message.sender_id === currentUserId;
        return (
          <div
            key={message.id}
            className={cn(
              "flex items-end gap-2",
              isCurrentUser ? "justify-end" : "justify-start"
            )}
          >
            {!isCurrentUser && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.profiles?.avatar_url || ''} />
                <AvatarFallback>
                  {message.profiles?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                "max-w-xs md:max-w-md rounded-lg px-3 py-2 text-sm",
                isCurrentUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {message.content}
            </div>
          </div>
        );
      })}
      {/* Elemen kosong untuk referensi scroll */}
      <div ref={messagesEndRef} />
    </div>
  );
};