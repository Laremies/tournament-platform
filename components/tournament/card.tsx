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

interface TournamentCardProps {
  id: string;
  name: string;
  description: string;
  players: number;
}

const TournamentCard: React.FC<TournamentCardProps> = ({
  id,
  name,
  description,
  players,
}) => {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="line-clamp-1">{name}</CardTitle>
        <CardDescription>{players} Players</CardDescription>
      </CardHeader>
      <CardContent>
        <p
          className={`line-clamp-3 ${description ? '' : 'text-muted-foreground'}`}
        >
          {description || 'Tournament has no description.'}
        </p>
      </CardContent>
      <CardFooter className="pt-6">
        <Link href={`/tournaments/${id}`}>
          <Button variant="outline" size="sm">
            View Tournament
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default TournamentCard;
