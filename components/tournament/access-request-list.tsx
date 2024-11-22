'use client';

import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { acceptAccessRequest, rejectAccessRequest } from '@/lib/actions';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export interface AccessRequest {
  created_at: string | number | Date;
  id: string;
  user_id: string;
  tournament_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  users: {
    username: string;
    avatar_url: string;
  };
}

interface AccessRequestListProps {
  requests: AccessRequest[];
}

//TODO: if we add a notification dropdown, we could put this component there instead of the tournament page
export default function AccessRequestList({
  requests,
}: AccessRequestListProps) {
  const [requestList, setRequests] = useState<AccessRequest[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setRequests(requests);
  }, [requests]);

  const handleAccept = async (accessRequest: AccessRequest) => {
    const { success, error } = await acceptAccessRequest(accessRequest);
    if (success) {
      toast({
        title: 'Success',
        description: 'Request has been accepted',
      });
    }
    if (error) {
      toast({
        title: 'Error',
        description: error,
      });
    }
    setRequests((prevRequests) =>
      prevRequests.filter((request) => request.id !== accessRequest.id)
    );
  };

  const handleReject = async (requestId: string) => {
    const { success, error } = await rejectAccessRequest(requestId);
    if (success) {
      toast({
        title: 'Success',
        description: 'Request has been rejected',
      });
    }
    if (error) {
      toast({
        title: 'Error',
        description: error,
      });
    }

    setRequests((prevRequests) =>
      prevRequests.filter((request) => request.id !== requestId)
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Access Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="pr-2">
          {requestList.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              No pending requests
            </p>
          ) : (
            <ul className="space-y-2">
              {requestList.map((request) => (
                <li
                  key={request.id}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                >
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={request.users.avatar_url}
                        alt={request.users.username}
                      />
                      <AvatarFallback>
                        {request.users.username.charAt(0).toLocaleUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link href={`/profile/${request.user_id}`}>
                        <p className="text-sm font-medium">
                          {request.users.username}
                        </p>
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 text-green-500 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-100"
                      onClick={() => handleAccept(request)}
                    >
                      <Check className="w-4 h-4" />
                      <span className="sr-only">Accept</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 text-red-500 hover:text-destructive hover:bg-red-100"
                      onClick={() => handleReject(request.id)}
                    >
                      <X className="w-4 h-4" />
                      <span className="sr-only">Reject</span>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
