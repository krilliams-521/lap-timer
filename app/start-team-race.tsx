import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import LapLogger from '../components/LapLogger';
import { useTeamRace } from '../components/team-race-context';
import TeamLeaderboard from '../components/TeamLeaderboard';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingTop: 64,
    paddingBottom: 36,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
  },
  clock: {
    fontSize: 20,
    marginBottom: 24,
    fontWeight: 'bold',
  },
});

export default function StartTeamRaceScreenInner() {
  const router = useRouter();
  const {
    teams,
    racers,
    logLap,
    // currentTeamIndex,
    isRaceFinished,
  } = useTeamRace();
  const [raceStarted, setRaceStarted] = useState(false);
  const [clock, setClock] = useState(0);
  const [logByNumber, setLogByNumber] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (raceStarted && !isRaceFinished) {
      timerRef.current = setInterval(() => {
        setClock((prev) => prev + 1);
      }, 1000) as unknown as number;
    } else {
      setClock(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [raceStarted, isRaceFinished]);

  if (!teams || teams.length === 0) {
    return <Text>No teams found. Please assign teams first.</Text>;
  }

  const formatClock = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
      .map((v) => v.toString().padStart(2, '0'))
      .join(':');
  };

  const handleStartRace = () => {
    setRaceStarted(true);
  };

  const handleEndRace = () => {
    setRaceStarted(false);
  };

  const handleLogLap = (racerId: string) => {
    // Find the team and racer indices for the given racerId
    const teamIdx = teams.findIndex((team) => team.members.includes(racerId));
    if (teamIdx === -1) return;
    const racerIdx = teams[teamIdx].members.findIndex((id) => id === racerId);
    if (racerIdx === -1) return;
    logLap(teamIdx, racerIdx, Date.now());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Team Race</Text>
      {!raceStarted ? (
        <Button title="Start Race" onPress={handleStartRace} />
      ) : (
        <>
          <Text style={styles.clock}>Race Time: {formatClock(clock)}</Text>
          <LapLogger
            mode="team"
            racers={racers}
            onTeamLogLap={handleLogLap}
            raceStarted={raceStarted && !isRaceFinished}
            logByNumber={logByNumber}
            setLogByNumber={setLogByNumber}
          />
          <View style={{ marginTop: 24 }}>
            <Button title="End Race" onPress={handleEndRace} color="red" />
          </View>
        </>
      )}
      <TeamLeaderboard />
      <View style={{ marginTop: 24 }}>
        <Button
          title="Back to Add Racers"
          onPress={() => router.replace('/add-racer')}
        />
      </View>
    </View>
  );
}
