import { JoinButton } from '@/components/tournament/join-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getTournamentById,
  getTournamentPlayers,
  getUsername,
} from '@/lib/actions';
import { createClient } from '@/utils/supabase/server';
import { Info, Users, Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import StartTournamentButton from '@/components/tournament/start-tournament-button';
import ChatComponent from '@/components/tournament/chat-component';

interface Params {
  tournamentId: string;
}

const TournamentPage = async ({ params }: { params: Params }) => {
  const id = params.tournamentId;
  if (!id) {
    return <p>No tournament ID provided</p>;
  }

  const { tournament, error } = await getTournamentById(id);
  if (error) {
    return <p>{error}</p>;
  }

  const { data } = await createClient().auth.getUser();

  const { tournamentUsers: tournamentPlayers } = await getTournamentPlayers(id);

  //check if user is aprticipating, if not show join button (data && data.user && data.user.id goofy af iknow)
  const isUserParticipant =
    data &&
    data.user &&
    data.user.id &&
    tournamentPlayers &&
    tournamentPlayers.some((player) => player.user_id === data.user.id);

  const isUserCreator =
    data && data.user && data.user.id === tournament?.creator_id;

  const { username: creatorUsername } = await getUsername(
    tournament?.creator_id
  );

  //made mostly by v0
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">{tournament?.name}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {tournament?.description}
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tournament Bracket */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bracket</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The bracket will be generated once the tournament starts.
            </p>
            {!tournament?.started && isUserCreator && (
              <StartTournamentButton tournamentId={id} />
            )}
          </CardContent>
        </Card>
        {/* Tournament Statistics and Participants */}
        <div className="space-y-6">
          {/* Tournament Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Tournament Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Info className="mr-2 h-4 w-4 text-primary" />
                <span>
                  Tournament Status:{' '}
                  {tournament?.finished
                    ? 'tournament ended'
                    : tournament?.started
                      ? 'Ongoing'
                      : 'Waiting for players'}
                </span>
              </div>
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-primary" />
                <span>
                  Max player amount:{' '}
                  {tournament?.max_player_count || 'Unlimited'}
                </span>
              </div>
              <div className="flex items-center">
                <Crown className="mr-2 h-4 w-4 text-primary" />
                <span>Creator: {creatorUsername}</span>
              </div>
              {!isUserParticipant && (
                <JoinButton user={data.user} tournamentId={id} />
              )}
            </CardContent>
          </Card>
          {/* Participants List */}
          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-4">
                  {tournamentPlayers &&
                    tournamentPlayers.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center space-x-4"
                      >
                        <Avatar>
                          <AvatarImage
                            src={participant.avatar}
                            alt={participant.name}
                          />
                          <AvatarFallback>
                            {participant.users.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {participant.users.username}
                        </span>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          {/*chatbox*/}
          <Card>
            <CardHeader>
              <CardTitle>Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                {isUserParticipant ? (
                  <ChatComponent tournamentId={id} />
                ) : (
                  <p className="text-muted-foreground">
                    You must be a participant to chat
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TournamentPage;
