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
    racerLapTimes: { [racerId: string]: number[] };
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
      // Calculate lap duration
      let lapDuration = 0;
      if (raceStartTime === null) {
        setRaceStartTime(timestamp);
        lapDuration = 0;
      } else if (racerLapTimes.length === 0) {
        lapDuration = timestamp - raceStartTime;
      } else {
        // Sum previous lap durations to get last lap's end
        const prevLapSum = racerLapTimes.reduce((a, b) => a + b, 0);
        lapDuration = timestamp - raceStartTime - prevLapSum;
      }
      const newLapTimes = [...racerLapTimes, lapDuration];
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
