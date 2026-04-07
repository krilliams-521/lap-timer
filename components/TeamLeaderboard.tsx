import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTeamRace } from './team-race-context';

const styles = StyleSheet.create({
  leaderboard: { marginTop: 24 },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  teamLabel: { fontWeight: 'bold' },
  lap: { marginLeft: 8 },
});

export default function TeamLeaderboard() {
  const { teams, teamLapData, racers } = useTeamRace();
  // Sort teams by laps, then totalTime
  const sorted = [...teams].sort((a, b) => {
    const aData = teamLapData[a.id] || { laps: 0, totalTime: 0 };
    const bData = teamLapData[b.id] || { laps: 0, totalTime: 0 };
    if (bData.laps !== aData.laps) return bData.laps - aData.laps;
    return aData.totalTime - bData.totalTime;
  });
  return (
    <View style={styles.leaderboard}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>
        Team Leaderboard
      </Text>
      {sorted.map((team, idx) => {
        const data = teamLapData[team.id] || {
          laps: 0,
          totalTime: 0,
          racerLapTimes: {},
        };
        return (
          <View key={team.id} style={styles.teamRow}>
            <Text style={styles.teamLabel}>Team {idx + 1}</Text>
            <Text style={styles.lap}>
              Laps: {data.laps} | Time: {data.totalTime}
            </Text>
            <Text style={styles.lap}>
              {team.members
                .map((id) => {
                  const racer = racers.find((r) => r.id === id);
                  return racer ? `${racer.name} (#${racer.number})` : '';
                })
                .join(' & ')}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
