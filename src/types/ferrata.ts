export interface Ferrata {
  id: string;
  name: string;
  country: string;
  region: string;
  difficulty: string;
  description: string;
  difficultyRank: number;
  lengthM: number;
  elevationGainM?: number;
  latitude?: number;
  longitude?: number;
  sourceUrl: string;
}
