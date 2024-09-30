import { createClient } from '@/utils/supabase/server'

interface Params {
    tournamentId: string;
}

export const TournamentPage = async ({ params }: { params: Params }) => {

    const supabase = createClient()

    const id = params.tournamentId
    const { data: tournament, error } = await supabase.from('tournaments').select('*').eq('id', id).single()
    if (error) {
        return <div>Tournament room with id {id} does not exists</div>
    }

    return (
        <div>
            <h1>Tournament Page</h1>
            <p>Tournament ID: {id}</p>
            <p>Tournament Name: {tournament?.name}</p>
            <p>Tournament description: {tournament?.description}</p>
        </div>
    );
};

export default TournamentPage;