'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function submitTournament(prevState: any, formData: FormData) {
    const supabase = createClient()
    const userObject = await supabase.auth.getUser();

    if (userObject.data.user === null) {
        console.log('You must be logged in to create a tournament')
        return { error: 'You must be logged in to create a tournament' }
    }
    const data = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        creator_id: userObject.data.user.id,
        max_player_count: parseInt(formData.get('maxPlayers') as string),
    }

    const { data: tournament, error } = await supabase.from('tournaments').insert([data]).select();

    if (error || !tournament[0].id) {
        console.error(error)
        return { error: 'Failed to create tournament' }
    }

    const tournamentId = tournament[0].id;
    revalidatePath('/') //TODO: change this to the query that lists own tournaments
    return { success: true, tournamentId }
}

export async function getTournamentById(id: string) {
    const supabase = createClient()
    const { data: tournament, error } = await supabase.from('tournaments').select('*').eq('id', id).single()

    if (error) {
        return { error: 'Tournament not found' }
    }

    return { tournament }
}

export async function getUserTournaments() {
    const supabase = createClient()
    const userObject = await supabase.auth.getUser();

    if (userObject.data.user === null) {
        return { error: 'You must be logged in to view your tournaments' }
    }

    const { data: tournaments, error } = await supabase.from('tournaments').select('*').eq('creator_id', userObject.data.user.id).order('created_at', { ascending: false });

    if (error) {
        console.error(error)
        return { error: 'Failed to fetch tournaments' }
    }

    return { tournaments }
}