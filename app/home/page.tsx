import {
  BrowseTournamentsButton,
  TournamentsSection,
} from '@/components/ui/landing-pages';
import { getAllUserCurrentTournaments } from '@/lib/actions';

export default async function Page() {
  const { tournaments } = await getAllUserCurrentTournaments();

  return (
    <main className="w-full">
      <section className="w-full bg-gradient-to-b from-background to-muted py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Tournament Platform Home
          </h1>
          <p className="text-xl mb-8 text-muted-foreground"></p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"></div>
        </div>
      </section>

      <TournamentsSection
        title="Current Own Tournaments"
        tournaments={tournaments}
        direction="t"
      />

      <TournamentsSection
        title="Popular Tournaments"
        button={<BrowseTournamentsButton />}
      />
    </main>
  );
}
