'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
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
import { overrideMatchResult, submitMatchResult } from '@/lib/actions';
import { Loader2 } from 'lucide-react';

interface MatchModalProps {
  match: SingleEliminationMatch;
  user: User | null;
  creatorIsOverriding: boolean;
}

export const MatchModal: React.FC<MatchModalProps> = ({
  match,
  user,
  creatorIsOverriding,
}) => {
  const [open, setOpen] = useState(false);
  const [winner, setWinner] = useState<string | undefined>(match.winner_id);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingWinner, setPendingWinner] = useState<string | null>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const homePlayer = {
    userId: match.home_player_id || 'tbd',
    username: match.home_player_id ? match.homePlayerUsername : 'TBD',
    avatar_url: match.homePlayerAvatarUrl,
  };
  const awayPlayer = {
    userId: match.away_player_id || 'tbd',
    username: match.away_player_id ? match.awayPlayerUsername : 'TBD',
    avatar_url: match.awayPlayerAvatarUrl,
  };

  const matchHasBothPlayers =
    homePlayer.userId !== 'tbd' && awayPlayer.userId !== 'tbd';

  const handleSetWinner = async (winnerId: string) => {
    if (match.id) {
      setLoading(true);
      try {
        if (creatorIsOverriding && winnerId !== match.winner_id) {
          await overrideMatchResult(match.tournament_id, match, winnerId);
        } else {
          await submitMatchResult(match.tournament_id, match.id, winnerId);
        }

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
      } finally {
        setLoading(false);
      }
    }
  };

  const handleConfirmWinner = async () => {
    if (pendingWinner) {
      await handleSetWinner(pendingWinner);
      setConfirmDialogOpen(false);
      setPendingWinner(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            {creatorIsOverriding ? 'Override Match Results' : 'Match Results'}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {creatorIsOverriding ? 'Override Match Results' : 'Match Results'}
            </DialogTitle>
            {creatorIsOverriding ? (
              <DialogDescription>
                As the creator of the tournament, you can override the match
                result if foul play is reported or noticed.
              </DialogDescription>
            ) : (
              <DialogDescription>
                {!matchHasBothPlayers
                  ? 'Both players must be present to set the winner.'
                  : winner
                    ? 'The winner has already been set. Please contact the creator in case of any disputes.'
                    : 'Please select the winner of the match.'}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="flex flex-col">
            <div className="flex justify-around">
              <div>
                <div
                  className={clsx({
                    'text-green-700 dark:text-green-400 font-semibold':
                      winner && winner === homePlayer.userId,
                    'text-destructive': winner && winner !== homePlayer.userId,
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
                  onClick={() => {
                    setPendingWinner(homePlayer.userId);
                    setConfirmDialogOpen(true);
                  }}
                  variant="outline"
                  disabled={
                    (!creatorIsOverriding && !!winner) || !matchHasBothPlayers
                  }
                  className="mt-2"
                >
                  Set as Winner
                </Button>
              </div>
              <div>
                <div
                  className={clsx({
                    'text-green-700 dark:text-green-400 font-semibold':
                      winner && winner === awayPlayer.userId,
                    'text-destructive': winner && winner !== awayPlayer.userId,
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
                  onClick={() => {
                    setPendingWinner(awayPlayer.userId);
                    setConfirmDialogOpen(true);
                  }}
                  variant="outline"
                  disabled={
                    (!creatorIsOverriding && !!winner) || !matchHasBothPlayers
                  }
                  className="mt-2"
                >
                  Set as Winner
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Confirm {creatorIsOverriding ? 'Override' : 'Winner'}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to set{' '}
              {pendingWinner === homePlayer.userId
                ? homePlayer.username
                : awayPlayer.username}{' '}
              as the winner?{' '}
              {creatorIsOverriding
                ? 'This action will also erase any subsequent match results.'
                : 'This action can only be overriden by the creator of the tournament.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <>
              <Button
                variant="outline"
                onClick={() => setConfirmDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-primary"
                onClick={handleConfirmWinner}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size="sm" />
                ) : (
                  'Confirm'
                )}
              </Button>
            </>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
