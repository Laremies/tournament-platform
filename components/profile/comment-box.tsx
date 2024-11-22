'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { User } from '@supabase/supabase-js';
import { ScrollArea } from '../ui/scroll-area';
import { deleteProfileComment, submitProfileComment } from '@/lib/actions';
import Link from 'next/link';

interface Comment {
  id: string;
  profile_user_id: string;
  message: string;
  created_at: string;
  sender_id: string;
  users: {
    username: string;
    avatar_url: string;
  };
}

export default function ProfileComments({
  comments = [],
  user,
  profile_user_id,
}: {
  comments?: Comment[];
  user: User | null;
  profile_user_id: string;
}) {
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingCommentIds, setDeletingCommentIds] = useState([] as string[]);

  //none of these actions are optimistic, so disable the button until profile page is revalidated in submitProfileComment
  //hosting on free vercel is also so slow that this feels really necessary
  useEffect(() => {
    setLoading(false);
    setNewComment('');
  }, [comments]);

  const ownProfile = user?.id === profile_user_id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!user) return;
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    await submitProfileComment(formData, profile_user_id);
  };

  const handleDelete = async (e: React.MouseEvent, commentId: string) => {
    e.preventDefault();
    setDeletingCommentIds(deletingCommentIds.concat(commentId));
    await deleteProfileComment(commentId, profile_user_id);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-2">
        <div className="space-y-4">
          <ScrollArea className="h-[300px]">
            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-4">
                    <Avatar>
                      <AvatarImage
                        src={comment.users.avatar_url}
                        alt={comment.users.username}
                      />
                      <AvatarFallback>
                        {comment.users.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex-shrink min-w-0 mr-2">
                          <Link href={`/profile/${comment.sender_id}`}>
                            <p className="font-medium leading-none text-primary truncate">
                              {comment.users.username}
                            </p>
                          </Link>
                        </div>
                        <div className="flex-shrink-0 text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(comment.created_at).toLocaleDateString()}
                          {(ownProfile || user?.id === comment.sender_id) && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              <a
                                href="#"
                                onClick={(e) => handleDelete(e, comment.id)}
                              >
                                {deletingCommentIds.includes(comment.id)
                                  ? 'Deleting...'
                                  : 'Delete'}
                              </a>
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {comment.message}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
        </div>
        {user && (
          <form onSubmit={handleSubmit} className="space-y-2">
            <Textarea
              placeholder="Leave a comment..."
              name="message"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={loading}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Posting...' : 'Post Comment'}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          {comments.length} comment{comments.length !== 1 ? 's' : ''}
        </p>
      </CardFooter>
    </Card>
  );
}
