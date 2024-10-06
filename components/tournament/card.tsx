import clsx from 'clsx';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{players} Players</CardDescription>
      </CardHeader>
      <CardContent>
        <p className={clsx('mb-2', !description && 'text-muted-foreground')}>
          {description || 'Tournament has no description.'}
        </p>
        <Link href={`/tournaments/${id}`}>
          <Button variant="outline" size="sm">
            View Tournament
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default TournamentCard;
