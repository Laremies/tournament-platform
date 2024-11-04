import { Tournament } from '@/app/types/types';
import {
  Card,
  CardHeader,
  CardTitle,
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
  const statusColors = {
    finished: 'bg-blue-500 text-white m-1',
    started: 'bg-purple-500 text-white m-1',
    waiting: 'bg-green-500 text-white m-1',
  };
  const getStatusBadge = (tournament: Tournament) => {
    if (tournament.finished) {
      return <Badge className={statusColors.finished}>Ended</Badge>;
    } else if (tournament.started) {
      return <Badge className={statusColors.started}>Ongoing</Badge>;
    } else {
      return (
        <Badge className={statusColors.waiting}>Waiting for players</Badge>
      );
    }
  };

  return (
    <Card key={tournament.id} className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-start ">
          <span className="overflow-hidden break-words">{tournament.name}</span>
          {getStatusBadge(tournament)}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {tournament.description
            ? tournament.description
            : 'No description available'}
        </p>
        <div
          className={`flex items-center gap-2 text-sm text-muted-foreground ${tournament.description ? 'mt-4' : ''}`}
        >
          <Users size={16} />
          <div className="flex items-center">
            {tournament.max_player_count ? (
              <span>
                {tournament.player_count} / {tournament.max_player_count}
              </span>
            ) : (
              <span>{tournament.player_count} </span>
            )}
          </div>
        </div>
      </CardContent>
      <Link href={`/tournaments/${tournament.id}`} className="mt-auto">
        <CardFooter className="flex justify-center">
          <Button variant={'default'} className="w-full">
            View Tournament
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default TournamentCard;
