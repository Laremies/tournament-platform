'use client';
import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Tournament, TournamentPlayer } from '@/app/types/types';
import { toast } from '@/hooks/use-toast';
import { kickPlayer } from '@/lib/actions';
import { User as UserType } from '@supabase/supabase-js';

interface ParticipantProps {
  participant: TournamentPlayer;
  isCreator?: boolean | null;
  tournament: Tournament;
  present: boolean;
  user: UserType | null;
}

export const Participant: React.FC<ParticipantProps> = ({
  participant,
  isCreator,
  tournament,
  present,
  user,
}) => {
  const [isKickDialogOpen, setIsKickDialogOpen] = useState(false);

  const handleShowProfile = () => {
    //TODO: redirect to user profile
    //router.push(`/profiles/${participant.users.id}`);
    // OR
    //<Link href={`/profiles/${participant.users.id}`}></Link>
  };

  const handleSendMessage = () => {
    //TODO: open direct message chat box with user
  };

  const handleKickPlayer = async () => {
    // Implement kick player logic
    setIsKickDialogOpen(false);
    const { success, error } = await kickPlayer(tournament.id, participant.id);
    if (success) {
      toast({
        title: 'Player Kicked',
        description: `Kicked ${participant.users.username} from the game.`,
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
      key={participant.id}
      className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200"
    >
      <Avatar className="relative overflow-visible">
        {/* <AvatarImage
          src={participant.users.avatarUrl}
          alt={participant.users.username}
        /> */}
        <AvatarFallback>
          {participant.users.username.charAt(0).toUpperCase()}
        </AvatarFallback>
        {present && (
          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-background z-10" />
        )}
      </Avatar>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span className="font-medium cursor-pointer ml-2">
            {participant.users.username}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => handleShowProfile()}>
            <User className="mr-2 h-4 w-4" />
            <span>Show Profile</span>
          </DropdownMenuItem>
          {user && (
            <DropdownMenuItem onSelect={() => handleSendMessage()}>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Send Message</span>
            </DropdownMenuItem>
          )}
          {isCreator && ( //owner has the ability to kick people
            <DropdownMenuItem onSelect={() => setIsKickDialogOpen(true)}>
              <UserRoundX className="mr-2 h-4 w-4" />
              <span>Kick Participant</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={isKickDialogOpen} onOpenChange={setIsKickDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove participant</DialogTitle>
            <DialogDescription>
              Are you sure you want to kick {participant.users.username} from
              the tournament?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsKickDialogOpen(false)}
            >
              Cancel
            </Button>
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
