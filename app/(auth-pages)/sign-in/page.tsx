import { signInAction } from '@/lib/actions';
import { FormMessage, Message } from '@/components/form-message';
import { SubmitButton } from '@/components/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function Login({ searchParams }: { searchParams: Message }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 rounded-xl shadow-2xl border mt-[-40vh] dark:bg-gradient-to-b dark:from-primary/20 dark:to-background">
        <form className="flex flex-col space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link
                className="font-medium text-primary hover:underline dark:text-accent"
                href="/sign-up"
              >
                Sign up
              </Link>
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  className="text-xs text-muted-foreground hover:underline"
                  href="/forgot-password"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Your password"
                required
              />
            </div>
          </div>
          <SubmitButton pendingText="Signing In..." formAction={signInAction}>
            Sign in
          </SubmitButton>
          <FormMessage message={searchParams} />
        </form>
      </div>
    </div>
  );
}
