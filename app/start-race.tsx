import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import LapLogger from '../components/LapLogger';
import Leaderboard from '../components/leaderboard';
import { useRace } from '../components/race-context';
import { useRacers } from '../components/racer-context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingTop: 64,
    paddingBottom: 36,
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
  racerButtonRow: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },
  lapInfo: {
    marginTop: 4,
    fontSize: 14,
    color: '#555',
  },
});

export default function StartRaceScreen() {
  const router = useRouter();

  const formatClock = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
      .map((v) => v.toString().padStart(2, '0'))
      .join(':');
  };
  const { racers } = useRacers();
  const { race, startRace, logLap, endRace } = useRace();
  const [raceStarted, setRaceStarted] = useState(false);
  const [clock, setClock] = useState(0);
  const [logByNumber, setLogByNumber] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (raceStarted) {
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
  }, [raceStarted]);

  const handleStartRace = () => {
    startRace(racers, 0); // 0 for unlimited laps for now
    setRaceStarted(true);
  };

  const handleEndRace = () => {
    Alert.alert('End Race', 'Are you sure you want to end the race?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Race',
        style: 'destructive',
        onPress: () => {
          endRace();
          setRaceStarted(false);
        },
      },
    ]);
  };

  // Helper to calculate lap time for a racer
  const getLapTime = (racerId: string) => {
    const now = Date.now();
    if (!race || !race.startTime) return 0;
    const allLapResults = (race.laps || [])
      .flatMap((lap) => lap.results)
      .filter((res) => res.racerId === racerId)
      .sort((a, b) => a.completedAt - b.completedAt);
    let lastLapCompletedAt = new Date(race.startTime).getTime();
    if (allLapResults.length > 0) {
      lastLapCompletedAt = allLapResults[allLapResults.length - 1].completedAt;
    }
    return now - lastLapCompletedAt;
  };

  const handleLogLap = (racerId: string, lapTime?: number) => {
    // If lapTime is provided (from LapLogger), use it; otherwise, calculate
    const time = typeof lapTime === 'number' ? lapTime : getLapTime(racerId);
    logLap(racerId, time);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start Race</Text>
      {!raceStarted ? (
        <Button title="Start Race" onPress={handleStartRace} />
      ) : (
        <>
          <Text style={styles.clock}>Race Time: {formatClock(clock)}</Text>
          <LapLogger
            mode="individual"
            racers={racers}
            onLogLap={handleLogLap}
            raceStarted={raceStarted}
            logByNumber={logByNumber}
            setLogByNumber={setLogByNumber}
            getLapTime={getLapTime}
          />
          <View style={{ marginTop: 24 }}>
            <Button title="End Race" onPress={handleEndRace} color="red" />
          </View>
        </>
      )}
      <Leaderboard />
      <View style={{ marginTop: 24 }}>
        <Button
          title="Back to Add Racers"
          onPress={() => router.replace('/add-racer')}
        />
      </View>
    </View>
  );
}
