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
      return (
        <Badge variant="outline" className={statusColors.finished}>
          Ended
        </Badge>
      );
    } else if (tournament.started) {
      return (
        <Badge variant="outline" className={statusColors.started}>
          Ongoing
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className={statusColors.waiting}>
          Waiting for players
        </Badge>
      );
    }
  };

  return (
    <Card className="flex flex-col h-full shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-start text-lg">
          <span className="overflow-hidden break-words mr-2">
            {tournament.name}
          </span>
          {getStatusBadge(tournament)}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pb-2">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {tournament.description || 'No description available'}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col pt-2">
        <div className="flex justify-end items-center w-full text-sm text-muted-foreground mb-2">
          <span className="mr-1">
            {tournament.player_count}
            {tournament.max_player_count && ` / ${tournament.max_player_count}`}
          </span>
          <Users size={16} className="mr-1" />
        </div>
        <Link href={`/tournaments/${tournament.id}`} className="w-full">
          <Button variant="secondary" className="w-full">
            View Tournament
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default TournamentCard;
