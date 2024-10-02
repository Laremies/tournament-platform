import {
  HowItWorksSection,
  PopularTournaments,
  SignUpButton,
} from '@/components/ui/landing-pages';

export default async function Page() {
  return (
    <main className="w-full">
      <section className="w-full bg-gradient-to-b from-background to-muted py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Organize and Compete in Tournaments with Ease
          </h1>
          <p className="text-xl mb-8 text-muted-foreground">
            Create, join, and manage tournaments for any game or sport. Connect
            with players worldwide and showcase your skills.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"></div>
        </div>
      </section>

      <HowItWorksSection />
      <PopularTournaments />

      <section className="w-full py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-muted-foreground">
            Join thousands of players and organizers on TournamentPlatform
            today.
          </p>
          <SignUpButton />
        </div>
      </section>
    </main>
  );
}
