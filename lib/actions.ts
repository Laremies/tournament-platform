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

    console.log(data)
    if (error || !tournament[0].id) {
        console.error(error)
        return { error: 'Failed to create tournament' }
    }

    const tournamentId = tournament[0].id;
    revalidatePath('/')

    return { success: true, tournamentId }
}