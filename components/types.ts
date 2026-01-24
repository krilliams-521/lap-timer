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
