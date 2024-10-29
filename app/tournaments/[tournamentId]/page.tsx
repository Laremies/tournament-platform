import { JoinButton } from '@/components/tournament/join-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getAuthUser,
  getTournamentById,
  getTournamentPlayers,
  getUserAccessRequest,
  getUsername,
  getTournamentMatches,
} from '@/lib/actions';
import { Info, Users, Crown } from 'lucide-react';
import ChatComponent from '@/components/tournament/chat-component';
import PrivateTournamentView from '@/components/tournament/private-tournament-view';
import AccessRequestStatus from '@/components/tournament/access-request-status';
import AccessRequests from '@/components/tournament/access-requests';
import { ParticipantList } from '@/components/tournament/participant-list';
import { NextMatch } from '@/components/tournament/next-match';
import { Bracket } from '@/components/tournament/bracket';

interface Params {
  tournamentId: string;
}

const TournamentPage = async ({ params }: { params: Params }) => {
  const id = params.tournamentId;
  if (!id) {
    return <p>No tournament ID provided</p>;
  }

  const { tournament, error } = await getTournamentById(id);
  if (error || !tournament) {
    return <p>{error || 'Error loading tournament.'}</p>;
  }

  const { tournamentUsers: tournamentPlayers } = await getTournamentPlayers(id);
  const { matches } = await getTournamentMatches(id);

  const user = await getAuthUser();
  //check if user is aprticipating, if not show join button (data && data.user && data.user.id goofy af iknow)
  const isUserParticipant =
    user &&
    tournamentPlayers &&
    tournamentPlayers.some((player) => player.user_id === user.id);

  const isUserCreator = user && user.id === tournament.creator_id;

  const { username: creatorUsername } = await getUsername(
    tournament.creator_id
  );

  // Check if the tournament is private
  if (tournament.private && !isUserParticipant && !isUserCreator) {
    //participants and creators dont need to be checked
    //non logged in user doesn't have to fetch the accessrequest data
    if (!user) {
      return <PrivateTournamentView tournament={tournament} user={user} />;
    }
    // Check if the user has a pending or accepted access request
    const { accessRequest, error } = await getUserAccessRequest(id);
    if (error) {
      return <p>{error}</p>;
    }
    if (accessRequest && accessRequest.status === 'accepted') {
      // User has access, do nothing
    } else if (accessRequest) {
      // User has a pending or rejected access request
      return <AccessRequestStatus status={accessRequest.status} />;
    } else {
      return <PrivateTournamentView tournament={tournament} user={user} />;
    }
  }

  return (
    <div className="mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[3fr,1.5fr,1.5fr] gap-6">
        {/* Tournament Bracket */}
        {tournament && (
          <Bracket tournament={tournament} user={user} matches={matches} />
        )}
        {/* Tournament Statistics and Participants */}
        <div className="space-y-6 w-[350px]">
          {/* Access Requests */}
          {isUserCreator && tournament.private && !tournament.started && (
            <AccessRequests tournamentId={id} />
          )}
          {user && matches && tournament.started && !tournament.finished && (
            <NextMatch user={user} matches={matches} />
          )}
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
                  {tournament.finished
                    ? 'Tournament ended'
                    : tournament.started
                      ? 'Ongoing'
                      : 'Waiting for players'}
                </span>
              </div>
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-primary" />
                <span>
                  Max player amount:{' '}
                  {tournament.max_player_count || 'Unlimited'}
                </span>
              </div>
              <div className="flex items-center">
                <Crown className="mr-2 h-4 w-4 text-primary" />
                <span>Creator: {creatorUsername}</span>
              </div>
              {!isUserParticipant && !tournament.started && (
                <JoinButton user={user} tournamentId={id} />
              )}
            </CardContent>
          </Card>
          {/* Participants List */}
          {tournamentPlayers && tournament && (
            <ParticipantList
              tournamentPlayers={tournamentPlayers}
              creator={isUserCreator}
              tournament={tournament}
              user={user}
            />
          )}
          {/*chatbox*/}
          <Card>
            <CardHeader>
              <CardTitle>Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                {isUserParticipant || isUserCreator ? (
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
