import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Progress from '@/components/ui/progress';
import {
  getAllUserMatchResults,
  getAllUserOwnedPublicTournaments,
  getAuthUser,
  getProfileComments,
  getPublicUserData,
  getUserStatistics,
} from '@/lib/actions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Trophy, Swords } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Label } from '@/components/ui/label';
import ProfileComments from '@/components/profile/comment-box';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import SendMessageButton from '@/components/profile/send-message-button';

type Params = {
  userId: string;
};

const UserPage = async ({ params }: { params: Params }) => {
  const id = params.userId;

  const user = await getAuthUser(); // get user to check if it's the same as the public user
  //and also to check if the user is logged in

  if (!id) {
    return <p>No user ID provided</p>;
  }

  const { data: publicUser } = await getPublicUserData(id);
  const { tournaments } = await getAllUserOwnedPublicTournaments(id);
  const { matchesWithUsernames: pastMatches } =
    await getAllUserMatchResults(id);
  const { data: statistics } = await getUserStatistics(id);

  if (!publicUser) {
    return <p>User not found</p>;
  }
  if (user && user.id === publicUser.id) {
    redirect('/profile');
  }
  const { comments } = await getProfileComments(id);

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center space-x-4 mb-6">
        <Avatar className="cursor-pointer" style={{ width: 120, height: 120 }}>
          <AvatarImage src={publicUser.avatar_url || ''} alt="Profile" />
          <AvatarFallback>
            {publicUser.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <Label className="text-2xl">
            {publicUser.username}{' '}
            {user && <SendMessageButton userId={publicUser.id} />}
          </Label>
          <p className="text-gray-600">
            {publicUser.bio || 'No bio provided.'}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="owned">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="owned">Hosted Tournaments</TabsTrigger>
              <TabsTrigger value="results">Match Results</TabsTrigger>
            </TabsList>
            <ScrollArea className="h-[800px]  rounded-md  mt-2">
              <TabsContent value="owned">
                <div className="space-y-4">
                  {tournaments != null ? (
                    tournaments.map((tournament) => (
                      <Card key={tournament.id}>
                        <CardHeader>
                          <CardTitle>{tournament.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <div>
                              <p>Players: {tournament.player_count}</p>
                              <span>
                                {tournament.finished ? (
                                  <span className="text-destructive">
                                    Tournament finished
                                  </span>
                                ) : tournament.started ? (
                                  <span className="text-primary">Ongoing</span>
                                ) : (
                                  <span className="text-secondary">
                                    Waiting for players
                                  </span>
                                )}
                              </span>
                              <p className="text-muted-foreground line-clamp-2">
                                {tournament.description}
                              </p>
                            </div>
                            <Link href={`/tournaments/${tournament.id}`}>
                              <Button
                                variant="link"
                                className="mt-2 px-4 py-2 rounded"
                              >
                                View Tournament
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardHeader>
                        <p>No tournaments available</p>
                      </CardHeader>
                    </Card>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="results">
                <div className="space-y-4">
                  {pastMatches != null ? (
                    pastMatches.map((match) => (
                      <Card key={match.id}>
                        <CardHeader>
                          <CardTitle>
                            <span> {match.tournaments.name} </span>- Round{' '}
                            {match.round}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-muted-foreground">
                                <span>{match.homePlayerUsername}</span> vs{' '}
                                <span>{match.awayPlayerUsername}</span>
                              </p>
                              <p>
                                Winner:{' '}
                                <span className="font-bold text-secondary">
                                  {match.winnerId === match.homePlayerId
                                    ? match.homePlayerUsername
                                    : match.awayPlayerUsername}
                                </span>
                              </p>
                            </div>
                            <Link href={`/tournaments/${match.tournament_id}`}>
                              <Button
                                variant="link"
                                className="mt-2 px-4 py-2 rounded"
                              >
                                View Tournament
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardHeader>
                        <p>No matches available</p>
                      </CardHeader>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {statistics && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Match Win Ratio</span>
                      <span>
                        {Math.round(
                          (statistics.matchesWon /
                            (statistics.matchesWon + statistics.matchesLost)) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    {
                      <Progress
                        value={
                          (statistics.matchesWon /
                            (statistics.matchesWon + statistics.matchesLost)) *
                          100
                        }
                      />
                    }
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4" />
                      <div>
                        <p className="text-sm font-medium">
                          {statistics.tournamentCount}
                        </p>
                        <p className="text-xs text-gray-500">
                          Tournaments Participated
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium">
                          {statistics.wonCount}
                        </p>
                        <p className="text-xs text-gray-500">Tournaments Won</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Swords className="w-4 h-4 text-green-700 dark:text-green-400" />
                      <div>
                        <p className="text-sm font-medium">
                          {statistics.matchesWon}
                        </p>
                        <p className="text-xs text-gray-500">Matches Won</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Swords className="w-4 h-4 text-red-500" />
                      <div>
                        <p className="text-sm font-medium">
                          {statistics.matchesLost}
                        </p>
                        <p className="text-xs text-gray-500">Matches Lost</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <ProfileComments
            user={user}
            profile_user_id={id}
            comments={comments}
          />
        </div>
      </div>
    </div>
  );
};

export default UserPage;
