import { JoinButton } from '@/components/tournament/join-button';
import { getTournamentById, getTournamentPlayers } from '@/lib/actions';
import { createClient } from '@/utils/supabase/server';

interface Params {
    tournamentId: string;
}

const TournamentPage = async ({ params }: { params: Params }) => {

    const id = params.tournamentId
    if (!id) {
        return <p>No tournament ID provided</p>
    }
    const { tournament, error } = await getTournamentById(id)
    const { data  } = await createClient().auth.getUser();
    const { tournamentUsers: tournamentPlayers } = await getTournamentPlayers(id)

    //check if user is aprticipating, if not show join button (data && data.user && data.user.id goofy af iknow)
    const isUserParticipant = data && data.user && data.user.id && tournamentPlayers && tournamentPlayers.some((player) => player.user_id === data.user.id)

    return (
        <div>
            <h1>Tournament Page</h1>
            <p>Tournament ID: {id}</p>
            <p>Tournament Name: {tournament?.name}</p>
            <p>Tournament description: {tournament?.description}</p>
            <p>Max players: {tournament?.max_player_count}</p>
            {!isUserParticipant  && <JoinButton user = {data.user} tournamentId={id} />}
            <p>participants:</p>
            {tournamentPlayers && tournamentPlayers.map((player) => (
                <p>Player {player.user_id}</p>
            ))}
        </div>
    );
};

export default TournamentPage;