import { getUserTournaments } from '@/lib/actions';
import TournamentDropdown from './my-tournaments-dropdown';

export default async function TournamentDropdownList() {
  const { tournaments } = await getUserTournaments();
  if (!tournaments) {
    return null;
  }

  return <TournamentDropdown tournaments={tournaments} />;
}
