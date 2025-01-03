import { SingleEliminationMatch, Tournament } from '@/app/types/types';
import {
  CardHeader,
  CardTitle,
  CardContent,
  Card,
  CardDescription,
} from '../ui/card';
import SingleEliminationBracket from './single-elimination-bracket';
import StartTournamentButton from './start-tournament-button';
import { User } from '@supabase/supabase-js';
import CopyToClipboardButton from './copy-to-clipboard-button';

interface BracketProps {
  tournament: Tournament;
  user: User | null;
  matches: SingleEliminationMatch[] | undefined;
}

export const Bracket = async ({ tournament, user, matches }: BracketProps) => {
  const isCreator = tournament.creator_id === user?.id;

  return (
    <Card className="lg:col-span-2 bg-gradient-to-b from-background to-muted flex flex-col">
      <CardHeader>
        <CardTitle>
          <span>{tournament.name}</span> <CopyToClipboardButton />
        </CardTitle>

        {/* the description should maybe be made collapsible */}
        <CardDescription className="whitespace-pre-wrap max-w-[80%]">
          {tournament.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 h-full flex flex-col max-h-screen">
        {tournament?.started ? (
          <>
            {matches && matches.length > 0 ? (
              <SingleEliminationBracket
                matches={matches}
                user={user}
                isCreator={isCreator}
              />
            ) : (
              <p className="text-muted-foreground pl-6 pb-4">
                The bracket will be generated once the tournament starts.
              </p>
            )}
          </>
        ) : (
          <p className="text-muted-foreground pl-6 pb-4">
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
