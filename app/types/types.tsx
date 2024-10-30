export interface Tournament {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  max_player_count?: number;
  private: boolean;
  started: boolean;
  finished: boolean;
  player_count: number;
}

export interface SingleEliminationMatch {
  homePlayerUsername?: string;
  awayPlayerUsername?: string;
  id?: string;
  tournament_id: string;
  round: number;
  home_player_id?: string;
  away_player_id?: string;
  home_matchup_id?: string;
  away_matchup_id?: string;
  awayPlayerAvatarUrl?: string;
  homePlayerAvatarUrl?: string;
  winner_id?: string;
}

export interface TournamentPlayer {
  id: string;
  tournament_id: string;
  role: string;
  user_id: string;
  users: {
    username: string;
    avatar_url?: string;
  };
}

export interface PublicUser {
  id: string;
  username: string;
  avatar_url: string;
  description?: string;
  tournaments_won_amount: number;
  tournaments_participated_amount: number;
  matches_won_amount: number;
  matches_lost_amount: number;
}
