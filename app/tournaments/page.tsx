import TournmamentsBrowser from '@/components/browse-tournaments/tournament-browser';
import { getPublicTournaments } from '@/lib/actions';
import { Tournament } from '../types/types';

export interface TournamentWithStatus extends Tournament {
  status: 'waiting_for_players' | 'ongoing' | 'ended';
}

const Tournaments = async () => {
  const { tournaments: tournaments } = await getPublicTournaments();
  if (!tournaments) {
    return null;
  }

  const updatedTournaments = tournaments.map(
    (tournament): TournamentWithStatus => ({
      ...tournament,
      status: tournament.finished
        ? 'ended'
        : tournament.started
          ? 'ongoing'
          : 'waiting_for_players',
    })
  );

  return <TournmamentsBrowser tournaments={updatedTournaments} />;
};

export default Tournaments;
