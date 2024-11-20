'use client';
import { PublicUser } from '@/app/types/types';
import { useChat } from '@/utils/context/ChatContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User as UserData } from '@supabase/supabase-js';
import { User, MessageSquare } from 'lucide-react';
import React from 'react';
import Link from 'next/link';

interface CreatorProps {
  publicCreatorData: PublicUser;
  user: UserData | null;
}
export const Creator: React.FC<CreatorProps> = ({
  publicCreatorData,
  user,
}) => {
  const { setChatOpen, setReceiverId } = useChat();

  const handleSendMessage = () => {
    setChatOpen(true);
    setReceiverId(publicCreatorData.id);
  };

  return (
    <>
      <span>{'Creator: '}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span className="font-medium ml-2 cursor-pointer">
            {publicCreatorData.username}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <Link href={`/profile/${publicCreatorData.id}`}>
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Show Profile</span>
            </DropdownMenuItem>
          </Link>
          {user && user.id != publicCreatorData.id && (
            <DropdownMenuItem
              onSelect={handleSendMessage}
              className="cursor-pointer"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Send Message</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
