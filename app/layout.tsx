import HeaderAuth from '@/components/header/header-auth';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { robotoBlack } from '@/components/ui/fonts';
import { ThemeProvider } from 'next-themes';
import Link from 'next/link';
import './globals.css';
import TournamentFormModal from '@/components/tournament-form-modal';
import { Toaster } from '@/components/ui/toaster';
import TournamentDropdownList from '@/components/header/tournament-dropdown-list';
import { Trophy } from 'lucide-react';
import { getAuthUser } from '@/lib/actions';
import { ChatProvider } from '../utils/context/ChatContext';
import { PrivateChat } from '@/components/private-chat';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Tournament Platform',
  description: 'A platform for creating and managing tournaments',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  return (
    <html lang="en" className={robotoBlack.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ChatProvider>
            <main className="min-h-screen flex flex-col items-center">
              <div className="flex-1 w-full flex flex-col items-center">
                <nav className="w-full flex space-between border-b border-b-foreground/10 h-16 text">
                  <div className="w-full flex justify-between items-center p-3 px-5 text-base">
                    <div className="flex gap-5 items-center font-semibold">
                      <Link
                        href="/"
                        className="hover:underline flex items-center space-x-1"
                      >
                        <Trophy /> <span>Tournament Platform</span>
                      </Link>
                      <TournamentDropdownList />
                      <div className="flex items-center gap-2">
                        <TournamentFormModal user={user} />
                      </div>
                    </div>
                    <HeaderAuth />
                  </div>
                </nav>
                <div className="w-full flex flex-col gap-20">{children}</div>
                {user && <PrivateChat user={user} />}

                <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-5 mt-auto">
                  <ThemeSwitcher />
                </footer>
              </div>
            </main>
            <Toaster />
          </ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
