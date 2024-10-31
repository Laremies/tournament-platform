'use client';
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User, MessageSquare, AlertCircle, UserRoundX } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { kickPlayer } from '@/lib/actions';
import { User as UserType } from '@supabase/supabase-js';
import { useChat } from '@/utils/context/ChatContext';
import clsx from 'clsx';
import Link from 'next/link';

interface ParticipantProps {
  participant: { userId: string; username: string; avatar_url?: string };
  isCreator?: boolean | null;
  tournamentId: string;
  present: boolean;
  user: UserType | null;
}

export const Participant: React.FC<ParticipantProps> = ({
  participant,
  isCreator,
  tournamentId,
  present,
  user,
}) => {
  const [isKickDialogOpen, setIsKickDialogOpen] = useState(false);
  const { setChatOpen, setReceiverId } = useChat();

  const handleSendMessage = () => {
    setChatOpen(true);
    setReceiverId(participant.userId);
  };

  const handleKickPlayer = async () => {
    // Implement kick player logic
    setIsKickDialogOpen(false);
    const { success, error } = await kickPlayer(
      tournamentId,
      participant.userId
    );
    if (success) {
      toast({
        title: 'Player Kicked',
        description: `Kicked ${participant.username} from the game.`,
      });
    } else {
      toast({
        title: 'Failed to kick player',
        description: error,
      });
    }
  };

  return (
    <div
      key={participant.userId}
      className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200"
    >
      <div className="relative">
        <Avatar>
          <AvatarImage src={participant.avatar_url} alt={''} />
          <AvatarFallback>
            {participant.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {present && (
          <div className="absolute bottom-0 right-0">
            <span className="block h-3 w-3 rounded-full bg-green-400 ring-2 ring-background" />
          </div>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span
            className={clsx('font-medium ml-2', {
              'cursor-pointer': participant.userId !== 'tbd',
              'cursor-not-allowed': participant.userId === 'tbd',
            })}
          >
            {participant.username}
          </span>
        </DropdownMenuTrigger>
        {participant.userId !== 'tbd' && (
          <DropdownMenuContent align="end">
            <Link href={`/profile/${participant.userId}`}>
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Show Profile</span>
              </DropdownMenuItem>
            </Link>
            {user && user.id !== participant.userId && (
              <DropdownMenuItem
                onSelect={() => handleSendMessage()}
                className="cursor-pointer"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Send Message</span>
              </DropdownMenuItem>
            )}
            {isCreator &&
              user?.id !== participant.userId && ( //owner has the ability to kick people
                <DropdownMenuItem
                  onSelect={() => setIsKickDialogOpen(true)}
                  className="cursor-pointer"
                >
                  <UserRoundX className="mr-2 h-4 w-4" />
                  <span>Kick Participant</span>
                </DropdownMenuItem>
              )}
          </DropdownMenuContent>
        )}
      </DropdownMenu>
      <Dialog open={isKickDialogOpen} onOpenChange={setIsKickDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove participant</DialogTitle>
            <DialogDescription>
              Are you sure you want to kick {participant.username} from the
              tournament?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsKickDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleKickPlayer()}>
              <AlertCircle className="mr-2 h-4 w-4" />
              Kick Player
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
