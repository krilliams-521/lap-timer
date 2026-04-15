import React, { createContext, useContext, useState } from 'react';
import { useRacers } from './racer-context';

interface Team {
  id: string;
  members: string[]; // racer ids
}

interface TeamLapData {
  [teamId: string]: {
    laps: number;
    totalTime: number;
    racerLapTimes: {
      [racerId: string]: { lapTime: number; completedAt: number }[];
    };
  };
}

interface TeamRaceContextType {
  teams: Team[];
  racers: any[];
  setTeams: (teams: Team[]) => void;
  logLap: (teamIdx: number, racerIdx: number, timestamp: number) => void;
  currentTeamIndex: number;
  currentRacerIndex: number;
  teamLapData: TeamLapData;
  isRaceFinished: boolean;
  setIsRaceFinished?: React.Dispatch<React.SetStateAction<boolean>>;
  resetTeamRace: () => void;
  raceStartTime: number | null;
  setRaceStartTime: React.Dispatch<React.SetStateAction<number | null>>;
}

const TeamRaceContext = createContext<TeamRaceContextType | undefined>(
  undefined,
);

export const TeamRaceContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { racers } = useRacers();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamLapData, setTeamLapData] = useState<TeamLapData>({});
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [currentRacerIndex, setCurrentRacerIndex] = useState(0);
  const [isRaceFinished, setIsRaceFinished] = useState(false);

  // Track race start time for lap duration calculation
  const [raceStartTime, setRaceStartTime] = useState<number | null>(null);

  const logLap = (teamIdx: number, racerIdx: number, timestamp: number) => {
    const team = teams[teamIdx];
    if (!team) return;
    const racerId = team.members[racerIdx];
    setTeamLapData((prev) => {
      const prevTeam = prev[team.id] || {
        laps: 0,
        totalTime: 0,
        racerLapTimes: {},
      };
      const racerLapTimes = prevTeam.racerLapTimes[racerId] || [];

      // Calculate lap time for this racer
      let lapDuration = 0;
      let newRaceStartTime = raceStartTime;
      if (raceStartTime === null) {
        newRaceStartTime = timestamp;
        setRaceStartTime(timestamp);
      }
      if (racerLapTimes.length === 0) {
        // First lap for this racer: time since race start
        lapDuration = timestamp - (newRaceStartTime ?? timestamp);
      } else {
        // Subsequent laps: time since last lap for this racer
        const lastLapCompletedAt =
          (newRaceStartTime ?? timestamp) +
          racerLapTimes.reduce((sum, t) => sum + (t.lapTime ?? 0), 0);
        lapDuration = timestamp - lastLapCompletedAt;
      }

      // Only add positive lap times
      const newLapTimes =
        lapDuration > 0
          ? [...racerLapTimes, { lapTime: lapDuration, completedAt: timestamp }]
          : [...racerLapTimes];
      const newLaps = prevTeam.laps + 1;
      // For demo, just increment totalTime by 1 per lap
      const newTotalTime = prevTeam.totalTime + 1;
      const updated = {
        ...prev,
        [team.id]: {
          laps: newLaps,
          totalTime: newTotalTime,
          racerLapTimes: {
            ...prevTeam.racerLapTimes,
            [racerId]: newLapTimes,
          },
        },
      };
      // For demo, finish after 10 laps per team
      if (Object.values(updated).every((d) => d.laps >= 10)) {
        setIsRaceFinished(true);
      }
      return updated;
    });
  };

  const resetTeamRace = () => {
    setTeams([]);
    setTeamLapData({});
    setCurrentTeamIndex(0);
    setCurrentRacerIndex(0);
    setIsRaceFinished(false);
    setRaceStartTime(null);
  };

  return (
    <TeamRaceContext.Provider
      value={{
        teams,
        racers,
        setTeams,
        logLap,
        currentTeamIndex,
        currentRacerIndex,
        teamLapData,
        isRaceFinished,
        setIsRaceFinished,
        resetTeamRace,
        raceStartTime,
        setRaceStartTime,
      }}
    >
      {children}
    </TeamRaceContext.Provider>
  );
};

export function useTeamRace() {
  const ctx = useContext(TeamRaceContext);
  if (!ctx)
    throw new Error('useTeamRace must be used within TeamRaceContextProvider');
  return ctx;
}
