'use client';
import { SingleEliminationMatch } from '@/app/types/types';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { XCircle, Swords, HelpCircle, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useChat } from '@/utils/context/ChatContext';

interface NextMatchProps {
  user: User;
  matches: SingleEliminationMatch[];
}

export const NextMatch: React.FC<NextMatchProps> = ({ user, matches }) => {
  const { setChatOpen, setReceiverId } = useChat();

  const nextMatch = matches.find(
    (match) =>
      !match.winner_id &&
      (user.id === match.home_player_id || user.id === match.away_player_id)
  );

  const opponent: { userId: string; username: string; avatar: string } | null =
    nextMatch
      ? user.id === nextMatch.home_player_id
        ? {
            userId: nextMatch.away_player_id || 'tbd',
            username: nextMatch.awayPlayerUsername || 'TBD',
            avatar: nextMatch.awayPlayerAvatarUrl || '',
          }
        : {
            userId: nextMatch.home_player_id || 'tbd',
            username: nextMatch.homePlayerUsername || 'TBD',
            avatar: nextMatch.homePlayerAvatarUrl || '',
          }
      : null;

  const handleSendMessage = (opponentId: string) => {
    setChatOpen(true);
    setReceiverId(opponentId);
  };

  return (
    <Card>
      <CardHeader className="text-center p-4">
        <CardTitle>Next Match</CardTitle>
      </CardHeader>

      {nextMatch ? (
        <CardContent className="flex flex-col items-center p-4 pt-0">
          <Badge
            variant="secondary"
            className="mb-2 hover:bg-secondary text-base"
          >
            Round {nextMatch.round}
          </Badge>
          {opponent && opponent.userId !== 'tbd' ? (
            <>
              <div className="flex flex-col items-center rounded-lg border-4 border-purple-600 p-4 space-y-2 mb-2">
                <div className="flex items-center justify-center">
                  <Swords className="mr-2 h-4 w-4 text-primary" />
                  <span className="text-primary">Your Opponent</span>
                </div>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={opponent.avatar} alt={opponent.username} />
                  <AvatarFallback>
                    {opponent.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3>{opponent.username}</h3>
              </div>
              <Button
                size="sm"
                onClick={() => handleSendMessage(opponent.userId)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2 mb-4">
              <HelpCircle className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-muted-foreground">
                Opponent to be determined
              </h3>
            </div>
          )}
        </CardContent>
      ) : (
        <CardContent className="flex flex-col items-center space-y-4">
          <XCircle className="w-10 h-10 text-destructive" />
          <p className="text-center">
            You have been eliminated from the tournament
          </p>
        </CardContent>
      )}
    </Card>
  );
};
