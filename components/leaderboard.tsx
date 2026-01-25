import { StyleSheet, Text, View } from 'react-native';
import { useRace } from './race-context';

export default function Leaderboard() {
  const { race } = useRace();
  if (!race) return null;

  // Sort by lapsCompleted desc, then by total time asc
  const sorted = [...race.racers].sort((a, b) => {
    if (b.lapsCompleted !== a.lapsCompleted) {
      return b.lapsCompleted - a.lapsCompleted;
    }
    const aTime = a.lapTimes.reduce((sum, t) => sum + t, 0);
    const bTime = b.lapTimes.reduce((sum, t) => sum + t, 0);
    return aTime - bTime;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      {sorted.map((racer, idx) => (
        <View key={racer.id} style={styles.row}>
          <Text style={styles.position}>{idx + 1}.</Text>
          <Text style={styles.name}>{racer.name}</Text>
          <Text style={styles.laps}>Laps: {racer.lapsCompleted}</Text>
        </View>
      ))}
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
  position: {
    width: 28,
    fontWeight: 'bold',
    fontSize: 16,
  },
  name: {
    flex: 1,
    fontSize: 16,
  },
  laps: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },
});
