import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { MatchNode } from './single-elimination-bracket';
import { MatchModal } from './match-modal';
import { User } from '@supabase/supabase-js';

export interface MatchCardClientProps {
  match: MatchNode;
  user: User | null;
}

export const MatchCard: React.FC<MatchCardClientProps> = ({ match, user }) => {
  const actualMatch = match.match;
  const userIsPlayer =
    user &&
    (user.id === actualMatch.home_player_id ||
      user.id === actualMatch.away_player_id);

  if (actualMatch.winner_id && actualMatch.round === 1 && actualMatch.id?.includes('bye')) {
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
    <Card className="w-[200px] relative overflow-hidden group">
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
      {userIsPlayer && (
        <div className="absolute inset-0 bg-purple-600 bg-opacity-0 hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center border-4 border-purple-600">
          <MatchModal match={actualMatch} user={user} />
        </div>
      )}
    </Card>
  );
};
