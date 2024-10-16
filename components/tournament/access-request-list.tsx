'use client';

import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { acceptAccessRequest, rejectAccessRequest } from '@/lib/actions';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AccessRequest {
  created_at: string | number | Date;
  id: string;
  user_id: string;
  tournament_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  users: {
    username: string;
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

  const handleAccept = async (requestId: string) => {
    const { success, error } = await acceptAccessRequest(requestId);
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
      prevRequests.filter((request) => request.id !== requestId)
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Access Requests</CardTitle>
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
                        // src={request.user.avatarUrl}
                        alt={request.users.username}
                      />
                      <AvatarFallback>
                        {request.users.username.charAt(0).toLocaleUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {request.users.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 text-green-500 hover:text-green-700 hover:bg-green-100"
                      onClick={() => handleAccept(request.id)}
                    >
                      <Check className="w-4 h-4" />
                      <span className="sr-only">Accept</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-100"
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
