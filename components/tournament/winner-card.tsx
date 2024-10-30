import { Trophy } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { getTournamentWinner } from '@/lib/actions';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Tournament } from '@/app/types/types';

interface WinnerCardProps {
  tournament: Tournament;
}

export const WinnerCard: React.FC<WinnerCardProps> = async ({ tournament }) => {
  const { winner, error } = await getTournamentWinner(tournament.id);

  if (!winner || error) {
    return (
      <div className="text-muted-foreground">
        Error loading winner information. Please try again.
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 h-24 flex items-center justify-center">
          <Trophy className="text-white w-16 h-16 animate-bounce" />
        </div>
      </CardHeader>
      <CardContent className="p-6 bg-gradient-to-b from-yellow-100 to-white">
        <div className="flex flex-col items-center text-center">
          <Avatar className="w-24 h-24 border-4 border-white shadow-lg -mt-16 mb-4">
            <AvatarImage src={winner.avatar_url} alt={winner.username} />
            <AvatarFallback>
              {winner.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-black text-2xl mb-2">{winner.username}</h2>
          <div className="w-16 h-1 bg-yellow-400 rounded mb-4"></div>
          <p className="text-sm text-gray-600 mb-1">Winner of</p>
          <h3 className="text-xl text-black">{tournament.name}</h3>
        </div>
      </CardContent>
    </Card>
  );
};
