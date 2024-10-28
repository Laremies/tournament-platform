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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [disableChat, setDisableChat] = useState<boolean>(true);
  const [firstMessageReceived, setFirstMessageReceived] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setMessages(initMessages);
  }, [initMessages]);

  //DONE: still a small bug where if someone sends a message quickly after reloading the page, the websocket connection is not established yet and the message is not shown
  //--seems like supabase team is still working on it, found hacky fix from https://github.com/supabase/realtime/issues/282
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
      .subscribe((state) => {
        console.log('channel state', state);
      });

    //disable chat until websocket connection is established --from https://github.com/supabase/realtime/issues/282
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    channel.on('system' as any, {} as any, (payload: any) => {
      if (payload.extension === 'postgres_changes' && payload.status === 'ok') {
        if (firstMessageReceived) {
          setDisableChat(false);
        } else {
          setFirstMessageReceived(true);
        }
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [supabase, tournamentId, firstMessageReceived]);

  //replaced scrollintoview with this, because it was causing the page to jump
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      ) as HTMLDivElement;
      if (scrollElement) {
        scrollElement.style.scrollBehavior = 'smooth';
        scrollElement.scrollTop = scrollElement.scrollHeight;
        setTimeout(() => {
          scrollElement.style.scrollBehavior = 'auto';
        }, 1000);
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
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
      <ScrollArea ref={scrollAreaRef} className="h-[160px] pr-4">
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
        <div style={{ height: 0 }} />
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
          disabled={disableChat}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow"
          autoComplete="off"
        />
        <Button type="submit" className="ml-2" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </div>
  );
}
