'use client';
import { useState } from 'react';
import { Notification } from './notifications-server';
import { Bell, ChevronRight, MessageSquare } from 'lucide-react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@radix-ui/react-popover';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useChat } from '@/utils/context/ChatContext';

//TODO: add realtime to notifications
export function Notifications({
  initNotifications,
}: {
  initNotifications: Notification[];
}) {
  const [notifications, setNotifications] = useState(initNotifications);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative rounded-full">
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-3 h-2 w-2 rounded-full bg-red-500" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Card className="z-10 w-[300px] pr-1 pl-0">
            <CardHeader className="p-2 pb-0 ">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-sm font-semibold">
                    Notifications
                  </CardTitle>
                </div>
                <Button
                  size="sm"
                  variant={'ghost'}
                  className="text-xs"
                  onClick={() => setNotifications([])} //TODO: also update notification.read to true in db
                >
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[200px] ">
                {notifications.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">
                      No new notifications
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id}>
                      {notification.type === 'new_message' && (
                        <NewMessageNotification notification={notification} />
                      )}
                      {notification.type === 'tournament_start' && (
                        <TournamentStartNotification
                          notification={notification}
                        />
                      )}
                      {notification.type === 'new_matchup' && (
                        <NewMatchupNotification notification={notification} />
                      )}
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>
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
  console.log(notification);

  return (
    <Card className="mb-0 dark:bg-gradient-to-r from-gray-900 to-black">
      <CardContent className="pt-1 pr-2 pb-0 pl-1">
        <div className="flex items-start">
          <div className="flex-1 ">
            <p className="text-sm font-medium leading-none">
              New message from {notification.username}
            </p>
            <p className="text-sm text-muted-foreground">
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

//TODO
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TournamentStartNotification = ({ notification }: NotificationProps) => {
  return <></>;
};

//TODO
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NewMatchupNotification = ({ notification }: NotificationProps) => {
  return <></>;
};
