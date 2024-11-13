'use client';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { getRecentChats } from '@/lib/actions';
import { useChat } from '@/utils/context/ChatContext';
import { User } from '@supabase/supabase-js';

export interface RecentChat {
  id: number;
  username: string;
  message: string;
  created_at: string;
  receiver_id: string;
  sender_id: string;
}

export default function RecentChatsList({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const { setChatOpen, setReceiverId } = useChat();
  const [isLoading, setIsLoading] = useState(true);

  //currently the data fetching is kinda unoptimized, we fetch the data every time the dropdown is opened (no clue how to cache with nextjs)
  //(this atleast gives the user the most recent data)
  useEffect(() => {
    const fetchChats = async () => {
      if (!isOpen) return;
      if (isOpen) {
        const result = await getRecentChats();
        if (result.recentChats) {
          setRecentChats(result.recentChats);
        } else {
          console.error(result.error);
        }
        setIsLoading(false);
      }
    };
    fetchChats();
  }, [isOpen]);

  const handleChatOpen = (chat: RecentChat) => {
    setChatOpen(true);
    setReceiverId(
      chat.sender_id === user.id ? chat.receiver_id : chat.sender_id
    );
    setIsOpen(false);
  };
  const recentChatsArray = Object.values(recentChats);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <MessageSquare className="h-5 w-5" />
          <span className="sr-only">Open recent chats</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 ">
        <DropdownMenuLabel className="font-bold text-lg py-2 border-b">
          Recent Chats
        </DropdownMenuLabel>
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : recentChatsArray.length > 0 ? (
          recentChatsArray.map((chat, index) => (
            <div key={chat.id}>
              <DropdownMenuItem
                onSelect={() => handleChatOpen(chat)}
                className="py-2 hover:cursor-pointer"
              >
                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-baseline">
                    <span className="font-medium text-primary">
                      {chat.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(chat.created_at)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {chat.message}
                  </div>
                </div>
              </DropdownMenuItem>
              {index < recentChatsArray.length - 1 && (
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
              )}
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No recent chats
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString([], {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
