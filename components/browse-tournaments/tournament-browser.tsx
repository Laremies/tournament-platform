'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Calendar } from 'lucide-react';
import { TournamentWithStatus } from '@/app/tournaments/page';
import Link from 'next/link';

// Mock data for tournaments

export default function TournmamentsBrowser({
  tournaments,
}: {
  tournaments: TournamentWithStatus[];
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const tournamentsPerPage = 9;

  const filteredTournaments = tournaments.filter(
    (tournament) =>
      (statusFilter === 'all' || tournament.status === statusFilter) &&
      (tournament.name.toLowerCase().includes(search.toLowerCase()) ||
        tournament.description.toLowerCase().includes(search.toLowerCase()))
  );

  const indexOfLastTournament = currentPage * tournamentsPerPage;
  const indexOfFirstTournament = indexOfLastTournament - tournamentsPerPage;
  const currentTournaments = filteredTournaments.slice(
    indexOfFirstTournament,
    indexOfLastTournament
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const statusColors = {
    waiting_for_players: 'bg-yellow-500',
    ongoing: 'bg-green-500',
    ended: 'bg-blue-500',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Public Tournaments</h1>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search tournaments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="waiting_for_players">Waiting</SelectItem>
            <SelectItem value="ongoing">In Progress</SelectItem>
            <SelectItem value="ended">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {currentTournaments.map((tournament) => (
          <Card key={tournament.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{tournament.name}</span>
                <Badge
                  className={`${statusColors[tournament.status as keyof typeof statusColors]} text-white`}
                >
                  {tournament.status.replace(/_/g, ' ')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {tournament.description}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users size={16} />
                <span>{tournament.player_count} players</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                <Calendar size={16} />
                <span>date</span>
              </div>
            </CardContent>
            <Link href={`/tournaments/${tournament.id}`}>
              <CardFooter>
                <Button className="w-full">View Tournament</Button>
              </CardFooter>
            </Link>
          </Card>
        ))}
      </div>
      <div className="flex justify-center gap-2">
        {Array.from(
          {
            length: Math.ceil(filteredTournaments.length / tournamentsPerPage),
          },
          (_, i) => (
            <Button
              key={i}
              variant={currentPage === i + 1 ? 'default' : 'outline'}
              onClick={() => paginate(i + 1)}
            >
              {i + 1}
            </Button>
          )
        )}
      </div>
    </div>
  );
}
