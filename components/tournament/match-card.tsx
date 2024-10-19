'use client';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { MatchNode } from './single-elimination-bracket';

export interface MatchCardClientProps {
  match: MatchNode;
}

export const MatchCard: React.FC<MatchCardClientProps> = ({ match }) => {
  if (match.match.winner_id && match.match.round === 1) {
    return (
      <Card className="w-[200px]">
        <CardContent className="pt-6 space-y-4">
          <span className="text-xs text-gray-500">
            {match.match.home_player_id == match.match.winner_id
              ? match.match.homePlayerUsername
              : match.match.awayPlayerUsername}{' '}
            advances automatically
          </span>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="w-[200px]">
      <CardContent className="pt-6 space-y-4">
        <p className="hover:text-blue-500 transition-colors duration-200 overflow-hidden">
          {match.match.homePlayerUsername
            ? match.match.homePlayerUsername
            : 'TBD'}
        </p>
        <Separator />
        <p className="hover:text-blue-500 transition-colors duration-200 overflow-hidden">
          {match.match.awayPlayerUsername
            ? match.match.awayPlayerUsername
            : 'TBD'}
        </p>
      </CardContent>
    </Card>
  );
};
