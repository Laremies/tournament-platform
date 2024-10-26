'use client';

import { useChat } from '@/utils/context/ChatContext';
import { useState, useEffect } from 'react';
import { Card, CardHeader } from './ui/card';
import { getDirectMessages, getUsername } from '@/lib/actions';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { PrivateChatbox } from './private-chatbox';
import { User } from '@supabase/supabase-js';

export interface DirectMessage {
  id: string;
  message: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
}
//in this component fetch get receiver from context and fetch username and messages
//also drag and drop wrapper?
//also presense status
export const PrivateChat = ({ user }: { user: User }) => {
  //todo: fix usechat type
  const { chatOpen, setChatOpen, receiverId } = useChat();
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState<DirectMessage[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (receiverId) {
        setUsername('');
        setMessages([]);
        const { username } = await getUsername(receiverId);
        if (username) {
          setUsername(username);
        }
        const { messages } = await getDirectMessages(receiverId);
        if (messages) {
          setMessages(messages);
        }
      }
    };

    fetchData();
  }, [receiverId]);

  if (!chatOpen) return null;

  return (
    <Card className="w-[400px]   mx-auto relative fixed bottom-0 right-0">
      <CardHeader className="flex flex-row items-center justify-between p-4 ">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{username}</h2>
          {username !== '' && (
            <>
              <div
                className={`w-2 h-2 rounded-full ${false ? 'bg-green-400' : 'bg-gray-400'}`}
              />
              <span className="text-xs font-medium">
                {false ? 'Online' : 'Offline'}
              </span>
            </>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-primary-foreground hover:bg-primary-foreground hover:text-primary"
          onClick={() => {
            setChatOpen(false);
          }}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>

      <PrivateChatbox
        initialMessages={messages}
        receiverId={receiverId}
        user={user}
      />
    </Card>
  );
};
