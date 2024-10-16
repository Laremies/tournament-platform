'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LockIcon, LogInIcon } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Tournament } from '@/app/types/types';
import { submitAccessRequest } from '@/lib/actions';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PrivateTournamentViewProps {
  tournament: Tournament;
  user: User | null;
}

export default function PrivateTournamentView({
  tournament,
  user,
}: PrivateTournamentViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestAccess = async () => {
    setIsLoading(true);

    const { success, error } = await submitAccessRequest(tournament.id);
    if (success) {
      toast({
        title: 'Request Sent',
        description: 'Your request has been sent successfully',
      });
    }
    if (error) {
      toast({
        title: 'Error',
        description: error,
      });
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    // Redirect to login page
    //TODO: should remember the page user was on before login and return to that page after login
    router.push('/sign-in');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
          <LockIcon className="w-6 h-6" />
          Private Tournament
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground">
          {user
            ? 'This tournament is private. You need to request access to view it.'
            : 'Please sign in to request access to this private tournament.'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        {user ? (
          <Button onClick={handleRequestAccess}>
            {isLoading ? 'Requesting...' : 'Request Access'}
          </Button>
        ) : (
          <Button
            onClick={handleLoginRedirect}
            className="flex items-center gap-2"
          >
            <LogInIcon className="w-4 h-4" />
            Sign in
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
