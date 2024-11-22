'use client';
import { useEffect, useRef, useState } from 'react';
import { DirectMessage } from './private-chat';
import { ScrollArea } from './ui/scroll-area';
import { CardContent, CardFooter } from './ui/card';
import { Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  sendNewMessageNotification,
  submitNewDirectMessage,
} from '@/lib/actions';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

interface PrivateChatboxProps {
  initialMessages: DirectMessage[];
  receiverId: string;
  user: User;
  present: boolean;
}

export function PrivateChatbox({
  initialMessages,
  receiverId,
  user,
  present,
}: PrivateChatboxProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<DirectMessage[]>(initialMessages);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const handleNewMessage = async (message: DirectMessage) => {
      //RLS should make it so that only the receiver or sender can see the message
      if (message.sender_id === receiverId || message.sender_id === user.id) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    };
    //havent here fixed the update not showing if subscribing to websocket not established
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
      //if receiver is not present, send a notification
      if (!present) {
        await sendNewMessageNotification(receiverId, formData);
      }
    }
    if (error) {
      console.error(error);
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
    <>
      <CardContent className="pb-1">
        <ScrollArea ref={scrollAreaRef} className="h-[300px] pr-4 pt-2">
          {messages &&
            messages.map((message, index) => {
              //show timestamp if message is the newest or if the difference between the current message and the previous message is greater than 5 minutes
              const isNewestMessage = index === messages.length - 1;
              const showTimestamp =
                isNewestMessage ||
                index === 0 ||
                new Date(message.created_at).getTime() -
                  new Date(messages[index - 1].created_at).getTime() >
                  5 * 60 * 1000; // 5 minutes in milliseconds

              return (
                <div
                  key={index}
                  className={`flex gap-3 mb-3 ${
                    message.receiver_id === receiverId
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div className="flex flex-col">
                    <div
                      className={`px-3 py-2 rounded-lg ${
                        message.receiver_id === receiverId
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                      style={{ wordBreak: 'break-word', fontSize: '0.90rem' }}
                    >
                      {message.message}
                    </div>
                    {showTimestamp && (
                      <span
                        className={`text-xs mt-1 ${
                          message.receiver_id === receiverId
                            ? 'text-muted-foreground self-end'
                            : 'text-muted-foreground self-start'
                        }`}
                      >
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </ScrollArea>
      </CardContent>
      <CardFooter className="mt-auto p-3">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            type="text"
            id="directmessage"
            name="message"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full"
            autoComplete="off"
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
    </>
  );
}
