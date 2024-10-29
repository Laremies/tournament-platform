import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Progress from '@/components/ui/progress';
import { CalendarDays, Trophy, Swords } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Avatar2 from '@/app/profile/UploadImage';
import {
  getUsername,
  getAuthUser,
  getMediaNAme,
  getMediaURL,
} from '@/lib/actions';

import EditableUsername from './Editname';

import { getAllUserCurrentTournaments } from '@/lib/actions';
export default async function Component() {
  const user = await getAuthUser();
  const userid = user?.id as string;
  const usernames = await getUsername(user?.id);
  const MediaName = await getMediaNAme();
  const avatar_url = await getMediaURL(MediaName);
  const { tournaments } = await getAllUserCurrentTournaments();

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center space-x-4 mb-6">
        <Avatar2
          uid={user?.id ?? null}
          initialUrl={avatar_url}
          size={150}
          username={usernames.username}
        />
        <div>
          <EditableUsername username={usernames.username} userid={userid} />
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

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>July 15 - Summer Showdown 2023</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>July 20 - City League Championship</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
