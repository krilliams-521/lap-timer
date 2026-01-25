import React, { createContext, ReactNode, useContext, useState } from 'react';
import { Race, Racer } from './types';

interface RaceContextType {
  race: Race | null;
  startRace: (racers: Racer[], totalLaps: number) => void;
  endRace: () => void;
  logLap: (racerId: string, time: number) => void;
  resetRace: () => void;
}

const RaceContext = createContext<RaceContextType | undefined>(undefined);

export const RaceProvider = ({ children }: { children: ReactNode }) => {
  const [race, setRace] = useState<Race | null>(null);

  const startRace = (racers: Racer[], totalLaps: number) => {
    setRace({
      racers: racers.map((r) => ({ ...r, lapTimes: [], lapsCompleted: 0 })),
      startTime: new Date(),
      endTime: null,
      totalLaps,
      leaderboard: [],
    });
  };

  const endRace = () => {
    setRace((prev) => (prev ? { ...prev, endTime: new Date() } : prev));
  };

  const logLap = (racerId: string, time: number) => {
    setRace((prev) => {
      if (!prev) return prev;
      const racers = prev.racers.map((r) =>
        r.id === racerId
          ? {
              ...r,
              lapTimes: [...r.lapTimes, time],
              lapsCompleted: r.lapsCompleted + 1,
            }
          : r,
      );
      // Leaderboard logic can be added here
      return { ...prev, racers };
    });
  };

  const resetRace = () => setRace(null);

  return (
    <RaceContext.Provider
      value={{ race, startRace, endRace, logLap, resetRace }}
    >
      {children}
    </RaceContext.Provider>
  );
};

export const useRace = () => {
  const context = useContext(RaceContext);
  if (!context) {
    throw new Error('useRace must be used within a RaceProvider');
  }
  return context;
};
