import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { Race, Racer } from './types';

interface RaceContextType {
  race: Race | null;
  startRace: (racers: Racer[], totalLaps: number) => void;
  endRace: () => void;
  logLap: (racerId: string, lapTime: number) => void;
  resetRace: () => void;
}

const RaceContext = createContext<RaceContextType | undefined>(undefined);

export const RaceProvider = ({ children }: { children: ReactNode }) => {
  const [race, setRace] = useState<Race | null>(null);

  const startRace = (racers: Racer[], totalLaps: number) => {
    setRace({
      racers,
      startTime: new Date(),
      endTime: null,
      totalLaps,
      leaderboard: [],
      laps: [
        {
          lapNumber: 1,
          results: [],
        },
      ],
    });
  };

  const endRace = async () => {
    setRace((prev) => {
      if (!prev) return prev;
      const finishedRace = { ...prev, endTime: new Date() };
      // Save to AsyncStorage
      saveRaceResult(finishedRace);
      // Clear context after saving
      setTimeout(() => setRace(null), 100);
      return finishedRace;
    });
  };

  // Save finished race to AsyncStorage
  const saveRaceResult = async (race: Race) => {
    try {
      const STORAGE_KEY = 'previous_race_results';
      const existing = await AsyncStorage.getItem(STORAGE_KEY);
      let results = [];
      if (existing) {
        results = JSON.parse(existing);
      }
      // Add date for display
      const raceWithDate = { ...race, date: new Date().toLocaleString() };
      results.push(raceWithDate);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    } catch (e) {
      // Optionally handle error
    }
  };

  const logLap = (racerId: string, lapTime: number) => {
    setRace((prev) => {
      if (!prev) return prev;
      const now = Date.now();
      let laps = [...(prev.laps || [])];
      // Find the current lap (the first with results not including this racer, or the last lap)
      let currentLapIdx = laps.findIndex(
        (lap) => !lap.results.some((res) => res.racerId === racerId),
      );
      if (currentLapIdx === -1) currentLapIdx = laps.length - 1;
      // If all racers have completed the current lap, start a new lap
      const currentLap = laps[currentLapIdx];
      if (
        currentLap &&
        currentLap.results.length === prev.racers.length - 1 &&
        !currentLap.results.some((res) => res.racerId === racerId)
      ) {
        // All other racers have finished this lap, so add a new lap
        laps.push({
          lapNumber: laps.length + 1,
          results: [],
        });
        currentLapIdx = laps.length - 1;
      }
      // Add the lap result
      laps[currentLapIdx] = {
        ...laps[currentLapIdx],
        results: [
          ...laps[currentLapIdx].results,
          { racerId, lapTime, completedAt: now },
        ],
      };
      return { ...prev, laps };
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
