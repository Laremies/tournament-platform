import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Match } from '@/app/types/types';
import { getAuthUser, getUsername } from '@/lib/actions';
import { Swords } from 'lucide-react';

interface MatchCardProps {
  match: Match;
}

const MatchCard: React.FC<MatchCardProps> = async ({ match }) => {
  const user = await getAuthUser();
  if (!user) return null;

  const opponentId =
    user.id === match.home_player_id
      ? match.away_player_id
      : match.home_player_id;
  const opponentName = await getUsername(opponentId);

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="line-clamp-1">
          {opponentId ? (
            <Link
              href={`/profile/${opponentId}`}
              className="text-primary hover:underline"
            >
              {opponentName.username}
            </Link>
          ) : (
            <p className="text-muted-foreground pb-5">
              Opponent To Be Determinded
            </p>
          )}
        </CardTitle>
        <CardDescription className="flex items-center">
          {opponentId && (
            <>
              <Swords className="h-4 w-4 mr-2" /> <span>Opponent</span>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="line-clamp-3">
        {match.tournaments.name} - Round {match.round}
      </CardContent>
      <CardFooter className="w-full">
        <Link href={`/tournaments/${match.tournament_id}`} className="w-full">
          <Button className="w-full">View Tournament</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default MatchCard;
