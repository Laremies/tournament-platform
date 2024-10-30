import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Progress from '@/components/ui/progress';
import { Trophy, Swords } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Avatar2 from '@/app/profile/UploadImage';
import {
  getAuthUser,
  getProfileComments,
  getPublicUserData,
} from '@/lib/actions';
import { redirect } from 'next/navigation';
import EditableUsername from './Editname';
import { getAllUserCurrentTournaments } from '@/lib/actions';
import ProfileComments from '@/components/profile/comment-box';
export default async function Profile() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/sign-in');
  }
  const userid = user?.id as string;
  const { data: publicUser } = await getPublicUserData(user.id);
  const { tournaments } = await getAllUserCurrentTournaments();
  const { comments } = await getProfileComments(user.id);

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center space-x-4 mb-6">
        <Avatar2
          initialUrl={publicUser.avatar_url}
          size={150}
          username={publicUser.username}
        />
        <div>
          <EditableUsername username={publicUser.username} userid={userid} />
          <p className="text-gray-500">
            {user ? user.email : 'guest@example.com'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="current">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="current">Current Tournaments</TabsTrigger>
              <TabsTrigger value="previous">Previous Tournaments</TabsTrigger>
              <TabsTrigger value="results">Match Results</TabsTrigger>
            </TabsList>
            <ScrollArea className="h-[355px] rounded-md  mt-2">
              <TabsContent value="current">
                <div className="space-y-4">
                  {tournaments != null ? (
                    tournaments.map((tournament) => (
                      <Card key={tournament.id}>
                        <CardHeader>
                          <CardTitle>{tournament.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>Players: {tournament.player_count}</p>
                          <p>Round: Group Stage</p>
                          <p>Next match: July 20, 2023</p>
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
            </ScrollArea>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Win Ratio</span>
                    <span>0%</span>
                  </div>
                  <Progress value={0} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4" />
                    <div>
                      <p className="text-sm font-medium">0</p>
                      <p className="text-xs text-gray-500">
                        Tournaments Participated
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">0</p>
                      <p className="text-xs text-gray-500">Tournaments Won</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Swords className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">0</p>
                      <p className="text-xs text-gray-500">Matches Won</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Swords className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">0</p>
                      <p className="text-xs text-gray-500">Matches Lost</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <ProfileComments
            user={user}
            profile_user_id={user.id}
            comments={comments}
          />
        </div>
      </div>
    </div>
  );
}
