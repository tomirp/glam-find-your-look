// src/components/ChatMessage.tsx

import { cn } from '@/lib/utils';

interface ChatMessageProps {
  content: string;
  isMine: boolean;
  timestamp: string;
}

const ChatMessage = ({ content, isMine, timestamp }: ChatMessageProps) => {
  const time = new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={cn('flex items-end gap-2', isMine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-xs md:max-w-md rounded-lg px-3 py-2',
          isMine ? 'bg-primary text-primary-foreground' : 'bg-accent'
        )}
      >
        <p className="text-sm">{content}</p>
        <p className="text-xs opacity-70 mt-1 text-right">{time}</p>
      </div>
    </div>
  );
};

export default ChatMessage;