import { Tournament } from '@/app/types/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { Badge } from '../ui/badge';

interface TournamentCardProps {
  tournament: Tournament;
}

const TournamentCard: React.FC<TournamentCardProps> = ({ tournament }) => {
  const getStatusBadge = () => {
    if (tournament.finished) {
      return <Badge variant="secondary">Ended</Badge>;
    } else if (tournament.started) {
      return <Badge variant="default">Ongoing</Badge>;
    } else {
      return <Badge variant="outline">Waiting for players</Badge>;
    }
  };

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="line-clamp-1">{tournament.name}</CardTitle>
        <CardDescription>
          <div className="flex justify-between pt-2">
            <span>{getStatusBadge()}</span>
            <div className="flex items-center">
              {tournament.max_player_count ? (
                <span>
                  {tournament.player_count} / {tournament.max_player_count}
                </span>
              ) : (
                <span>{tournament.player_count} </span>
              )}
              <Users className="h-4 w-4 ml-1" />
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p
          className={`line-clamp-3 ${tournament.description ? '' : 'text-muted-foreground'}`}
        >
          {tournament.description || 'Tournament has no description.'}
        </p>
      </CardContent>
      <CardFooter>
        <Link href={`/tournaments/${tournament.id}`}>
          <Button variant="outline" size="sm">
            View Tournament
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default TournamentCard;
