import { JoinButton } from '@/components/tournament/join-button';
import { getTournamentById } from '@/lib/actions';
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

    return (
        <div>
            <h1>Tournament Page</h1>
            <p>Tournament ID: {id}</p>
            <p>Tournament Name: {tournament?.name}</p>
            <p>Tournament description: {tournament?.description}</p>
            <p>Max players: {tournament?.max_player_count}</p>
            {data && <JoinButton user = {data.user} />}
            
        </div>
    );
};

export default TournamentPage;