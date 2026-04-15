export interface Racer {
  id: string;
  name: string;
  number: string;
  // All lap data is now tracked centrally in Race.laps
}

export interface Race {
  racers: Racer[];
  startTime: Date;
  endTime: Date | null;
  totalLaps: number;
  leaderboard: Racer[];
  laps: RaceLap[];
}

export interface LapResult {
  racerId: string;
  lapTime: number;
  completedAt: number; // timestamp (Date.now())
}

export interface RaceLap {
  lapNumber: number;
  results: LapResult[];
}
