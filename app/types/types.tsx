export interface Tournament {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  max_player_count?: number;
  private: boolean;
  started: boolean;
  finished: boolean;
}

export interface singleEliminationMatch {
  id: string;
  tournament_id: string;
  round: number;
  home_player_id?: string;
  away_player_id?: string;
  home_match_id?: string;
  away_match_id?: string;
  winner_id?: string;
}
