import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { MatchNode } from './single-elimination-bracket';
import { Button } from '../ui/button';
import { MatchModal } from './match-modal';

export interface MatchCardClientProps {
  match: MatchNode;
}

export const MatchCard: React.FC<MatchCardClientProps> = ({ match }) => {
  const [isHovered, setIsHovered] = useState(false);

  const actualMatch = match.match;

  if (actualMatch.winner_id && actualMatch.round === 1) {
    return (
      <Card className="w-[200px]">
        <CardContent className="pt-6 space-y-4">
          <p className="text-pretty text-muted-foreground">
            {actualMatch.home_player_id == actualMatch.winner_id
              ? actualMatch.homePlayerUsername
              : actualMatch.awayPlayerUsername}{' '}
            advances automatically
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card
      className="w-[200px] relative overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="pt-6 space-y-4">
        <p className="overflow-hidden text-ellipsis">
          {actualMatch.homePlayerUsername
            ? actualMatch.homePlayerUsername
            : 'TBD'}
        </p>
        <Separator />
        <p className="overflow-hidden text-ellipsis">
          {actualMatch.awayPlayerUsername
            ? actualMatch.awayPlayerUsername
            : 'TBD'}
        </p>
      </CardContent>
      <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
        {isHovered && (
          <MatchModal match={actualMatch} />
        )}
      </div>
    </Card>
  );
};
