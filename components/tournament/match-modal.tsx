import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SingleEliminationMatch } from '@/app/types/types';
import { User } from '@supabase/supabase-js';
import { Participant } from './participant-component';
import { useToast } from '@/hooks/use-toast';
import clsx from 'clsx';
import { submitMatchResult } from '@/lib/actions';

interface MatchModalProps {
  match: SingleEliminationMatch;
  user: User | null;
}

export const MatchModal: React.FC<MatchModalProps> = ({ match, user }) => {
  const [open, setOpen] = useState(false);
  const [winner, setWinner] = useState<string | undefined>(match.winner_id);
  const { toast } = useToast();

  const homePlayer = {
    userId: match.home_player_id || 'tbd',
    username: match.homePlayerUsername || 'TBD',
    avatar_url: match.homePlayerAvatarUrl,
  };
  const awayPlayer = {
    userId: match.away_player_id || 'tbd',
    username: match.awayPlayerUsername || 'TBD',
    avatar_url: match.awayPlayerAvatarUrl,
  };

  const matchHasBothPlayers =
    homePlayer.userId !== 'tbd' && awayPlayer.userId !== 'tbd';

  const handleSetWinner = async (winnerId: string) => {
    if (match.id) {
      try {
        await submitMatchResult(match.tournament_id, match.id, winnerId);
        setWinner(winnerId);

        toast({
          title: 'Winner set',
          description: `The winner has been set to ${winnerId === homePlayer.userId ? homePlayer.username : awayPlayer.username}.`,
        });

        setOpen(false);
      } catch (error) {
        toast({
          title: 'Failed to set winner',
          description: `An error occurred while setting the winner: ${error}`,
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          Match Results
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Match Results</DialogTitle>
          <DialogDescription>
            {!matchHasBothPlayers
              ? 'Both players must be present to set the winner.'
              : winner
                ? 'The winner has already been set. Please contact the organizer for any disputes.'
                : 'Please select the winner of the match.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col">
          <div className="flex justify-around">
            <div>
              <div
                className={clsx({
                  'text-green-600 font-semibold':
                    winner && winner === homePlayer.userId,
                  'text-red-600 text-opacity-75':
                    winner && winner !== homePlayer.userId,
                  'text-muted-foreground': !homePlayer.userId,
                })}
              >
                <Label>Home Player</Label>
                <Participant
                  participant={homePlayer}
                  user={user}
                  tournamentId={match.tournament_id}
                  present={false}
                />
              </div>
              <Button
                onClick={() => handleSetWinner(homePlayer.userId)}
                variant="outline"
                disabled={!!winner || !matchHasBothPlayers}
                className="mt-2"
              >
                Set as Winner
              </Button>
            </div>
            <div>
              <div
                className={clsx({
                  'text-green-600 font-semibold':
                    winner && winner === awayPlayer.userId,
                  'text-red-600 text-opacity-75':
                    winner && winner !== awayPlayer.userId,
                  'text-muted-foreground': !awayPlayer.userId,
                })}
              >
                <Label>Away Player</Label>
                <Participant
                  participant={awayPlayer}
                  user={user}
                  tournamentId={match.tournament_id}
                  present={false}
                />
              </div>
              <Button
                onClick={() => handleSetWinner(awayPlayer.userId)}
                variant="outline"
                disabled={!!winner || !matchHasBothPlayers}
                className="mt-2"
              >
                Set as Winner
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
