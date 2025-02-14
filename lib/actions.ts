'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import {
  Tournament,
  TournamentPlayer,
  SingleEliminationMatch,
} from '@/app/types/types';
import { encodedRedirect } from '@/utils/utils';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { generateSingleEliminationBracket } from './bracket-generators';
import { PublicUser } from '@/app/types/types';
import { Notification } from '@/components/header/notifications-server';
import { RecentChat } from '@/components/header/recentChats';
import { AccessRequest } from '@/components/tournament/access-request-list';

interface UserJoinedTournaments {
  tournaments: { name: string; id: string }[];
}

interface FinalMatchResult {
  finalMatch?: SingleEliminationMatch;
  error?: string;
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
    private: formData.get('isPrivate'),
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
    .eq('user_id', userObject.data.user.id)
    .order('created_at', { ascending: false });

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
    .eq('finished', false);

  const { data: joined, error: joinedError } = await supabase
    .from('tournamentUsers')
    .select('tournaments(*)')
    .eq('user_id', userObject.data.user.id);

  if (joinedError || error) {
    console.error(joinedError);
    return { tournaments: null, error: 'Failed to fetch all tournaments' };
  }

  const joinedTournaments = joined.flatMap((item) => item.tournaments);
  const uniqueTournaments = new Map<string, Tournament>();

  ownTournaments.forEach((tournament) => {
    uniqueTournaments.set(tournament.id, tournament);
  });

  joinedTournaments.forEach((tournament) => {
    if (!uniqueTournaments.has(tournament.id)) {
      uniqueTournaments.set(tournament.id, tournament);
    }
  });

  const tournaments = Array.from(uniqueTournaments.values());
  tournaments.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });
  return {
    tournaments: tournaments,
    error: null,
  };
}

export async function getAllUserOwnedPublicTournaments(userId: string) {
  const supabase = createClient();
  const { data: tournaments, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('creator_id', userId)
    .eq('private', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return { error: 'Failed to fetch public tournaments' };
  }

  return { tournaments: tournaments as Tournament[] };
}

export async function getAllUserMatchResults(userId: string) {
  const supabase = createClient();
  const { data: matches, error } = await supabase
    .from('singleEliminationMatches')
    .select('*, tournaments(private, name)')
    .or(`home_player_id.eq.${userId},away_player_id.eq.${userId}`)
    .not('winner_id', 'is', null)
    .eq('tournaments.private', false)
    .not('tournaments', 'is', null);

  if (!matches) {
    console.error('No matches found');
    return { error: 'No matches found' };
  }

  const matchPromises = matches.map(async (match) => {
    const [homePlayer, awayPlayer] = await Promise.all([
      getUsername(match.home_player_id),
      getUsername(match.away_player_id),
    ]);

    return {
      ...match,
      homePlayerUsername: homePlayer.username,
      awayPlayerUsername: awayPlayer.username,
    };
  });

  const matchesWithUsernames = await Promise.all(matchPromises);

  if (error) {
    console.error(error);
    return { error: 'Failed to fetch match results' };
  }

  return { matchesWithUsernames };
}

export async function getCurrentUserMatchResults() {
  const supabase = createClient();
  const user = await getAuthUser();
  if (!user) {
    return { error: 'You must be logged in to view your match results' };
  }
  const { data: matches, error } = await supabase
    .from('singleEliminationMatches')
    .select('*, tournaments(name)')
    .or(`home_player_id.eq.${user.id},away_player_id.eq.${user.id}`)
    .not('winner_id', 'is', null)
    .not('tournaments', 'is', null);

  if (!matches) {
    console.error('No matches found');
    return { error: 'No matches found' };
  }
  if (error) {
    console.error(error);
    return { error: 'Failed to fetch match results' };
  }
  const matchPromises = matches.map(async (match) => {
    const [homePlayer, awayPlayer] = await Promise.all([
      getUsername(match.home_player_id),
      getUsername(match.away_player_id),
    ]);

    return {
      ...match,
      homePlayerUsername: homePlayer.username,
      awayPlayerUsername: awayPlayer.username,
    };
  });

  const matchesWithUsernames = await Promise.all(matchPromises);

  return { matchesWithUsernames };
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
    .select('*, users(username, avatar_url)')
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
  const { data: tournament, error: updateError } = await supabase
    .from('tournaments')
    .update({ started: true })
    .eq('id', tournamentId)
    .select();

  if (updateError) {
    console.error(updateError);
    return { error: 'Failed to update tournament' };
  }

  const { tournamentUsers } = await getTournamentPlayers(tournamentId);

  if (!tournamentUsers) {
    return { error: 'Failed to fetch tournament players' };
  }

  //send notification for participants
  for (const player of tournamentUsers) {
    if (player.user_id === tournament[0].creator_id) {
      continue;
    }
    const notificationData = {
      type: 'tournament_start',
      user_id: player.user_id,
      related_id: tournamentId,
      message: tournament[0].name,
    };

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert([notificationData]);

    if (notificationError) {
      console.error(
        `Failed to send notification to user ${player.user_id}:`,
        notificationError
      );
    }
  }

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

export async function getPublicTournaments() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('tournaments')
    .select('*, analytics(view_count)')
    .eq('private', false);

  if (error) {
    console.error(error);
    return { error: 'Failed to fetch public tournaments' };
  }

  return { tournaments: data as Tournament[] };
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

export async function getUsername(userId: string | undefined) {
  if (!userId) {
    return { username: 'non-logged-in-user' };
  }
  const supabase = createClient();

  const { data } = await supabase
    .from('users')
    .select('username')
    .eq('id', userId)
    .single();

  return { username: data?.username as string };
}

export async function getPublicUserData(userid: string | undefined) {
  if (!userid) {
    // Return a default PublicUser object if userid is undefined
    return { data: {} as PublicUser };
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userid)
    .single();

  if (error) {
    console.error(error);
  }

  return { data: data as PublicUser };
}

export async function revalidateAll() {
  revalidatePath('/');
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
    const [awayPlayerAvatar, homePlayerAvatar] = await Promise.all([
      getPublicUserData(match.away_player_id),
      getPublicUserData(match.home_player_id),
    ]);

    return {
      ...match,
      awayPlayerUsername: awayPlayer.username,
      homePlayerUsername: homePlayer.username,
      awayPlayerAvatarUrl: awayPlayerAvatar.data?.avatar_url || null,
      homePlayerAvatarUrl: homePlayerAvatar.data?.avatar_url || null,
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

export async function acceptAccessRequest(accessRequest: AccessRequest) {
  const supabase = createClient();

  const { error } = await supabase
    .from('accessRequests')
    .update({ status: 'accepted' })
    .eq('id', accessRequest.id);

  if (error) {
    console.error(error);
    return { error: 'Failed to accept access request' };
  }

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('name')
    .eq('id', accessRequest.tournament_id)
    .single();

  await supabase.from('notifications').insert([
    {
      type: 'request_accepted',
      user_id: accessRequest.user_id,
      related_id: accessRequest.tournament_id,
      message: tournament?.name,
    },
  ]);

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

export async function kickPlayer(tournamentId: string, userId: string) {
  const supabase = createClient();

  //TODO: kicking a player could also change their role so that they can't join back
  //we however dont yet have a role check in the join tournament function
  //lot more cases to consider when tournament is ongoing
  //this function simply removes the mapping between the user and the tournament

  const { error } = await supabase
    .from('tournamentUsers')
    .delete()
    .eq('user_id', userId)
    .eq('tournament_id', tournamentId);

  const { data: tournament, error: tournamentError } = await supabase
    .from('tournaments')
    .select('player_count')
    .eq('id', tournamentId)
    .single();

  if (error || tournamentError) {
    console.error(error);
    console.error(tournamentError);
    return { error: 'Error kicking player' };
  }

  const { error: playerCountError } = await supabase
    .from('tournaments')
    .update({ player_count: Number(tournament.player_count) - 1 })
    .eq('id', tournamentId);

  if (playerCountError) {
    console.error(playerCountError);
    return { error: 'Error updating player count' };
  }

  revalidatePath(`/tournaments/${tournamentId}`);

  return { success: true };
}

export async function submitMatchResult(
  tournamentId: string,
  matchId: string,
  winnerId: string
) {
  const supabase = createClient();

  const { error } = await supabase
    .from('singleEliminationMatches')
    .update({ winner_id: winnerId })
    .eq('id', matchId);

  if (error) {
    console.error(error);
    return { error: 'Failed to submit match result' };
  }

  const { finalMatch } = await getTournamentFinalMatch(tournamentId);

  if (finalMatch?.id === matchId) {
    await supabase
      .from('tournaments')
      .update({ finished: true })
      .eq('id', tournamentId);

    revalidatePath(`/tournaments/${tournamentId}`);
    return { success: true };
  }

  const { data: nextMatchData, error: nextMatchError } = await supabase
    .from('singleEliminationMatches')
    .select(
      'id, home_matchup_id, away_matchup_id, home_player_id, away_player_id'
    )
    .or(`home_matchup_id.eq.${matchId}, away_matchup_id.eq.${matchId}`)
    .single();

  if (nextMatchError) {
    return { error: 'Failed to find the next match for the winner' };
  }

  if (nextMatchData) {
    const nextMatchId = nextMatchData.id;
    const updateColumn =
      nextMatchData.home_matchup_id === matchId
        ? 'home_player_id'
        : 'away_player_id';

    // Update the next match with the winner
    const { error: nextMatchUpdateError } = await supabase
      .from('singleEliminationMatches')
      .update({ [updateColumn]: winnerId })
      .eq('id', nextMatchId);

    if (nextMatchUpdateError) {
      return { error: nextMatchUpdateError.message };
    }

    //if the next match has a waiting opponent, send a notification to them
    const opponentId =
      updateColumn === 'home_player_id'
        ? nextMatchData.away_player_id
        : nextMatchData.home_player_id;

    if (opponentId) {
      const { data: tournament } = await supabase
        .from('tournaments')
        .select('name')
        .eq('id', tournamentId)
        .single();

      await supabase.from('notifications').insert([
        {
          type: 'new_matchup',
          user_id: opponentId,
          related_id: tournamentId,
          message: tournament?.name,
        },
      ]);
    }
  }

  revalidatePath(`/tournaments/${tournamentId}`);
  return { success: true };
}

export async function getTournamentWinner(tournamentId: string) {
  const { finalMatch, error }: FinalMatchResult =
    await getTournamentFinalMatch(tournamentId);

  if (error || !finalMatch || !finalMatch.winner_id) {
    return { error };
  }

  const { data: winner } = await getPublicUserData(finalMatch.winner_id);
  return { winner };
}

export async function getTournamentFinalMatch(tournamentId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('singleEliminationMatches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('round', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { finalMatch: data };
}

export async function getDirectMessages(receiver_id: string) {
  const supabase = createClient();
  const userObject = await supabase.auth.getUser();

  if (userObject.data.user === null) {
    console.log('You must be logged in to view your messages');
    return { error: 'You must be logged in to view your messages' };
  }

  const { data, error } = await supabase
    .from('directMessages')
    .select('*')
    .or(
      `and(sender_id.eq.${receiver_id},receiver_id.eq.${userObject.data.user.id}),and(sender_id.eq.${userObject.data.user.id},receiver_id.eq.${receiver_id})`
    )
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error);
    return { error: 'Failed to fetch direct messages' };
  }

  return { messages: data };
}

export async function submitNewDirectMessage(
  formData: FormData,
  receiver_id: string
) {
  const supabase = createClient();
  const userObject = await supabase.auth.getUser();

  if (userObject.data.user === null) {
    console.log('You must be logged in to send a message');
    return { error: 'You must be logged in to send a message' };
  }

  const data = {
    message: formData.get('message') as string,
    sender_id: userObject.data.user.id as string,
    receiver_id: receiver_id,
  };

  const { error } = await supabase.from('directMessages').insert([data]);

  if (error) {
    console.error(error);
    return { error: 'Failed to send message' };
  }

  return { success: true };
}

export async function getUserNotifications(user_id: string) {
  const supabase = createClient();

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user_id)
    .eq('read', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return { error: 'Failed to fetch notifications' };
  }

  const notificationsWithUsernames = await Promise.all(
    notifications.map(async (notification) => {
      if (notification.type === 'new_message') {
        const { username } = await getUsername(notification.related_id);
        return { ...notification, username };
      }
      return notification;
    })
  );

  return { notifications: notificationsWithUsernames };
}

export async function sendNewMessageNotification(
  receiver_id: string,
  formData: FormData
) {
  const supabase = createClient();
  const userObject = await supabase.auth.getUser();

  if (userObject.data.user === null) {
    console.log('You must be logged in to send a message');
    return { error: 'You must be logged in to send a message' };
  }

  const data = {
    type: 'new_message',
    user_id: receiver_id,
    related_id: userObject.data.user.id,
    message: formData.get('message') as string,
  };

  const { error } = await supabase.from('notifications').insert([data]);

  if (error) {
    console.error(error);
    return { error: 'Failed to send notification' };
  }

  return { success: true };
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) {
    console.error(error);
    return { error: 'Failed to mark notification as read' };
  }

  return { success: true };
}

export async function markAllNotificationsAsRead(
  notifications: Notification[]
) {
  const supabase = createClient();

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .in(
      'id',
      notifications.map((notification) => notification.id)
    );

  if (error) {
    console.error(error);
    return { error: 'Failed to mark notifications as read' };
  }

  return { success: true };
}

export async function getRecentChats() {
  const supabase = createClient();
  const userObject = await supabase.auth.getUser();

  if (userObject.data.user === null) {
    console.log('You must be logged in to view your recent chats');
    return { error: 'You must be logged in to view your recent chats' };
  }

  const { data, error } = await supabase
    .from('directMessages')
    .select('*')
    .or(
      `sender_id.eq.${userObject.data.user.id},receiver_id.eq.${userObject.data.user.id}`
    );

  if (error) {
    console.error(error);
    return { error: 'Failed to fetch recent chats' };
  }

  // Process the messages to get only the newest message for each sender or receiver
  const recentChats = data.reduce((acc, message) => {
    if (!userObject.data.user) {
      return acc;
    }
    const key =
      message.sender_id === userObject.data.user.id
        ? message.receiver_id
        : message.sender_id;
    if (
      !acc[key] ||
      new Date(message.created_at) > new Date(acc[key].created_at)
    ) {
      acc[key] = message;
    }
    return acc;
  }, {});

  // Fetch user details for each unique sender or receiver
  const userIds = Object.keys(recentChats);
  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .select('id, username')
    .in('id', userIds);

  if (usersError) {
    console.error(usersError);
    return { error: 'Failed to fetch user details' };
  }

  // Combine user details with the messages
  const recentChatsWithUsernames = (
    Object.values(recentChats) as RecentChat[]
  ).map((chat: RecentChat) => {
    const user = usersData.find(
      (user) => user.id === chat.sender_id || user.id === chat.receiver_id
    );
    return {
      ...chat,
      username: user ? user.username : 'Unknown',
    };
  });

  // Sort the recent chats based on their created_at value
  recentChatsWithUsernames.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return { recentChats: recentChatsWithUsernames };
}

export async function getProfileComments(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profileComments')
    .select('*, users!profileComments_sender_id_fkey(username, avatar_url)') // test if you can get users table stuff nat join
    .eq('profile_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return { error: 'Failed to fetch profile comments' };
  }

  return { comments: data };
}

export async function submitProfileComment(
  formData: FormData,
  profileUserId: string
) {
  const supabase = createClient();
  const userObject = await supabase.auth.getUser();

  if (userObject.data.user === null) {
    console.log('You must be logged in to submit a comment');
    return { error: 'You must be logged in to submit a comment' };
  }

  const data = {
    message: formData.get('message') as string,
    profile_user_id: profileUserId,
    sender_id: userObject.data.user.id as string,
  };

  const { error } = await supabase.from('profileComments').insert([data]);

  if (error) {
    console.error(error);
    return { error: 'Failed to submit comment' };
  }
  revalidatePath(`/profile/${profileUserId}`);

  return { success: true };
}

export async function deleteProfileComment(
  commentId: string,
  profileUserId: string
) {
  const supabase = createClient();

  const { error } = await supabase
    .from('profileComments')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error(error);
    return { error: 'Failed to delete comment' };
  }

  revalidatePath(`/profile/${profileUserId}`);

  return { success: true };
}

//this will not be accurate if we give tournaments a lifetime or people delete tournaments
//keeping track of seperate attributes for each statistic would be more accurate but way more annoying to implement
//this is just a quick way to get some statistics to the profile page, can be improved later
export async function getUserStatistics(userId: string) {
  const supabase = createClient();

  //amount of tournaments user has joined
  const { data: joinedCount, error } = await supabase
    .from('tournamentUsers')
    .select('tournament_id')
    .eq('user_id', userId);

  if (error) {
    console.error(error);
    return { error: 'Failed to fetch user statistics' };
  }

  //amount of tournaments user has won
  const { data: userTournaments, error: tournamentUserError } = await supabase
    .from('tournamentUsers')
    .select('tournament_id')
    .eq('user_id', userId);
  if (tournamentUserError) {
    console.error(tournamentUserError);
    return { error: 'Failed to fetch user statistics' };
  }
  let wonCount = 0;
  for (const tournament of userTournaments) {
    const { winner } = await getTournamentWinner(tournament.tournament_id);
    if (winner?.id === userId) {
      wonCount++;
    }
  }

  // amount of matches user has won
  const { data: matchesWon, error: matchesWonError } = await supabase
    .from('singleEliminationMatches')
    .select('id')
    .eq('winner_id', userId);

  if (matchesWonError) {
    console.error(matchesWonError);
    return { error: 'Failed to fetch user statistics' };
  }

  const { data: matchesLost, error: matchesLostError } = await supabase
    .from('singleEliminationMatches')
    .select('id')
    .or(`home_player_id.eq.${userId},away_player_id.eq.${userId}`)
    .not('winner_id', 'eq', userId);

  if (matchesLostError) {
    console.error(matchesLostError);
    return { error: 'Failed to fetch user statistics' };
  }

  const statistics = {
    tournamentCount: joinedCount.length,
    wonCount: wonCount,
    matchesWon: matchesWon.length,
    matchesLost: matchesLost.length,
  };

  return { data: statistics };
}

export async function updateUserBio(bio: string) {
  const supabase = createClient();
  const userObject = await supabase.auth.getUser();

  if (userObject.data.user === null) {
    console.log('You must be logged in to update your bio');
    return { error: 'You must be logged in to update your bio' };
  }

  const { error } = await supabase
    .from('users')
    .update({ bio: bio })
    .eq('id', userObject.data.user.id);

  if (error) {
    console.error(error);
    return { error: 'Failed to update bio' };
  }
  revalidatePath(`/profile`);

  return { success: true };
}

export async function overrideMatchResult(
  tournamentId: string,
  match: SingleEliminationMatch,
  winnerId: string
) {
  const errorMsg = 'Failed to override match';
  if (!match.id) {
    return { error: errorMsg };
  }

  const final = await getTournamentFinalMatch(tournamentId);
  if (final.error || !final.finalMatch) {
    return { error: errorMsg };
  }

  const overridenPlayerId =
    winnerId === match.home_player_id
      ? match.away_player_id
      : match.home_player_id;
  if (!overridenPlayerId) {
    return { error: errorMsg };
  }

  const nextMatchesOfOverridenPlayer =
    await getPlayerFollowingMatchesInTournament(
      tournamentId,
      overridenPlayerId,
      match.round
    );
  if (!nextMatchesOfOverridenPlayer) {
    return { error: errorMsg };
  }

  const supabase = createClient();
  for (const match of nextMatchesOfOverridenPlayer) {
    const updateColumn =
      match.home_player_id === overridenPlayerId
        ? 'home_player_id'
        : 'away_player_id';

    const { error } = await supabase
      .from('singleEliminationMatches')
      .update({ [updateColumn]: null, winner_id: null })
      .eq('id', match.id);
    if (error) {
      return { error: errorMsg };
    }

    if (match.round === final.finalMatch.round) {
      const { error } = await supabase
        .from('tournaments')
        .update({ finished: false })
        .eq('id', tournamentId);
      if (error) {
        return { error: errorMsg };
      }
    }
  }

  const currentMatch = await submitMatchResult(
    tournamentId,
    match.id,
    winnerId
  );
  if (currentMatch.error || !currentMatch.success) {
    return { error: errorMsg };
  }

  revalidatePath(`/tournaments/${tournamentId}`);
  return { success: true };
}

async function getPlayerFollowingMatchesInTournament(
  tournamentId: string,
  playerId: string,
  currentMatchRound: number
) {
  const supabase = createClient();

  const { data: matches } = await supabase
    .from('singleEliminationMatches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .gt('round', currentMatchRound)
    .or(`home_player_id.eq.${playerId},away_player_id.eq.${playerId}`);

  return matches;
}

export async function getUserCurrentMatches() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return { error: 'You must be logged in to view your matches' };
  }

  const userId = data.user.id;

  const { data: matches } = await supabase
    .from('singleEliminationMatches')
    .select('*, tournaments(name)')
    .or(`home_player_id.eq.${userId},away_player_id.eq.${userId}`)
    .is('winner_id', null)
    .not('tournaments', 'is', null);

  return { matches };
}

export async function revalidateBracket(tournamentId: string) {
  revalidatePath(`/tournaments/${tournamentId}`);
}
