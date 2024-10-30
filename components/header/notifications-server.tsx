import { User } from '@supabase/supabase-js';
import { Notifications } from './notifications';
import { getUserNotifications } from '@/lib/actions';

export interface Notification {
  id: string;
  type: string;
  user_id: string;
  read: boolean;
  created_at: string;
  related_id?: string; //tournament_id, sender_id, etc
  username?: string;
  message?: string;
}

export default async function NotificationComponent({ user }: { user: User }) {
  const { notifications } = await getUserNotifications(user.id);

  return (
    <>
      <Notifications initNotifications={notifications || []} />
    </>
  );
}
