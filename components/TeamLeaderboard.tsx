import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTeamRace } from './team-race-context';

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
  position: {
    width: 28,
    fontWeight: 'bold',
    fontSize: 16,
  },
  teamLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
    marginRight: 8,
  },
  laps: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
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
  lapTimesRow: {
    flexDirection: 'column',
    marginTop: 4,
  },
  lapTime: {
    fontSize: 13,
    color: '#888',
  },
});

export default function TeamLeaderboard() {
  const { teams, teamLapData, racers } = useTeamRace();
  // Helper to format lap time in mm:ss.SSS
  const formatLap = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = ((ms % 60000) / 1000).toFixed(3);
    return `${min}:${sec.padStart(6, '0')}`;
  };

  // Calculate real total time for each team
  const getTeamTotalTime = (teamId: string) => {
    const data = teamLapData[teamId];
    if (!data) return 0;
    return Object.values(data.racerLapTimes || {})
      .flat()
      .reduce((a, b) => a + b, 0);
  };

  // Sort teams by laps, then by real total time
  const sorted = [...teams].sort((a, b) => {
    const aData = teamLapData[a.id] || { laps: 0 };
    const bData = teamLapData[b.id] || { laps: 0 };
    if (bData.laps !== aData.laps) return bData.laps - aData.laps;
    return getTeamTotalTime(a.id) - getTeamTotalTime(b.id);
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Final Team Results</Text>
      {sorted.map((team, idx) => {
        const data = teamLapData[team.id] || {
          laps: 0,
          totalTime: 0,
          racerLapTimes: {},
        };
        // Find the original team number (1-based)
        const teamNumber = teams.findIndex((t) => t.id === team.id) + 1;
        const teamTotalTime = getTeamTotalTime(team.id);
        return (
          <View key={team.id} style={styles.teamBlock}>
            <View style={styles.teamHeader}>
              <Text style={styles.position}>{idx + 1}.</Text>
              <Text style={styles.teamLabel}>Team {teamNumber}</Text>
              <Text style={styles.laps}>Laps: {data.laps}</Text>
              <Text style={styles.laps}>Time: {formatLap(teamTotalTime)}</Text>
            </View>
            <Text style={styles.memberNames}>
              {team.members
                .map((id) => {
                  const racer = racers.find((r) => r.id === id);
                  return racer ? `${racer.name} (#${racer.number})` : '';
                })
                .join(' & ')}
            </Text>
            {team.members.map((id) => {
              const racer = racers.find((r) => r.id === id);
              const lapTimes = data.racerLapTimes?.[id] || [];
              if (!racer) return null;
              return (
                <View key={id} style={styles.racerBlock}>
                  <Text style={styles.racerName}>
                    {racer.name} (#{racer.number})
                  </Text>
                  <View style={styles.lapTimesRow}>
                    {lapTimes.length === 0 ? (
                      <Text style={styles.lapTime}>No laps</Text>
                    ) : (
                      lapTimes.map((lap, i) => (
                        <Text key={i} style={styles.lapTime}>
                          Lap {i + 1}: {formatLap(lap)}
                        </Text>
                      ))
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}
