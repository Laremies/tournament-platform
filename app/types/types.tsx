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
