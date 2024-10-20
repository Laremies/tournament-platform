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

interface BracketProps {
  tournament: Tournament;
  isUserCreator?: boolean | null;
}

export const Bracket = async ({ tournament, isUserCreator }: BracketProps) => {
  const { matches } = await getTournamentMatches(tournament.id);

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
              <SingleEliminationBracket matches={matches} />
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
        {!tournament?.started && isUserCreator && (
          <StartTournamentButton tournamentId={tournament.id} />
        )}
      </CardContent>
    </Card>
  );
};
