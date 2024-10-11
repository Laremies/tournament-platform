'use client';

import { getUsername, submitNewPublicMessage } from '@/lib/actions';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useRef, useState } from 'react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

type PublicMessage = {
  id: string;
  created_at: string;
  message: string;
  tournament_id: string;
  user_id: string;
  users: {
    username: string;
  };
};

export function ChatBox({
  initMessages,
  tournamentId,
}: {
  initMessages: PublicMessage[];
  tournamentId: string;
}) {
  const supabase = createClient();

  const [messages, setMessages] = useState<PublicMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { toast } = useToast();

  useEffect(() => {
    setMessages(initMessages);
  }, [initMessages]);

  //TODO: still a small bug where if someone sends a message quickly after reloading the page, the websocket connection is not established yet and the message is not shown
  useEffect(() => {
    //handle new server message
    const handleNewMessage = async (message: PublicMessage) => {
      if (message.tournament_id === tournamentId) {
        const user = await getUsername(message.user_id);
        const newMessage: PublicMessage = {
          ...message,
          users: {
            username: user.username,
          },
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    };
    //subscribe to new messages
    const channel = supabase
      .channel('public:publicMessages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'publicMessages' },
        (payload) => {
          handleNewMessage(payload.new as PublicMessage);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase, tournamentId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        block: 'start',
        behavior: 'smooth',
      });
    }
  }, [messages]);

  //send new message
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const { success, error } = await submitNewPublicMessage(
      formData,
      tournamentId
    );
    if (success) {
      setNewMessage('');
    }
    if (error) {
      toast({
        title: 'Error',
        description: error,
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div>
      <ScrollArea className="h-[160px] pr-4">
        {messages.map((message) => (
          <div key={message.id}>
            <p>
              <span className="font-bold text-blue-500">
                {message.users.username}
              </span>
              : {message.message}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} style={{ height: 0 }} />
      </ScrollArea>
      <form
        onSubmit={handleSubmit}
        className="flex w-full items-center space-x-2 mt-2"
      >
        <Input
          type="text"
          id="message"
          name="message"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit" className="ml-2" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </div>
  );
}
