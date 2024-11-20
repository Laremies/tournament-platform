import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { MatchNode } from './single-elimination-bracket';
import { MatchModal } from './match-modal';
import { User } from '@supabase/supabase-js';
import clsx from 'clsx';

export interface MatchCardClientProps {
  match: MatchNode;
  user: User | null;
  isCreator: boolean;
}

export const MatchCard: React.FC<MatchCardClientProps> = ({
  match,
  user,
  isCreator,
}) => {
  const actualMatch = match.match;
  const userIsPlayer =
    user &&
    (user.id === actualMatch.home_player_id ||
      user.id === actualMatch.away_player_id);
  const creatorIsOverriding = userIsPlayer
    ? isCreator && !!actualMatch.winner_id
    : isCreator;

  if (
    actualMatch.winner_id &&
    actualMatch.round === 1 &&
    actualMatch.id === 'bye'
  ) {
    return (
      <Card className="w-[200px]">
        <CardContent className="pt-6 space-y-4">
          <p className="text-pretty text-muted-foreground truncate max-w-full">
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
        <p
          className={clsx('truncate max-w-full', {
            'text-green-700 dark:text-green-400':
              actualMatch.winner_id &&
              actualMatch.home_player_id === actualMatch.winner_id,
            'text-destructive':
              actualMatch.winner_id &&
              actualMatch.home_player_id !== actualMatch.winner_id,
            'text-muted-foreground': !actualMatch.home_player_id,
          })}
        >
          {actualMatch.home_player_id ? actualMatch.homePlayerUsername : 'TBD'}
        </p>
        <Separator />
        <p
          className={clsx('truncate max-w-full', {
            'text-green-700 dark:text-green-400':
              actualMatch.winner_id &&
              actualMatch.away_player_id === actualMatch.winner_id,
            'text-destructive':
              actualMatch.winner_id &&
              actualMatch.away_player_id !== actualMatch.winner_id,
            'text-muted-foreground': !actualMatch.away_player_id,
          })}
        >
          {actualMatch.away_player_id ? actualMatch.awayPlayerUsername : 'TBD'}
        </p>
      </CardContent>
      {(userIsPlayer || creatorIsOverriding) && (
        <div
          className={clsx(
            'absolute inset-0 bg-accent/0 hover:bg-accent/50 transition-all duration-300 flex items-center justify-center',
            userIsPlayer && 'border-4 border-accent'
          )}
        >
          <MatchModal
            match={actualMatch}
            user={user}
            creatorIsOverriding={creatorIsOverriding}
          />
        </div>
      )}
    </Card>
  );
};
