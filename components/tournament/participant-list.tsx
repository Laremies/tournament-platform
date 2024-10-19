import { Tournament, TournamentPlayer } from '@/app/types/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';

import React from 'react';
import { Participant } from './participant-component';

interface ParticipantListProps {
  tournamentPlayers: TournamentPlayer[];
  creator: boolean | null;
  tournament: Tournament;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({
  tournamentPlayers,
  creator,
  tournament,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          {tournamentPlayers &&
            tournamentPlayers.map((participant) => (
              <Participant
                key={participant.id}
                participant={participant}
                isCreator={creator}
                tournament={tournament}
              />
            ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
