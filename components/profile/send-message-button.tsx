'use client';

import { Button } from '@/components/ui/button';
import { MessagesSquare } from 'lucide-react';
import { useChat } from '@/utils/context/ChatContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function SendMessageButton({ userId }: { userId: string }) {
  const { setChatOpen, setReceiverId } = useChat();

  const handleSendMessage = async () => {
    setChatOpen(true);
    setReceiverId(userId);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleSendMessage}
            variant={'ghost'}
            className="transition-all duration-200 ease-in-out p-1"
          >
            <MessagesSquare className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Open Chat</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
