'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface Tournament {
  id: string;
  name: string;
}

interface TournamentDropdownProps {
  ownTournaments: Tournament[];
  joinedTournaments: Tournament[];
}

export default function TournamentDropdown({
  ownTournaments,
  joinedTournaments,
}: TournamentDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleTournamentClick = (tournamentId: string) => {
    router.push(`/tournaments/${tournamentId}`);
    setIsOpen(false);
  };

  const renderTournamentList = (tournaments: Tournament[]) => (
    <div className="space-y-1">
      {tournaments.map((tournament) => (
        <DropdownMenuItem
          key={tournament.id}
          onClick={() => handleTournamentClick(tournament.id)}
        >
          {tournament.name}
        </DropdownMenuItem>
      ))}
      {tournaments.length === 0 && (
        <DropdownMenuItem disabled>No tournaments found</DropdownMenuItem>
      )}
    </div>
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">My Tournaments</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Tournaments</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Tabs defaultValue="joined" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="joined" className="text-xs">
              Joined
            </TabsTrigger>
            <TabsTrigger value="owned" className="text-xs">
              Owned
            </TabsTrigger>
          </TabsList>
          <TabsContent value="joined">
            {renderTournamentList(joinedTournaments)}
          </TabsContent>
          <TabsContent value="owned">
            {renderTournamentList(ownTournaments)}
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
