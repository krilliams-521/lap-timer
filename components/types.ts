// Shared types for the Lap Timer app

/**
 * Represents a single racer in a race.
 */
export interface Racer {
  id: string;
  name: string;
  number: string;
  lapTimes: number[];
  lapsCompleted: number;
}

/**
 * Represents a race session.
 */
export interface Race {
  racers: Racer[];
  startTime: Date;
  endTime: Date | null;
  totalLaps: number;
  leaderboard: Racer[];
}
