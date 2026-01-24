import React, { createContext, ReactNode, useContext, useState } from 'react';
import { Racer } from './types';

interface RacerContextType {
  racers: Racer[];
  addRacer: (racer: Racer) => void;
  removeRacer: (id: string) => void;
  clearRacers: () => void;
}

const RacerContext = createContext<RacerContextType | undefined>(undefined);

export const RacerProvider = ({ children }: { children: ReactNode }) => {
  const [racers, setRacers] = useState<Racer[]>([]);

  const addRacer = (racer: Racer) => {
    setRacers((prev) => [...prev, racer]);
  };

  const removeRacer = (id: string) => {
    setRacers((prev) => prev.filter((r) => r.id !== id));
  };

  const clearRacers = () => {
    setRacers([]);
  };

  return (
    <RacerContext.Provider
      value={{ racers, addRacer, removeRacer, clearRacers }}
    >
      {children}
    </RacerContext.Provider>
  );
};

export const useRacers = () => {
  const context = useContext(RacerContext);
  if (!context) {
    throw new Error('useRacers must be used within a RacerProvider');
  }
  return context;
};
