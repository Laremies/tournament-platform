'use client';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { MatchNode } from './single-elimination-bracket';

export interface MatchCardClientProps {
  match: MatchNode;
  homePlayerUsername?: string;
  awayPlayerUsername?: string;
}

export const MatchCardClient: React.FC<MatchCardClientProps> = ({
  match,
  homePlayerUsername,
  awayPlayerUsername,
}) => {
  if (match.match.winner_id) {
    return (
      <Card className="w-[200px]">
        <CardContent className="pt-6 space-y-4">
          <span className="text-xs text-gray-500">
            {homePlayerUsername} advances automatically
          </span>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="w-[200px] ">
      <CardContent className="pt-6 space-y-4">
        <p>
          {homePlayerUsername
            ? homePlayerUsername
            : match.children[0]
              ? `Winner of Match ${match.children[0].matchNumber}`
              : 'TBD'}
        </p>
        <Separator />
        <p>
          {awayPlayerUsername
            ? awayPlayerUsername
            : match.children[1]
              ? `Winner of Match ${match.children[1].matchNumber}`
              : 'TBD'}
        </p>
      </CardContent>
    </Card>
  );
};
