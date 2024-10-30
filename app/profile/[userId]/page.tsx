import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Progress from '@/components/ui/progress';
import {
  getAuthUser,
  getProfileComments,
  getPublicUserData,
} from '@/lib/actions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Trophy, Swords } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Label } from '@/components/ui/label';
import ProfileComments from '@/components/profile/comment-box';

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
          <Label className="text-2xl">{publicUser.username}</Label>
          <p className="text-gray-600">
            {publicUser.description || 'No description provided.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="current">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="current">
                Owned Public Tournaments
              </TabsTrigger>
              <TabsTrigger value="previous">
                Joined Public Tournaments
              </TabsTrigger>
              <TabsTrigger value="results">Match Results</TabsTrigger>
            </TabsList>
            <ScrollArea className="h-[355px] rounded-md  mt-2">
              <TabsContent value="current">
                <div className="space-y-4"></div>
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
                    <span>Match Win Ratio</span>
                    <span>
                      {(publicUser.matches_won_amount /
                        (publicUser.matches_won_amount +
                          publicUser.matches_lost_amount)) *
                        100}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      (publicUser.matches_won_amount /
                        (publicUser.matches_won_amount +
                          publicUser.matches_lost_amount)) *
                      100
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4" />
                    <div>
                      <p className="text-sm font-medium">
                        {publicUser.tournaments_participated_amount}
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
                        {publicUser.tournaments_won_amount}
                      </p>
                      <p className="text-xs text-gray-500">Tournaments Won</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Swords className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">
                        {publicUser.matches_won_amount}
                      </p>
                      <p className="text-xs text-gray-500">Matches Won</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Swords className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">
                        {publicUser.matches_lost_amount}
                      </p>
                      <p className="text-xs text-gray-500">Matches Lost</p>
                    </div>
                  </div>
                </div>
              </div>
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
