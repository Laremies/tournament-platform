import { Tournament } from '@/app/types/types';
import {
  CardHeader,
  CardTitle,
  CardContent,
  Card,
  CardDescription,
} from '../ui/card';
import SingleEliminationBracket from './single-elimination-bracket';
import StartTournamentButton from './start-tournament-button';
import { getTournamentMatches } from '@/lib/actions';
import { User } from '@supabase/supabase-js';

interface BracketProps {
  tournament: Tournament;
  user: User | null;
}

export const Bracket = async ({ tournament, user }: BracketProps) => {
  const { matches } = await getTournamentMatches(tournament.id);
  const isCreator = tournament.creator_id === user?.id;

  return (
    <Card className="lg:col-span-2 bg-gradient-to-b from-background to-muted flex flex-col">
      <CardHeader>
        <CardTitle>{tournament.name}</CardTitle>
        <CardDescription className="max-w-prose">
          {tournament.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 h-full flex flex-col max-h-screen">
        {tournament?.started && !tournament?.finished ? (
          <>
            {matches && matches.length > 0 ? (
              <SingleEliminationBracket matches={matches} user={user} />
            ) : (
              <p className="text-muted-foreground">
                The bracket will be generated once the tournament starts.
              </p>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">
            The bracket will be generated once the tournament starts.
          </p>
        )}
        {!tournament.started && isCreator && (
          <StartTournamentButton tournamentId={tournament.id} />
        )}
      </CardContent>
    </Card>
  );
};
