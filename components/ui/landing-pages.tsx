import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, LogIn, Frown } from 'lucide-react';
import { Match, Tournament } from '@/app/types/types';
import TournamentCard from '@/components/tournament/card';
import { Card, CardContent } from '@/components/ui/card';
import MatchCard from '@/components/match-card';

const BrowseTournamentsButton = () => (
  <Link href="/tournaments">
    <Button size="lg">
      <Search className="mr-2 h-4 w-4" /> Browse Other Tournaments
    </Button>
  </Link>
);

const SignUpButton = () => (
  <Link href="/sign-up">
    <Button size="lg">
      <LogIn className="mr-2 h-4 w-4" /> Sign Up
    </Button>
  </Link>
);

const HowItWorksSection = () => (
  <section className="bg-gradient-to-t from-background to-muted py-20 text-center">
    <div className=" container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
            1
          </div>
          <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
          <p className="text-muted-foreground">
            Create your account and set up your player profile.
          </p>
        </div>
        <div className="text-center">
          <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
            2
          </div>
          <h3 className="text-xl font-semibold mb-2">Create or Join</h3>
          <p className="text-muted-foreground">
            Start your own tournament or browse and join existing ones.
          </p>
        </div>
        <div className="text-center">
          <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
            3
          </div>
          <h3 className="text-xl font-semibold mb-2">Compete</h3>
          <p className="text-muted-foreground">
            Play matches, track results, and climb the rankings.
          </p>
        </div>
      </div>
    </div>
  </section>
);

interface TournamentsSectionProps {
  title: string;
  tournaments?: Tournament[] | null;
  direction?: string;
  button?: React.ReactNode;
}

const TournamentsSection: React.FC<TournamentsSectionProps> = ({
  title,
  tournaments,
  direction = 'b',
  button,
}) => (
  <section
    className={`bg-gradient-to-${direction} from-background to-muted py-20`}
  >
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tournaments && tournaments.length > 0 ? (
          tournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center gap-8">
            <Card className="p-6">
              <CardContent className="flex flex-col items-center justify-center">
                <Frown className="h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No tournaments found
                </h3>
                <p className="text-base text-muted-foreground text-center max-w-md">
                  Unfortunately, there are no tournaments available at this
                  time. Please check back later or create your own tournament!
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <div className="flex justify-center mt-8">{button}</div>
    </div>
  </section>
);

interface MatchesSectionProps {
  title: string;
  matches?: Match[] | null;
  direction?: string;
  button?: React.ReactNode;
}

const MatchesSection: React.FC<MatchesSectionProps> = ({
  title,
  matches,
  direction = 'b',
  button,
}) => (
  <section
    className={`bg-gradient-to-${direction} from-background to-muted py-20`}
  >
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {matches && matches.length > 0 ? (
          matches.map((match) => <MatchCard key={match.id} match={match} />)
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center gap-8">
            <Card className="p-6">
              <CardContent className="flex flex-col items-center justify-center">
                <Frown className="h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No matches found
                </h3>
                <p className="text-base text-muted-foreground text-center max-w-md">
                  Unfortunately, you have no upcoming matches. Please check back
                  later or create your own tournament!
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <div className="flex justify-center mt-8">{button}</div>
    </div>
  </section>
);

export {
  BrowseTournamentsButton,
  HowItWorksSection,
  TournamentsSection,
  MatchesSection,
  SignUpButton,
};
