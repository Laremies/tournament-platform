import TournamentFormModal from '@/components/tournament-form-modal';
import { HowItWorksSection } from '@/components/ui/landing-pages';
import { getAuthUser } from '@/lib/actions';

export default async function Page() {
  const user = await getAuthUser();

  return (
    <>
      <main className="flex-1 flex flex-col gap-6 px-4">
        <h2 className="font-medium text-xl mb-4">Tournament Platform Home</h2>
        <TournamentFormModal user={user}/>

        <HowItWorksSection />
      </main>
    </>
  );
}
