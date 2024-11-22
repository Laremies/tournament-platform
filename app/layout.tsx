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
import { Separator } from '@/components/ui/separator';

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
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ChatProvider>
            <main className="min-h-screen flex flex-col items-center">
              <div className="flex-1 w-full flex flex-col items-center">
                <header className="w-full border-b border-b-foreground/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="mx-auto px-4">
                    <nav className="flex flex-col py-3 gap-3 md:flex-row md:items-center md:py-4">
                      <div className="flex items-center justify-between ">
                        <Link
                          href="/"
                          className="flex items-center space-x-2 text-lg font-semibold hover:text-primary"
                        >
                          <Trophy className="h-6 w-6" />
                          <span className="hidden md:inline">
                            Tournament Platform
                          </span>
                        </Link>
                        <div className="md:hidden">
                          <HeaderAuth />
                        </div>
                      </div>
                      <Separator className="sm:hidden" />
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 md:justify-start">
                        <TournamentDropdownList />
                        <TournamentFormModal user={user} />
                      </div>
                      <div className="hidden md:block ml-auto">
                        <HeaderAuth />
                      </div>
                    </nav>
                  </div>
                </header>
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
