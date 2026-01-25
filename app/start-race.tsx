import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRace } from '../components/race-context';
import { useRacers } from '../components/racer-context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
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
  // Helper to format seconds as hh:mm:ss
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

  const handleLogLap = (racerId: string) => {
    const now = Date.now();
    let lapTime = 0;
    if (race && race.startTime) {
      const racer = race.racers.find((r) => r.id === racerId);
      if (racer && racer.lapTimes.length === 0) {
        lapTime = (now - new Date(race.startTime).getTime()) / 1000;
      } else if (racer && racer.lapTimes.length > 0) {
        const lastLap = racer.lapTimes.reduce((a, b) => a + b, 0);
        lapTime =
          (now - new Date(race.startTime).getTime() - lastLap * 1000) / 1000;
      }
    }
    logLap(racerId, lapTime);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start Race</Text>
      {!raceStarted ? (
        <Button title="Start Race" onPress={handleStartRace} />
      ) : (
        <>
          <Text style={styles.clock}>Race Time: {formatClock(clock)}</Text>
          <ScrollView
            style={{ width: '100%' }}
            contentContainerStyle={{ alignItems: 'center' }}
          >
            {race?.racers.map((racer) => (
              <View key={racer.id} style={styles.racerButtonRow}>
                <Button
                  title={`${racer.name} (#${racer.number})`}
                  onPress={() => handleLogLap(racer.id)}
                />
                <Text style={styles.lapInfo}>
                  Laps: {racer.lapsCompleted} | Last Lap:{' '}
                  {racer.lapTimes[racer.lapTimes.length - 1]?.toFixed(2) || '-'}
                  s
                </Text>
              </View>
            ))}
          </ScrollView>
          <View style={{ marginTop: 24 }}>
            <Button title="End Race" onPress={handleEndRace} color="red" />
          </View>
        </>
      )}
      {/* Leaderboard component will go here */}
    </View>
  );
}
