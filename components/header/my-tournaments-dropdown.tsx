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

interface Tournament {
  id: string;
  name: string;
}

interface TournamentDropdownProps {
  tournaments: Tournament[];
}

export default function TournamentDropdown({
  tournaments,
}: TournamentDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleTournamentClick = (tournamentId: string) => {
    router.push(`/tournaments/${tournamentId}`);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">My Tournaments</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Tournaments</DropdownMenuLabel>
        <DropdownMenuSeparator />
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
