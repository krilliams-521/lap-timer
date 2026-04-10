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

      // Find the last lap timestamp for the team (any member)
      let lastLapTimestamp: number | null = null;
      // Gather all lap end timestamps for this team
      const allLapTimestamps: number[] = [];
      for (const memberId of team.members) {
        const memberLapTimes = prevTeam.racerLapTimes[memberId] || [];
        let memberLapSum = 0;
        for (const lap of memberLapTimes) {
          memberLapSum += lap;
          allLapTimestamps.push(memberLapSum);
        }
      }
      if (allLapTimestamps.length > 0) {
        // Last lap end is the max
        lastLapTimestamp = Math.max(...allLapTimestamps);
      }

      let lapDuration = 0;
      if (raceStartTime === null) {
        setRaceStartTime(timestamp);
        lapDuration = 0;
      } else if (allLapTimestamps.length === 0) {
        // First lap for the team: time since race start
        lapDuration = timestamp - raceStartTime;
      } else {
        // Subsequent laps: time since last lap by any teammate
        lapDuration = timestamp - (raceStartTime + lastLapTimestamp!);
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
