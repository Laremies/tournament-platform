'use client';
import { useEffect, useRef, useState } from 'react';
import { DirectMessage } from './private-chat';
import { ScrollArea } from './ui/scroll-area';
import { CardContent, CardFooter } from './ui/card';
import { Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { submitNewDirectMessage } from '@/lib/actions';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

//here will be the websocket connection
//and message store

interface PrivateChatboxProps {
  initialMessages: DirectMessage[];
  receiverId: string;
  user: User;
}

export function PrivateChatbox({
  initialMessages,
  receiverId,
  user,
}: PrivateChatboxProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const handleNewMessage = async (message: DirectMessage) => {
      //RLS should make it so that only the receiver or sender can see the message
      //left to check if user has receiverId's chat open
      if (message.sender_id === receiverId || message.sender_id === user.id) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    };
    const channel = supabase
      .channel('public:directMessages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'directMessages' },
        (payload) => {
          handleNewMessage(payload.new as DirectMessage);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [receiverId, supabase, user.id]);

  //todo: sending new message should probably send a notifcation of some kind to the receiver
  //else they have no clue they have a new message
  //TODO: get presense status of receiver and send notification if not present
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input) return;
    setIsLoading(true);
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const { success, error } = await submitNewDirectMessage(
      formData,
      receiverId
    );
    if (success) {
      setInput('');
    }
    if (error) {
      //TODO: handle error
    }
    setIsLoading(false);
  };
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

  return (
    <CardContent>
      <ScrollArea ref={scrollAreaRef} className="h-[300px] pr-4">
        {messages &&
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 mb-4 ${
                message.receiver_id === receiverId
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              {message.message}
            </div>
          ))}
      </ScrollArea>
      <CardFooter className="mt-auto p-1">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            type="text"
            id="directmessage"
            name="message"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className=" w-full"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              'Sending...'
            ) : (
              <>
                Send
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardFooter>
    </CardContent>
  );
}
