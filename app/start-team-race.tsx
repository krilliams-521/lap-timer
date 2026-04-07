import React, { useState } from 'react';
import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useTeamRace } from '../components/team-race-context';
import TeamLeaderboard from '../components/TeamLeaderboard';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 48,
    backgroundColor: '#fff',
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  lapButton: { marginVertical: 12 },
  team: { marginBottom: 16 },
  racer: { fontSize: 16, marginBottom: 4 },
});

function StartTeamRaceScreenInner() {
  const {
    teams,
    racers,
    logLap,
    currentTeamIndex,
    currentRacerIndex,
    teamLapData,
    isRaceFinished,
  } = useTeamRace();
  const [lapInProgress, setLapInProgress] = useState(false);

  if (!teams || teams.length === 0) {
    return <Text>No teams found. Please assign teams first.</Text>;
  }

  const currentTeam = teams[currentTeamIndex];
  const currentRacerId = currentTeam.members[currentRacerIndex];
  const currentRacer = racers.find((r) => r.id === currentRacerId);

  const handleLogLap = () => {
    setLapInProgress(true);
    logLap(currentTeamIndex, currentRacerIndex, Date.now());
    setLapInProgress(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Team Race</Text>
      <Text>Current Team: Team {currentTeamIndex + 1}</Text>
      <Text>
        Current Racer:{' '}
        {currentRacer ? `${currentRacer.name} (#${currentRacer.number})` : ''}
      </Text>
      <View style={styles.lapButton}>
        <Button
          title="Log Lap"
          onPress={handleLogLap}
          disabled={lapInProgress || isRaceFinished}
        />
      </View>
      <TeamLeaderboard />
    </SafeAreaView>
  );
}

export default StartTeamRaceScreenInner;
