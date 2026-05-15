import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import * as Clipboard from 'expo-clipboard';

const STORAGE_KEY = 'previous_race_results';

export default function PreviousResultsDetailScreen() {
  const { index } = useLocalSearchParams();
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (data) {
          const results = JSON.parse(data);
          const res = results[Number(index)];
          setResult(res);
        }
      } catch (e) {
        setResult(null);
      }
    };
    fetchResult();
  }, [index]);

  // CSV export logic
  const generateCSV = () => {
    // Individual race
    if (!result?.type) {
      let csv = 'Order,Racer,Lap #,Lap Time,Total Time\n';
      const racerStats = result.racers.map((racer: any) => {
        const lapResults = (result.laps || [])
          .map((lap: any) => {
            const res = lap.results.find((r: any) => r.racerId === racer.id);
            return res ? { lapNumber: lap.lapNumber, ...res } : undefined;
          })
          .filter((r: any) => r !== undefined);
        const lapsCompleted = lapResults.length;
        const lapTimes = lapResults.map((res: any) => res.lapTime);
        const totalTime = lapTimes.reduce(
          (sum: number, t: number) => sum + t,
          0,
        );
        return { ...racer, lapsCompleted, lapTimes, totalTime, lapResults };
      });
      const sorted = racerStats.sort((a: any, b: any) => {
        if (b.lapsCompleted !== a.lapsCompleted) {
          return b.lapsCompleted - a.lapsCompleted;
        }
        return a.totalTime - b.totalTime;
      });
      let order = 1;
      sorted.forEach((racer: any) => {
        racer.lapResults.forEach((lap: any, i: number) => {
          csv += `${order},${racer.name},${lap.lapNumber},${formatLap(lap.lapTime)},${i === racer.lapResults.length - 1 ? formatLap(racer.totalTime) : ''}\n`;
        });
        order++;
      });
      return csv;
    }
    // Team race
    let csv = 'Order,Team,Member,Lap #,Lap Time,Completed At\n';
    let allLaps: any[] = [];
    result.teams.forEach((team: any, teamIdx: number) => {
      const data = result.teamLapData[team.id] || { racerLapTimes: {} };
      team.members.forEach((racerId: string) => {
        const racer = (result.racers || []).find((r: any) => r.id === racerId);
        const laps = (data.racerLapTimes?.[racerId] || []).map(
          (lap: { lapTime: number; completedAt: number }, i: number) => ({
            team: `Team ${teamIdx + 1}`,
            member: `${racer ? racer.name : ''} (#${racer ? racer.number : ''})`,
            lapNumber: i + 1,
            lapTime: lap.lapTime,
            completedAt: lap.completedAt,
          }),
        );
        allLaps.push(...laps);
      });
    });
    allLaps.sort((a, b) => a.completedAt - b.completedAt);
    allLaps.forEach((lap, idx) => {
      csv += `${idx + 1},${lap.team},${lap.member},${lap.lapNumber},${formatLap(lap.lapTime)},${lap.completedAt}\n`;
    });
    return csv;
  };

  const handlePreviewCSV = () => {
    const csv = generateCSV();
    Alert.alert(
      'CSV Preview',
      csv.length > 1000 ? csv.slice(0, 1000) + '\n...truncated...' : csv,
    );
  };

  const handleCopyCSV = async () => {
    const csv = generateCSV();
    await Clipboard.setStringAsync(csv);
    Alert.alert('Copied', 'CSV data copied to clipboard!');
  };

  if (!result) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Race Details</Text>
        <Text>Result not found.</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Text style={styles.closeButtonText}>Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Helper to format lap time in mm:ss.SSS
  function formatLap(ms: number) {
    const min = Math.floor(ms / 60000);
    const sec = ((ms % 60000) / 1000).toFixed(3);
    return `${min}:${sec.padStart(6, '0')}`;
  }

  // INDIVIDUAL RACE LEADERBOARD
  if (!result.type) {
    // Compute lapsCompleted and lapTimes for each racer from result.laps
    const racerStats = result.racers.map((racer: any) => {
      const lapResults = (result.laps || [])
        .map((lap: any) => {
          const res = lap.results.find((r: any) => r.racerId === racer.id);
          return res ? { lapNumber: lap.lapNumber, ...res } : undefined;
        })
        .filter((r: any) => r !== undefined);
      const lapsCompleted = lapResults.length;
      const lapTimes = lapResults.map((res: any) => res.lapTime);
      const totalTime = lapTimes.reduce((sum: number, t: number) => sum + t, 0);
      return { ...racer, lapsCompleted, lapTimes, totalTime };
    });
    const sorted = racerStats.sort((a: any, b: any) => {
      if (b.lapsCompleted !== a.lapsCompleted) {
        return b.lapsCompleted - a.lapsCompleted;
      }
      return a.totalTime - b.totalTime;
    });
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={{ alignItems: 'center', paddingBottom: 24 }}
        >
          <Text style={styles.title}>Final Results</Text>
          {result.startTime && (
            <Text style={styles.label}>
              Start Time:{' '}
              <Text style={styles.value}>
                {new Date(result.startTime).toLocaleString()}
              </Text>
            </Text>
          )}
          {result.endTime && (
            <Text style={styles.label}>
              End Time:{' '}
              <Text style={styles.value}>
                {new Date(result.endTime).toLocaleString()}
              </Text>
            </Text>
          )}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: 8,
            }}
          >
            <Button title="Preview CSV" onPress={handlePreviewCSV} />
            <View style={{ width: 8 }} />
            <Button title="Copy CSV to Clipboard" onPress={handleCopyCSV} />
          </View>
          {sorted.map((racer: any, idx: number) => (
            <View key={racer.id} style={styles.finalRow}>
              <Text style={styles.position}>{idx + 1}.</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{racer.name}</Text>
                <Text style={styles.laps}>Laps: {racer.lapsCompleted}</Text>
                <View style={styles.lapTimesRow}>
                  {racer.lapTimes.map((lap: number, i: number) => (
                    <Text key={i} style={styles.lapTime}>
                      Lap {i + 1}: {formatLap(lap)}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.closeButtonText}>Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // TEAM RACE LEADERBOARD
  // Helper to get total time for a team
  const getTeamTotalTime = (teamId: string) => {
    const data = result.teamLapData[teamId];
    if (!data) return 0;
    return Object.values(data.racerLapTimes || {})
      .flat()
      .reduce((a: number, b: any) => a + (b.lapTime ?? 0), 0);
  };
  const sortedTeams = [...result.teams].sort((a: any, b: any) => {
    const aData = result.teamLapData[a.id] || { laps: 0 };
    const bData = result.teamLapData[b.id] || { laps: 0 };
    if (bData.laps !== aData.laps) return bData.laps - aData.laps;
    return getTeamTotalTime(a.id) - getTeamTotalTime(b.id);
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 24 }}
      >
        <Text style={styles.title}>Final Team Results</Text>
        {result.startTime && (
          <Text style={styles.label}>
            Start Time:{' '}
            <Text style={styles.value}>
              {new Date(result.startTime).toLocaleString()}
            </Text>
          </Text>
        )}
        {result.endTime && (
          <Text style={styles.label}>
            End Time:{' '}
            <Text style={styles.value}>
              {new Date(result.endTime).toLocaleString()}
            </Text>
          </Text>
        )}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 8,
          }}
        >
          <Button title="Preview CSV" onPress={handlePreviewCSV} />
          <View style={{ width: 8 }} />
          <Button title="Copy CSV to Clipboard" onPress={handleCopyCSV} />
        </View>
        {sortedTeams.map((team: any, idx: number) => {
          const data = result.teamLapData[team.id] || {
            laps: 0,
            totalTime: 0,
            racerLapTimes: {},
          };
          const teamNumber =
            result.teams.findIndex((t: any) => t.id === team.id) + 1;
          const teamTotalTime = getTeamTotalTime(team.id);
          return (
            <View key={team.id} style={styles.teamBlock}>
              <View style={styles.teamHeader}>
                <Text style={styles.position}>{idx + 1}.</Text>
                <Text style={styles.teamLabel}>Team {teamNumber}</Text>
                <Text style={styles.laps}>Laps: {data.laps}</Text>
                <Text style={styles.laps}>
                  Time: {formatLap(teamTotalTime)}
                </Text>
              </View>
              <Text style={styles.memberNames}>
                {team.members
                  .map((id: string) => {
                    const racer = (result.racers || []).find(
                      (r: any) => r.id === id,
                    );
                    return racer ? `${racer.name} (#${racer.number})` : id;
                  })
                  .join(' & ')}
              </Text>
              {team.members.map((id: string) => {
                const racer = (result.racers || []).find(
                  (r: any) => r.id === id,
                );
                const lapTimes = (data.racerLapTimes?.[id] || []).filter(
                  (lap: { lapTime: number; completedAt: number }) =>
                    lap.lapTime >= 0,
                );
                return (
                  <View key={id} style={styles.racerBlock}>
                    <Text style={styles.racerName}>
                      {racer ? `${racer.name} (#${racer.number})` : id}
                    </Text>
                    <View style={styles.lapTimesRow}>
                      {lapTimes.map((lap: any, i: number) => (
                        <Text key={i} style={styles.lapTime}>
                          Lap {i + 1}: {formatLap(lap.lapTime)}
                        </Text>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Text style={styles.closeButtonText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 16,
  },
  value: {
    marginBottom: 8,
  },
  teamBox: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#f6f6f6',
    borderRadius: 8,
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
  teamBlock: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
    marginRight: 8,
  },
  memberNames: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
  },
  racerBlock: {
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 8,
  },
  racerName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  teamTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  closeButton: {
    marginTop: 24,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
