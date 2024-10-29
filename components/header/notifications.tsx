'use client';
import { useEffect, useState } from 'react';
import { Notification } from './notifications-server';
import Link from 'next/link';
import {
  Bell,
  ChevronRight,
  MessageSquare,
  Swords,
  Trophy,
  X,
} from 'lucide-react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useChat } from '@/utils/context/ChatContext';
import { getUsername, markAllNotificationsAsRead } from '@/lib/actions';
import { createClient } from '@/utils/supabase/client';
import { AnimatePresence, motion } from 'framer-motion';

export function Notifications({
  initNotifications,
}: {
  initNotifications: Notification[];
}) {
  const supabase = createClient();

  const [notifications, setNotifications] = useState(initNotifications);
  const [showNewNotification, setShowNewNotification] = useState(false);
  const [newNotification, setNewNotification] = useState<Notification>();

  useEffect(() => {
    const handleNewNotification = async (
      newNotificationFromServer: Notification
    ) => {
      if (newNotificationFromServer.type === 'new_message') {
        const { username } = await getUsername(
          newNotificationFromServer.related_id
        );
        newNotificationFromServer.username = username;
        setNotifications((prevNotifications) => [
          newNotificationFromServer,
          ...prevNotifications,
        ]);
      }
      if (newNotificationFromServer.type === 'tournament_start') {
        setNotifications((prevNotifications) => [
          newNotificationFromServer,
          ...prevNotifications,
        ]);
      }
      if (newNotificationFromServer.type === 'new_matchup') {
        console.log(newNotificationFromServer);
        setNotifications((prevNotifications) => [
          newNotificationFromServer,
          ...prevNotifications,
        ]);
      }
      setNewNotification(newNotificationFromServer);
      setShowNewNotification(true);
      setTimeout(() => {
        setShowNewNotification(false);
      }, 4000);
    };

    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          handleNewNotification(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase]);

  const handleMarkAllAsRead = async () => {
    if (notifications.length === 0) return;
    setNotifications([]);
    await markAllNotificationsAsRead(notifications);
  };

  return (
    <>
      <div className="fixed top-16 right-4">
        {showNewNotification && newNotification && (
          <AnimatePresence>
            <motion.div
              key={newNotification.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-primary text-primary-foreground rounded-lg shadow-lg p-4 max-w-sm w-full"
            >
              <div className="flex items-start">
                <div className="flex-1 mr-2">
                  {newNotification.type === 'new_message' && ( //different message for different notification types
                    <p className="text-sm">
                      {'New message from ' + newNotification.username}
                    </p>
                  )}
                  {newNotification.type === 'tournament_start' && (
                    <p className="text-sm">
                      {'Tournament ' +
                        newNotification.message +
                        ' just started!'}
                    </p>
                  )}
                  {newNotification.type === 'new_matchup' && (
                    <p className="text-sm">
                      {'You got a new opponent in ' +
                        newNotification.message +
                        '!'}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowNewNotification(false)}
                  className="flex-shrink-0 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  aria-label="Close notification"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative rounded-full">
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-3 h-2 w-2 rounded-full bg-red-500" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-1 animate-slide-in">
          <div className="flex justify-between items-center">
            <div className="pl-2">
              <p className="text-sm font-semibold">Notifications</p>
            </div>
            <Button
              size="sm"
              variant={'ghost'}
              className="text-xs"
              onClick={handleMarkAllAsRead}
            >
              Clear All
            </Button>
          </div>
          <ScrollArea className="h-[300px] ">
            {notifications.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">
                  No new notifications
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="animate-fade-in">
                  {notification.type === 'new_message' && (
                    <NewMessageNotification notification={notification} />
                  )}
                  {notification.type === 'tournament_start' && (
                    <TournamentStartNotification notification={notification} />
                  )}
                  {notification.type === 'new_matchup' && (
                    <NewMatchupNotification notification={notification} />
                  )}
                </div>
              ))
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </>
  );
}

// Utility function to format time
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString([], {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

interface NotificationProps {
  notification: Notification;
}

const NewMessageNotification = ({ notification }: NotificationProps) => {
  const { setChatOpen, setReceiverId } = useChat();
  const handleShowChat = () => {
    if (notification.related_id) {
      setChatOpen(true);
      setReceiverId(notification.related_id);
    }
  };

  return (
    <Card className="mb-0 dark:bg-gradient-to-r from-gray-900 to-black z-20">
      <CardContent className="pt-1 pr-2 pb-0 pl-1">
        <div className="flex items-start">
          <div className="flex-1 ">
            <p className="text-sm font-medium leading-none line-clamp-">
              New message from{' '}
              <span className="font-bold text-blue-500">
                {notification.username}
              </span>
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {notification.message}
            </p>
            <div className="flex items-center justify-between ">
              <div className="flex items-center">
                <MessageSquare className="mr-2 h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {formatTime(notification.created_at)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs hover:bg-transparent"
                onClick={handleShowChat}
              >
                {'Open Chat'}
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TournamentStartNotification = ({ notification }: NotificationProps) => {
  return (
    <>
      <Card className="mb-0 dark:bg-gradient-to-r from-gray-900 to-black z-20">
        <CardContent className="pt-1 pr-2 pb-0 pl-1">
          <div className="flex items-start">
            <div className="flex-1 ">
              <p className="text-sm font-medium leading-none line-clamp-">
                Tournament {''}
                <span className="font-bold text-green-500">
                  {notification.message}
                </span>{' '}
                just started!
              </p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                Go see who you&apos;re up against!
              </p>
              <div className="flex items-center justify-between ">
                <div className="flex items-center">
                  <Trophy className="mr-2 h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {formatTime(notification.created_at)}
                  </span>
                </div>
                <Link href={`/tournaments/${notification.related_id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs hover:bg-transparent"
                  >
                    {'Show Tournament'}
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

const NewMatchupNotification = ({ notification }: NotificationProps) => {
  return (
    <>
      <Card className="mb-0 dark:bg-gradient-to-r from-gray-900 to-black z-20">
        <CardContent className="pt-1 pr-2 pb-0 pl-1">
          <div className="flex items-start">
            <div className="flex-1 ">
              <p className="text-sm font-medium leading-none line-clamp-">
                You have a new opponent in {''}
                <span className="font-bold text-yellow-500">
                  {notification.message}
                </span>
                {'!'}
              </p>
              <div className="flex items-center justify-between ">
                <div className="flex items-center">
                  <Swords className="mr-2 h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {formatTime(notification.created_at)}
                  </span>
                </div>
                <Link href={`/tournaments/${notification.related_id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs hover:bg-transparent"
                  >
                    {'Show Tournament'}
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
