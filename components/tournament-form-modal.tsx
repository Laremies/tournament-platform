'use client';

import { useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { submitTournament } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Checkbox } from './ui/checkbox';
import { User } from '@supabase/supabase-js';
import { Zap } from 'lucide-react';

interface TournamentFormModalProps {
  user: User | null;
}

interface Response {
  success?: boolean;
  tournamentId?: string;
  error?: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </Button>
  );
}

export default function TournamentFormModal({
  user,
}: TournamentFormModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState<Response | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.currentTarget as HTMLFormElement);
      const response = await submitTournament(formData);
      setResponse({ success: true, tournamentId: response.tournamentId });
    } catch (error) {
      setResponse({ error: String(error) });
    }
  };

  const router = useRouter();

  //when tournament is created, redirect to the tournament page and toast a success message
  useEffect(() => {
    if (response?.success) {
      setOpen(false);
      router.push(`/tournaments/${response.tournamentId}`);
      toast({
        title: 'Tournament Created',
        description: 'New tournament has been created successfully',
      });
    }
    if (response?.error) {
      toast({
        title: 'Error',
        description: response.error,
      });
    }
  }, [router, response, toast]);

  //we can add client side validation later
  return (
    <>
      {user && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Zap className="h-4 w-4 mr-2" /> Create Tournament
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Tournament</DialogTitle>
              <DialogDescription />
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" name="name" className="col-span-3" required />
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  name="description"
                  className="col-span-3"
                />
                <Label htmlFor="maxPlayers" className="text-right">
                  Max Players
                </Label>
                <Input
                  id="maxPlayers"
                  name="maxPlayers"
                  type="number"
                  min="1"
                  className="col-span-3"
                />

                <Label htmlFor="isPrivate" className="text-right">
                  Make private
                </Label>
                <Checkbox id="isPrivate" name="isPrivate" />
              </div>
              <div className="flex justify-end items-center">
                <SubmitButton />
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
