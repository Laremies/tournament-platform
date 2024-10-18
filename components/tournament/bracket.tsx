import { Tournament } from '@/app/types/types';
import { CardHeader, CardTitle, CardContent, Card } from '../ui/card';
import SingleEliminationBracket from './single-elimination-bracket';
import StartTournamentButton from './start-tournament-button';
import { getTournamentMatches } from '@/lib/actions';

interface BracketProps {
  tournament: Tournament;
  isUserCreator: boolean;
}

export const Bracket = async ({ tournament, isUserCreator }: BracketProps) => {
  const { matches } = await getTournamentMatches(tournament.id);

  return (
    <Card className="lg:col-span-2  bg-gradient-to-b from-background to-muted w-full max-w-7xl">
      <CardHeader>
        <CardTitle>Bracket</CardTitle>
      </CardHeader>
      <CardContent>
        {tournament?.started && !tournament?.finished ? (
          <div>
            {matches && matches.length > 0 ? (
              <SingleEliminationBracket matches={matches} />
            ) : (
              <p className="text-muted-foreground">
                The bracket will be generated once the tournament starts.
              </p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">
            The bracket will be generated once the tournament starts.
          </p>
        )}
        {!tournament?.started && isUserCreator && (
          <StartTournamentButton tournamentId={tournament.id} />
        )}
      </CardContent>
    </Card>
  );
};
