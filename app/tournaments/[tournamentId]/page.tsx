import { getTournamentById } from '@/lib/actions';
interface Params {
    tournamentId: string;
}

export const TournamentPage = async ({ params }: { params: Params }) => {

    const id = params.tournamentId
    const { tournament, error } = await getTournamentById(id)

    return (
        <div>
            <h1>Tournament Page</h1>
            <p>Tournament ID: {id}</p>
            <p>Tournament Name: {tournament?.name}</p>
            <p>Tournament description: {tournament?.description}</p>
            <p>Max players: {tournament?.max_player_count}</p>
        </div>
    );
};

export default TournamentPage;