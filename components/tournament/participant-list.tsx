'use client';
import { Tournament, TournamentPlayer } from '@/app/types/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';

import React, { useEffect, useState } from 'react';
import { Participant } from './participant-component';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

interface ParticipantListProps {
  tournamentPlayers: TournamentPlayer[];
  creator: boolean | null;
  tournament: Tournament;
  user: User | null;
}

interface UserStatus {
  user: string;
  online_at: string;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({
  tournamentPlayers,
  creator,
  tournament,
  user,
}) => {
  const supabase = createClient();

  const [presentUserState, setPresentUserState] = useState({});
  const [presentUserIds, setPresentUserIds] = useState<string[]>([]);
  useEffect(() => {
    const room = supabase.channel(`tournament:${tournament.id}`);

    const userStatus = {
      user: user?.id || 'non-logged-in',
      online_at: new Date().toISOString(),
    };

    room
      .on('presence', { event: 'sync' }, () => {
        const newState = room.presenceState() as Record<string, UserStatus[]>;
        setPresentUserState(newState);
        setPresentUserIds(
          Object.values(newState)
            .flat()
            .map((status) => (status as UserStatus).user)
        );
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        setPresentUserState({ ...presentUserState, ...newPresences });
        setPresentUserIds(
          Object.values(presentUserState)
            .flat()
            .map((status) => (status as UserStatus).user)
        );
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        setPresentUserState({ ...presentUserState, ...leftPresences });
        setPresentUserIds(
          Object.values(presentUserState)
            .flat()
            .map((status) => (status as UserStatus).user)
        );
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') {
          return;
        }

        await room.track(userStatus);
      });
    return () => {
      room.untrack();
      room.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, tournament.id, user?.id]);

  const viewerNum = presentUserIds.length; //for also showing non logged in users

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-left">Participants</CardTitle>
          <p className="text-gray-500 text-right text-xs ml-4">
            Current viewers: {viewerNum}
          </p>{' '}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          {tournamentPlayers &&
            tournamentPlayers.map((participant) => (
              <Participant
                key={participant.id}
                participant={{
                  userId: participant.user_id,
                  username: participant.users.username,
                  avatar_url: participant.users.avatar_url,
                }}
                isCreator={creator}
                tournamentId={tournament.id}
                present={presentUserIds.includes(participant.user_id)}
                user={user}
              />
            ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
