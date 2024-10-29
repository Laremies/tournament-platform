import { getUsername, signOutAction } from '@/lib/actions';
import { hasEnvVars } from '@/utils/supabase/check-env-vars';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { createClient } from '@/utils/supabase/server';
import { LogIn, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default async function AuthButton() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { username } = await getUsername(user?.id);

  if (!hasEnvVars) {
    return (
      <>
        <div className="flex gap-4 items-center">
          <div>
            <Badge
              variant={'default'}
              className="font-normal pointer-events-none"
            >
              Please update .env.local file with anon key and url
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              size="sm"
              variant="outline"
              disabled
              className="opacity-75 cursor-none pointer-events-none"
            >
              <Link href="/sign-in">
                <LogIn className="mr-2 h-4 w-4" />
                Sign in
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant={'default'}
              disabled
              className="opacity-75 cursor-none pointer-events-none"
            >
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return user ? (
    <div className="flex items-center gap-4">
      <a href="/profile">
        <Avatar>
          <AvatarImage src={''} alt={''} />{' '}
          <AvatarFallback>{username?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </a>

      <form action={signOutAction}>
        <Button type="submit" variant={'outline'}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={'outline'}>
        <Link href="/sign-in">
          <LogIn className="mr-2 h-4 w-4" />
          Sign in
        </Link>
      </Button>
      <Button asChild size="sm" variant={'default'}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
