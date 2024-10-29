'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { Tournament, TournamentPlayer } from '@/app/types/types';
import { encodedRedirect } from '@/utils/utils';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { generateSingleEliminationBracket } from './bracket-generators';

interface UserJoinedTournaments {
  tournaments: { name: string; id: string }[];
}

export const signUpAction = async (formData: FormData) => {
  const supabase = createClient();
  const username = formData.get('username')?.toString();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const origin = headers().get('origin');

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
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
  const supabase = createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

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
  const supabase = createClient();
  const email = formData.get('email')?.toString();
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
export async function submitTournament(formData: FormData) {
  const supabase = createClient();
  const userObject = await supabase.auth.getUser();

  if (userObject.data.user === null) {
    console.log('You must be logged in to create a tournament');
    return { error: 'You must be logged in to create a tournament' };
  }
  const data = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    creator_id: userObject.data.user.id as string,
    max_player_count: parseInt(formData.get('maxPlayers') as string),
    private: formData.get('isPrivate') === 'on',
  };

  const { data: tournament, error } = await supabase
    .from('tournaments')
    .insert([data])
    .select();

  if (error || !tournament[0].id) {
    console.error(error);
    return { error: 'Failed to create tournament' };
  }

  const tournamentId = tournament[0].id;
  revalidatePath('/home');
  return { success: true, tournamentId };
}

export async function getTournamentById(id: string) {
  const supabase = createClient();
  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { error: 'Tournament not found' };
  }

  return { tournament: tournament as Tournament };
}

export async function getUserTournaments() {
  const supabase = createClient();
  const userObject = await supabase.auth.getUser();

  if (userObject.data.user === null) {
    return { error: 'You must be logged in to view your tournaments' };
  }
  //i remember hearing its good practice to keep the selected fields to a minimum with supabase queries (dont remember where i heard this)
  //dont know if that breaks the tournament type usage, doesn't seem to
  const { data: ownTournaments, error } = await supabase
    .from('tournaments')
    .select('name, id')
    .eq('creator_id', userObject.data.user.id)
    .order('created_at', { ascending: false });
  const { data: joined, error: joinedError } = await supabase
    .from('tournamentUsers')
    .select('tournaments(name, id)')
    .eq('user_id', userObject.data.user.id);

  if (joinedError || error) {
    console.error(joinedError);
    return { error: 'Failed to fetch all tournaments' };
  }

  const joinedTournaments = (joined as UserJoinedTournaments[]).flatMap(
    (item) => item.tournaments
  );

  return {
    ownTournaments: ownTournaments as Tournament[],
    joinedTournaments: joinedTournaments as Tournament[],
  };
}

export async function getAllUserCurrentTournaments() {
  const supabase = createClient();
  const userObject = await supabase.auth.getUser();

  if (userObject.data.user === null) {
    return {
      tournaments: null,
      error: 'You must be logged in to view your tournaments',
    };
  }

  const { data: ownTournaments, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('creator_id', userObject.data.user.id)
    .eq('finished', false)
    .order('created_at', { ascending: false });

  const { data: joined, error: joinedError } = await supabase
    .from('tournamentUsers')
    .select('tournaments(*)')
    .eq('user_id', userObject.data.user.id);

  if (joinedError || error) {
    console.error(joinedError);
    return { tournaments: null, error: 'Failed to fetch all tournaments' };
  }

  const joinedTournaments = joined.flatMap((item) => item.tournaments);

  return {
    tournaments: [
      ...(ownTournaments as Tournament[]),
      ...(joinedTournaments as Tournament[]),
    ],
    error: null,
  };
}

export async function joinTournament(tournamentId: string) {
  const supabase = createClient();
  const userObject = await supabase.auth.getUser();

  if (userObject.data.user === null) {
    console.log('You must be logged in to join a tournament');
    return { error: 'You must be logged in to join a tournament' };
  }

  //check that the tournament exists
  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();

  if (error || !tournament) {
    console.error(error);
    return { error: 'Tournament not found' };
  }

  if (tournament.started) {
    return { error: 'Tournament has already started' };
  }

  if (
    tournament.max_player_count &&
    tournament.player_count >= tournament.max_player_count
  ) {
    return { error: 'Tournament is full' };
  }

  const { data: tournamentUser, error: playerError } = await supabase
    .from('tournamentUsers')
    .insert([{ tournament_id: tournamentId, user_id: userObject.data.user.id }])
    .select();

  if (playerError || !tournamentUser[0].id) {
    console.error(playerError);
    return { error: 'Failed to join tournament' };
  }

  const { error: updateError } = await supabase
    .from('tournaments')
    .update({ player_count: tournament.player_count + 1 })
    .eq('id', tournamentId);

  if (updateError) {
    console.error(updateError);
    return { error: 'Failed to update player count' };
  }
  revalidatePath(`/tournaments/${tournamentId}`);

  return { success: true };
}

export async function getTournamentPlayers(tournamentId: string) {
  const supabase = createClient();

  //need to provide tags?
  const { data: tournamentUsers, error } = await supabase
    .from('tournamentUsers')
    .select('*, users(username)')
    .eq('tournament_id', tournamentId);

  if (error) {
    console.error(error);
    return { error: 'Failed to fetch tournament players' };
  }

  return { tournamentUsers: tournamentUsers as TournamentPlayer[] };
}

export async function getTournamentPlayerCount(tournamentId: string) {
  const players = await getTournamentPlayers(tournamentId);

  return players.tournamentUsers?.length || 0;
}

export async function startTournament(tournamentId: string) {
  const supabase = createClient();

  const { success, error } =
    await generateSingleEliminationBracket(tournamentId);
  if (error) {
    return { error: error };
  }
  await supabase
    .from('tournaments')
    .update({ started: true })
    .eq('id', tournamentId);

  revalidatePath(`/tournaments/${tournamentId}`);

  return { success: success, message: 'Tournament successfully started!' };
}

export async function getMostPopularTournaments() {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_most_popular_tournaments', {
    limit_count: 6,
  });

  if (error) {
    console.error(error);
    return { error: 'Failed to fetch popular tournaments' };
  }

  return { popularTournaments: data as Tournament[] };
}

export async function UpdateUsername(newName: string, userid: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('users')
    .update({ username: newName })
    .eq('id', userid)
    .select();

  if (error) {
    throw new Error('Failed to update name');
  }
}
export async function getMediaNAme() {
  const supabase = createClient();
  const user = await getAuthUser();
  const userid = user?.id;

  // Fetch the list of media for the user
  const { data, error } = await supabase.storage
    .from('profiles')
    .list(userid + '/');

  if (error) {
    console.error('Error fetching media list:', error);
    return null;
  }

  return data.length > 0 ? data[0].name : null;
}

export async function getMediaURL(name: string | null) {
  if (name == '.emptyFolderPlaceholder') {
    console.warn('No media name provided; cannot fetch URL.');

    return null;
  }
  const supabase = createClient();
  const user = await getAuthUser();
  const userid = user?.id;
  if (name == null) {
    console.warn('No media name provided; cannot fetch URL.');
    const { data } = await supabase.storage
      .from('profiles')
      .getPublicUrl(userid + '/');
    return data.publicUrl as string;
  }
  const { data } = await supabase.storage
    .from('profiles')
    .getPublicUrl(userid + '/' + name);
  return data.publicUrl as string;
}

export async function getUsername(userId: string | undefined) {
  const supabase = createClient();

  const { data } = await supabase
    .from('users')
    .select('username')
    .eq('id', userId)
    .single();

  return { username: data?.username as string };
}

export async function getPublicMessages(tournamentId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('publicMessages')
    .select('*, users(username)')
    .eq('tournament_id', tournamentId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error);
    return { error: 'Failed to fetch public messages' };
  }

  return { messages: data };
}

export async function submitNewPublicMessage(
  formData: FormData,
  tournamentId: string
) {
  const supabase = createClient();
  const userObject = await supabase.auth.getUser();

  if (userObject.data.user === null) {
    console.log('You must be logged in to send a message');
    return { error: 'You must be logged in to send a message' };
  }

  const participants = await getTournamentPlayers(tournamentId);

  //todo check if user is creator of tournament
  //rn creator can't send messages if not participating

  if (
    !userObject.data.user ||
    !participants.tournamentUsers ||
    !participants.tournamentUsers.some(
      (player) => player.user_id === userObject.data.user?.id
    )
  ) {
    console.log(
      'You must be a participant in the tournament to send a message'
    );
    return {
      error: 'You must be a participant in the tournament to send a message',
    };
  }

  const data = {
    message: formData.get('message') as string,
    tournament_id: tournamentId,
    user_id: userObject.data.user.id as string,
  };

  const { error } = await supabase.from('publicMessages').insert([data]);

  if (error) {
    console.error(error);
    return { error: 'Failed to send message' };
  }

  return { success: true };
}

export async function getTournamentMatches(tournamentId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('singleEliminationMatches')
    .select('*')
    .eq('tournament_id', tournamentId);
  if (!data) {
    console.error('No matches found');
    return { error: 'No matches found' };
  }

  const matchPromises = data.map(async (match) => {
    const [awayPlayer, homePlayer] = await Promise.all([
      getUsername(match.away_player_id),
      getUsername(match.home_player_id),
    ]);

    return {
      ...match,
      awayPlayerUsername: awayPlayer.username,
      homePlayerUsername: homePlayer.username,
    };
  });

  const matches = await Promise.all(matchPromises);

  if (error) {
    console.error(error);
    return { error: 'Failed to fetch tournament matches' };
  }

  return { matches: matches };
}
export async function getAccessRequests(tournamentId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('accessRequests')
    .select('*, users(*)')
    .eq('tournament_id', tournamentId)
    .eq('status', 'pending');

  if (error) {
    console.error(error);
    return { error: 'Failed to fetch access requests' };
  }

  return { accessRequests: data };
}

export async function getUserAccessRequest(tournamentId: string) {
  const supabase = createClient();
  const userObject = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('accessRequests')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('user_id', userObject.data.user?.id);

  if (error) {
    console.error(error);
    return { error: 'Failed to fetch access request' };
  }

  return { accessRequest: data[0] };
}

export async function submitAccessRequest(tournamentId: string) {
  const supabase = createClient();
  const userObject = await supabase.auth.getUser();

  if (userObject.data.user === null) {
    console.log('You must be logged in to request access');
    return { error: 'You must be logged in to request access' };
  }

  const data = {
    tournament_id: tournamentId,
    user_id: userObject.data.user.id as string,
  };

  const { error } = await supabase.from('accessRequests').insert([data]);

  if (error) {
    console.error(error);
    return { error: 'Failed to request access' };
  }

  revalidatePath(`/tournaments/${tournamentId}`);

  return { success: true };
}

export async function acceptAccessRequest(requestId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('accessRequests')
    .update({ status: 'accepted' })
    .eq('id', requestId);

  if (error) {
    console.error(error);
    return { error: 'Failed to accept access request' };
  }

  return { success: true };
}

export async function rejectAccessRequest(requestId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('accessRequests')
    .update({ status: 'rejected' })
    .eq('id', requestId);

  if (error) {
    console.error(error);
    return { error: 'Failed to reject access request' };
  }

  return { success: true };
}

export async function kickPlayer(tournamentId: string, id: string) {
  const supabase = createClient();

  //TODO: kicking a player could also change their role so that they can't join back
  //we however dont yet have a role check in the join tournament function
  //lot more cases to consider when tournament is ongoing
  //this function simply removes the mapping between the user and the tournament

  const { error } = await supabase
    .from('tournamentUsers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(error);
    return { error: error.message };
  }
  revalidatePath(`/tournaments/${tournamentId}`);

  return { success: true };
}
