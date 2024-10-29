import { SingleEliminationMatch } from '@/app/types/types';
import { User } from '@supabase/supabase-js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { XCircle, Swords, Trophy } from 'lucide-react';
import { Participant } from './participant-component';
import next from 'next';

interface NextMatchProps {
  user: User;
  matches: SingleEliminationMatch[];
}

export const NextMatch: React.FC<NextMatchProps> = ({ user, matches }) => {
  const nextMatch = matches.find(
    (match) =>
      !match.winner_id &&
      (user.id === match.home_player_id || user.id === match.away_player_id)
  );

  const opponent: { userId: string; username: string } | null = nextMatch
    ? user.id === nextMatch.home_player_id
      ? {
          userId: nextMatch.away_player_id || 'tbd',
          username: nextMatch.awayPlayerUsername || 'TBD',
        }
      : {
          userId: nextMatch.home_player_id || 'tbd',
          username: nextMatch.homePlayerUsername || 'TBD',
        }
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Next Match</CardTitle>
        <CardDescription>Information about your next match</CardDescription>
      </CardHeader>

      {nextMatch ? (
        <CardContent className="space-y-4">
          <div className="flex items-center">
            <Swords className="mr-2 w-4 h-4 text-primary" />
              Opponent:{' '}
              {opponent && opponent.userId !== 'tbd' ? (
                <Participant
                  participant={opponent}
                  tournamentId={nextMatch.tournament_id}
                  user={user}
                  present={false}
                />
              ) : (
                <span className="text-muted-foreground">TBD</span>
              )}
          </div>
          <div className="flex items-center">
            <Trophy className="mr-2 w-4 h-4 text-primary" />
            <span>Round: {nextMatch.round}</span>
          </div>
        </CardContent>
      ) : (
        <CardContent className="flex flex-col items-center space-y-4">
          <XCircle className="w-10 h-10 text-destructive" />
          <p className="text-center">
            You have been eliminated from the tournament
          </p>
        </CardContent>
      )}
    </Card>
  );
};
