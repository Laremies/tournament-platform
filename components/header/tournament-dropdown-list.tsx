import { getUserTournaments } from '@/lib/actions';
import TournamentDropdown from './my-tournaments-dropdown';

export default async function TournamentDropdownList() {
  const { ownTournaments, joinedTournaments } = await getUserTournaments();
  if (!ownTournaments || !joinedTournaments) {
    return null;
  }

  return (
    <TournamentDropdown
      ownTournaments={ownTournaments}
      joinedTournaments={joinedTournaments}
    />
  );
}
