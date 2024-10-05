'use server';
import { createClient } from '@/utils/supabase/server';
import { SingleEliminationMatch } from '@/app/types/types';

//DISCLAIMER! THIS CODE WILL BE REFACTORED AND REDONE IN THE FUTURE
export const generateSingleEliminationBracket = async (
  //generates the matchups for a single elimination bracket tournament
  tournamentId: string
) => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: 'User not authenticated',
    };
  }

  const tournament = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();

  if (tournament.data.creator_id !== user.id) {
    return {
      error: 'User not authorized to generate bracket for this tournament',
    };
  }

  const { data: tournamentPlayers } = await supabase
    .from('tournamentUsers')
    .select('*')
    .eq('tournament_id', tournamentId);

  if (!tournamentPlayers) {
    return {
      error: 'No players found for this tournament',
    };
  }

  if (tournamentPlayers.length < 2) {
    return {
      error: 'Tournament must have at least 2 players to generate bracket',
    };
  }

  const numPlayers = tournamentPlayers.length;
  const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(numPlayers)));
  const numByes = nextPowerOfTwo - numPlayers;

  shuffleArray(tournamentPlayers);
  //TODO: wrap this in a try block? and delete all matches if error occurs

  let currentRound = 1;
  const matches: SingleEliminationMatch[] = [];
  const byeMatches = [];

  //byes are players who get a free pass to the next round
  for (let i = 0; i < numByes; i++) {
    const homePlayer = tournamentPlayers[i] || null;
    byeMatches.push({
      tournament_id: tournamentId,
      home_player_id: homePlayer ? homePlayer.user_id : null,
      round: currentRound,
      winner_id: homePlayer ? homePlayer.user_id : null,
    });
  }

  for (let i = numByes; i < numPlayers; i += 2) {
    const homePlayer = tournamentPlayers[i] || null;
    const awayPlayer = tournamentPlayers[i + 1] || null;
    matches.push({
      tournament_id: tournamentId,
      home_player_id: homePlayer ? homePlayer.user_id : null,
      away_player_id: awayPlayer ? awayPlayer.user_id : null,
      round: currentRound,
    });
  }

  // Insert first round matches into the database
  //bye matches are not sent to the database
  let prevRoundMatches = [];
  for (const match of matches) {
    const { data, error } = await createClient()
      .from('singleEliminationMatches')
      .insert([match])
      .select();

    if (error) {
      return { error: 'Error inserting match' };
    }

    prevRoundMatches.push(...data);
  }
  prevRoundMatches.push(...byeMatches);
  shuffleArray(prevRoundMatches);

  // Generate the rest of the rounds
 while (
  prevRoundMatches.length > 1 &&
  currentRound < Math.log2(nextPowerOfTwo)
) {
  currentRound++;
  const nextRoundMatches = [];

  for (let i = 0; i < prevRoundMatches.length; i += 2) {
    const homeMatch: SingleEliminationMatch = prevRoundMatches[i] || null;
    const awayMatch: SingleEliminationMatch = prevRoundMatches[i + 1] || null;

    const isRound2 = currentRound === 2;
    const homeMatchExists = homeMatch && homeMatch.id;
    const awayMatchExists = awayMatch && awayMatch.id;

    if (isRound2) {
      if (!homeMatchExists && awayMatchExists) {
        // Home match is a bye
        nextRoundMatches.push({
          tournament_id: tournamentId,
          home_player_id: homeMatch.winner_id,
          away_matchup_id: awayMatch.id,
          round: currentRound,
        });
      } else if (!awayMatchExists && homeMatchExists) {
        // Away match is a bye
        nextRoundMatches.push({
          tournament_id: tournamentId,
          away_player_id: awayMatch.winner_id,
          home_matchup_id: homeMatch.id,
          round: currentRound,
        });
      } else if (!homeMatchExists && !awayMatchExists) {
        // Both are bye matches
        nextRoundMatches.push({
          tournament_id: tournamentId,
          home_player_id: homeMatch.winner_id,
          away_player_id: awayMatch.winner_id,
          round: currentRound,
        });
      } else {
        // Both are regular matches
        nextRoundMatches.push({
          tournament_id: tournamentId,
          home_matchup_id: homeMatch.id,
          away_matchup_id: awayMatch.id,
          round: currentRound,
        });
      }
    } else {
      // For rounds other than round 2
      nextRoundMatches.push({
        tournament_id: tournamentId,
        home_matchup_id: homeMatch.id,
        away_matchup_id: awayMatch.id,
        round: currentRound,
      });
    }
  }
    prevRoundMatches = [];
    for (const match of nextRoundMatches) {
      const { data, error } = await createClient()
        .from('singleEliminationMatches')
        .insert([match])
        .select();

      if (error) {
        console.error('Error inserting match:', error);
        return { error: 'Error inserting match' };
      }

      prevRoundMatches.push(...data);
    }
  }
  return { success: true };
};

function shuffleArray(array: unknown[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
