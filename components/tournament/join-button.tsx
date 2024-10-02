'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { joinTournament } from '@/lib/actions';

interface JoinButtonProps {
  user: User | null;
  tournamentId: string;
}

export function JoinButton({ user, tournamentId }: JoinButtonProps) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();

  const handleJoin = async () => {
    setIsJoining(true);

    try {
      const { success, error } = await joinTournament(tournamentId);

      // Display success toast message or error message
      if (success) {
        toast({
          title: 'Success',
          description: 'You have successfully joined the tournament',
        });
      }
      if (error) {
        toast({
          title: 'Error',
          description: error,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to join the tournament',
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleLoginRedirect = () => {
    // Redirect to login page
    //TODO: should remember the page user was on before login and return to that page after login
    router.push('/sign-in');
  };

  if (!user) {
    return (
      <div className="text-center">
        <Button onClick={handleLoginRedirect} className="w-full sm:w-auto">
          Log in to Join Tournament
        </Button>
        <p className="mt-2 text-sm text-gray-600">
          You must be logged in to join the tournament.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <Button
        onClick={handleJoin}
        disabled={isJoining}
        className="w-full sm:w-auto"
      >
        {isJoining ? 'Joining...' : 'Join Tournament'}
      </Button>
    </div>
  );
}
