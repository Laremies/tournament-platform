'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { Tournament } from '@/app/types/types';
import { encodedRedirect } from '@/utils/utils';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const signUpAction = async (formData: FormData) => {
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const supabase = createClient();
  const origin = headers().get('origin');

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + ' ' + error.message);
    return encodedRedirect('error', '/sign-up', error.message);
  } else {
    return encodedRedirect(
      'success',
      '/sign-up',
      'Thanks for signing up! Please check your email for a verification link.'
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect('error', '/sign-in', error.message);
  }

  return redirect('/home');
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get('email')?.toString();
  const supabase = createClient();
  const origin = headers().get('origin');
  const callbackUrl = formData.get('callbackUrl')?.toString();

  if (!email) {
    return encodedRedirect('error', '/forgot-password', 'Email is required');
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      'error',
      '/forgot-password',
      'Could not reset password'
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    'success',
    '/forgot-password',
    'Check your email for a link to reset your password.'
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = createClient();

  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      'error',
      '/protected/reset-password',
      'Password and confirm password are required'
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      'error',
      '/protected/reset-password',
      'Passwords do not match'
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      'error',
      '/protected/reset-password',
      'Password update failed'
    );
  }

  encodedRedirect('success', '/protected/reset-password', 'Password updated');
};

export const signOutAction = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect('/sign-in');
};

export const getAuthUser = async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
};

//TODO: validation with zod mby?
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
        private: formData.get('isPrivate') === 'on',
    }

    const { data: tournament, error } = await supabase.from('tournaments').insert([data]).select();

    if (error || !tournament[0].id) {
        console.error(error)
        return { error: 'Failed to create tournament' }
    }

    const tournamentId = tournament[0].id;
    revalidatePath('/home') 
    return { success: true, tournamentId }
}

export async function getTournamentById(id: string) {
    const supabase = createClient()
    const { data: tournament, error } = await supabase.from('tournaments').select('*').eq('id', id).single()

    if (error) {
        return { error: 'Tournament not found' }
    }

    return { tournament: tournament as Tournament }
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

    return { tournaments: tournaments as Tournament[] }
}

export async function joinTournament(tournamentId: string) {
    const supabase = createClient()
    const userObject = await supabase.auth.getUser();

    if (userObject.data.user === null) {
        console.log('You must be logged in to join a tournament')
        return { error: 'You must be logged in to join a tournament' }
    }

    //check that the tournament exists
    const { data: tournament, error } = await supabase.from('tournaments').select('*').eq('id', tournamentId).single()

    if (error || !tournament) {
        console.error(error)
        return { error: 'Tournament not found' }
    }
    //somewhere here add a check if tournament.max_player_count > tournamentUsers.length

    //insert tournament-user mapping into the db
    const { data: tournamentUser, error: playerError } = await supabase.from('tournamentUsers').insert([{ tournament_id: tournamentId, user_id: userObject.data.user.id }]).select()

    if (playerError || !tournamentUser[0].id) {
        console.error(playerError)
        return { error: 'Failed to join tournament' }
    }
    revalidatePath(`/tournaments/${tournamentId}`)

    return { success: true }
}

export async function getTournamentPlayers(tournamentId: string) { //need to provide tags?
    const supabase = createClient()
    const { data: tournamentUsers, error } = await supabase.from('tournamentUsers').select('*').eq('tournament_id', tournamentId) //TODO: add natural join with users table to get usernames and stuff

    if (error) {
        console.error(error)
        return { error: 'Failed to fetch tournament players' }
    }

    return { tournamentUsers }
}