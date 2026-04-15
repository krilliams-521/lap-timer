import { useRouter } from 'expo-router';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRace } from './race-context';

export default function Leaderboard() {
  const { race } = useRace();
  const router = useRouter();
  if (!race || !race.endTime) return null;

  // Compute lapsCompleted and lapTimes for each racer from race.laps
  const racerStats = race.racers.map((racer) => {
    // Get all lap results for this racer, sorted by lap
    const lapResults = (race.laps || [])
      .map((lap) => {
        const res = lap.results.find((r) => r.racerId === racer.id);
        return res ? { lapNumber: lap.lapNumber, ...res } : undefined;
      })
      .filter(
        (
          r,
        ): r is {
          lapNumber: number;
          racerId: string;
          lapTime: number;
          completedAt: number;
        } => r !== undefined,
      );
    const lapsCompleted = lapResults.length;
    const lapTimes = lapResults.map((res) => res.lapTime);
    const totalTime = lapTimes.reduce((sum, t) => sum + t, 0);
    return { ...racer, lapsCompleted, lapTimes, totalTime };
  });

  // Sort by lapsCompleted desc, then by total time asc
  const sorted = racerStats.sort((a, b) => {
    if (b.lapsCompleted !== a.lapsCompleted) {
      return b.lapsCompleted - a.lapsCompleted;
    }
    return a.totalTime - b.totalTime;
  });

  // Helper to format lap time in mm:ss.SSS
  const formatLap = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = ((ms % 60000) / 1000).toFixed(3);
    return `${min}:${sec.padStart(6, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Final Results</Text>
      <ScrollView
        style={{ maxHeight: 400, width: '100%' }}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 8 }}
      >
        {sorted.map((racer, idx) => (
          <View key={racer.id} style={styles.finalRow}>
            <Text style={styles.position}>{idx + 1}.</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{racer.name}</Text>
              <Text style={styles.laps}>Laps: {racer.lapsCompleted}</Text>
              <View style={styles.lapTimesRow}>
                {racer.lapTimes.map((lap, i) => (
                  <Text key={i} style={styles.lapTime}>
                    Lap {i + 1}: {formatLap(lap)}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={{ marginTop: 24 }}>
        <Button
          title="Back to Race"
          onPress={() => router.replace('/start-race')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 32,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  finalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    width: '100%',
  },
  lapTimesRow: {
    flexDirection: 'column',
    marginTop: 4,
  },
  lapTime: {
    fontSize: 13,
    color: '#888',
  },
  position: {
    width: 28,
    fontWeight: 'bold',
    fontSize: 16,
  },
  name: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  laps: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },
});
