'use client';

import { useChat } from '@/utils/context/ChatContext';
import { useState, useEffect } from 'react';
import { Card, CardHeader } from './ui/card';
import { getDirectMessages, getUsername } from '@/lib/actions';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { PrivateChatbox } from './private-chatbox';
import { User } from '@supabase/supabase-js';
import { Separator } from './ui/separator';
import { createClient } from '@/utils/supabase/client';

export interface DirectMessage {
  id: string;
  message: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
}
interface UserStatus {
  user: string;
  online_at: string;
}

//also drag and drop wrapper?
//also presense status
export const PrivateChat = ({ user }: { user: User }) => {
  const supabase = createClient();
  //todo: fix usechat type
  const { chatOpen, setChatOpen, receiverId } = useChat();
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  //presense logic mostly taken from participant list
  const [presentUserState, setPresentUserState] = useState({});
  const [presentUserIds, setPresentUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (!chatOpen) return;
    const roomId = [user.id, receiverId].sort().join(':');
    const room = supabase.channel(`tournament:${roomId}`);

    const userStatus = {
      user: user?.id || 'non-logged-in',
      online_at: new Date().toISOString(),
    };

    room
      .on('presence', { event: 'sync' }, () => {
        const newState = room.presenceState() as Record<string, UserStatus[]>;
        setPresentUserState(newState);
        setPresentUserIds(
          Object.values(newState)
            .flat()
            .map((status) => (status as UserStatus).user)
        );
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        setPresentUserState({ ...presentUserState, ...newPresences });
        setPresentUserIds(
          Object.values(presentUserState)
            .flat()
            .map((status) => (status as UserStatus).user)
        );
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        setPresentUserState({ ...presentUserState, ...leftPresences });
        setPresentUserIds(
          Object.values(presentUserState)
            .flat()
            .map((status) => (status as UserStatus).user)
        );
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') {
          return;
        }

        await room.track(userStatus);
      });
    return () => {
      room.untrack();
      room.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, receiverId, user?.id, chatOpen]);

  useEffect(() => {
    if (!chatOpen) return;
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
  }, [receiverId, chatOpen]);

  if (!chatOpen) return null;

  return (
    <Card className="w-[400px] mx-auto fixed bottom-0 right-0">
      <CardHeader className="flex flex-row items-center justify-between p-4 ">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{username}</h2>
          {username !== '' && (
            <>
              <div
                className={`w-2 h-2 rounded-full ${receiverId && presentUserIds.includes(receiverId) ? 'bg-green-400' : 'bg-gray-400'}`}
              />
              <span className="text-xs font-medium">
                {receiverId && presentUserIds.includes(receiverId)
                  ? 'Viewing Now'
                  : 'Away'}
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
          <X className="h-6 w-6 text-black dark:text-white" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>
      <Separator />

      {receiverId && (
        <PrivateChatbox
          present={presentUserIds.includes(receiverId)}
          initialMessages={messages}
          receiverId={receiverId}
          user={user}
        />
      )}
    </Card>
  );
};
