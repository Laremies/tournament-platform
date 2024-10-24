import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SingleEliminationMatch } from '@/app/types/types';
import { User } from '@supabase/supabase-js';
import { Participant } from './participant-component';

interface MatchModalProps {
  match: SingleEliminationMatch;
  user: User | null;
}

export const MatchModal: React.FC<MatchModalProps> = ({ match, user }) => {
  const [open, setOpen] = useState(false);

  const homePlayer = { userId: match.home_player_id || 'tbd', username: match.homePlayerUsername || 'TBD' };
  const awayPlayer = { userId: match.away_player_id || 'tbd', username: match.awayPlayerUsername || 'TBD' };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          Match Details
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Match Details</DialogTitle>
          <DialogDescription>View the details of this match</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between">
            <div>
              <Label>Home Player</Label>
              <Participant
                participant={homePlayer}
                user={user}
                tournamentId={match.tournament_id}
                present={false}
              />
            </div>
            <div>
              <Label>Away Player</Label>
              <Participant
                participant={awayPlayer}
                user={user}
                tournamentId={match.tournament_id}
                present={false}
              />
            </div>
          </div>
          <div>
            <Label>Match Date</Label>
            <Input type="date" value={'match.match.match_date'} disabled />
          </div>
          <div>
            <Label>Match Time</Label>
            <Input type="time" value={'match.match.match_time'} disabled />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
