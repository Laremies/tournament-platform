'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { InfoIcon, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { submitTournament } from '@/lib/actions';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  description: z
    .string()
    .max(3000, 'Description must be 3000 characters or less')
    .optional(),
  maxPlayers: z
    .number()
    .int()
    .min(3, 'Maximum must be at least 3 players')
    .max(1000, 'Maximum 1000 players')
    .optional(),
  isPrivate: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TournamentFormModalProps {
  user: { id: string } | null;
}

export default function TournamentFormModal({
  user,
}: TournamentFormModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      maxPlayers: undefined,
      isPrivate: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    const response = await submitTournament(formData);

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
    form.reset();
  };

  return (
    <>
      {user && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Zap className="h-4 w-4 mr-2" /> Create Tournament
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Create Tournament</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new tournament.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Name{' '}
                        <span className="text-xs align-super text-destructive">
                          *
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxPlayers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Players</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseInt(e.target.value)
                                : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isPrivate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <div className="flex items-center space-x-2">
                          <FormLabel>Make private</FormLabel>
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="w-[400px]">
                                <p>
                                  Private tournaments can only be found by
                                  direct link.
                                </p>
                                <p>
                                  Accessible only to players who have been
                                  approved to join by the creator (you).
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit">Create</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
