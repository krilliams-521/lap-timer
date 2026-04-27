import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Racer } from './types';

interface RacerContextType {
  racers: Racer[];
  addRacer: (racer: Racer) => void;
  removeRacer: (id: string) => void;
  clearRacers: () => void;
  editRacer: (id: string, updates: { name?: string; number?: string }) => void;
}

const RacerContext = createContext<RacerContextType | undefined>(undefined);

export const RacerProvider = ({ children }: { children: ReactNode }) => {
  const [racers, setRacers] = useState<Racer[]>([]);
  const [loading, setLoading] = useState(true);

  // Key for AsyncStorage
  const STORAGE_KEY = 'racers';

  // Load racers from AsyncStorage on mount
  useEffect(() => {
    const loadRacers = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setRacers(JSON.parse(stored));
        }
      } catch (e) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    loadRacers();
  }, []);

  // Save racers to AsyncStorage whenever they change
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(racers));
    }
  }, [racers, loading]);

  const addRacer = (racer: Racer) => {
    setRacers((prev) => [...prev, racer]);
  };

  const removeRacer = (id: string) => {
    setRacers((prev) => prev.filter((r) => r.id !== id));
  };

  const clearRacers = () => {
    setRacers([]);
  };

  const editRacer = (
    id: string,
    updates: { name?: string; number?: string },
  ) => {
    setRacers((prev) =>
      prev.map((racer) => (racer.id === id ? { ...racer, ...updates } : racer)),
    );
  };

  return (
    <RacerContext.Provider
      value={{ racers, addRacer, removeRacer, clearRacers, editRacer }}
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
