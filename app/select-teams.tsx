import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRacers } from '../components/racer-context';
import { useTeamRace } from '../components/team-race-context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center', // Center horizontally
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 48,
    backgroundColor: '#fff',
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 18, marginVertical: 12 },
  racer: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 8,
  },
  selected: { backgroundColor: '#e0f7fa' },
  team: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  teamLabel: { fontWeight: 'bold' },
});

function SelectTeamsScreen() {
  const { racers } = useRacers();
  const [selected, setSelected] = useState<string[]>([]);
  const [teams, setTeams] = useState<{ id: string; members: string[] }[]>([]);
  const router = useRouter();
  const { setTeams: setTeamsContext } = useTeamRace();

  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((r) => r !== id)
        : prev.length < 2
          ? [...prev, id]
          : prev,
    );
  };

  const handleAddTeam = () => {
    if (selected.length !== 2) {
      Alert.alert('Select 2 racers per team');
      return;
    }
    setTeams((prev) => [
      ...prev,
      { id: Math.random().toString(36).substr(2, 9), members: selected },
    ]);
    setSelected([]);
  };

  const handleContinue = () => {
    const allRacerIds = teams.flatMap((t) => t.members);
    if (racers.length < 2 || allRacerIds.length !== racers.length) {
      Alert.alert('All racers must be assigned to a team of 2.');
      return;
    }
    setTeamsContext(teams);
    router.push({ pathname: '/start-team-race' });
  };

  const handleClearTeams = () => {
    Alert.alert(
      'Clear All Teams',
      'Are you sure you want to remove all teams?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setTeams([]);
            setSelected([]);
          },
        },
      ],
    );
  };

  const unassigned = racers.filter(
    (r) => !teams.flatMap((t) => t.members).includes(r.id),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ width: '100%', alignItems: 'center', flex: 1 }}>
        <Text style={styles.title}>Select Teams</Text>
        <Text style={styles.subtitle}>Unassigned Racers</Text>
        <FlatList
          style={{ width: '100%', maxHeight: 320 }}
          contentContainerStyle={{ alignItems: 'center' }}
          data={unassigned}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.racer,
                selected.includes(item.id) && styles.selected,
                { width: '90%' },
              ]}
              onPress={() => handleSelect(item.id)}
            >
              <Text>
                {item.name} (#{item.number})
              </Text>
            </TouchableOpacity>
          )}
        />
        <Button
          title="Add Team"
          onPress={handleAddTeam}
          disabled={selected.length !== 2}
        />
        <Button
          title="Clear All Teams"
          onPress={handleClearTeams}
          color="red"
        />
        <Text style={styles.subtitle}>Teams</Text>
        {teams.map((team, idx) => (
          <View key={team.id} style={[styles.team, { width: '90%' }]}>
            <Text style={styles.teamLabel}>Team {idx + 1}:</Text>
            <Text>
              {team.members
                .map((id) => {
                  const racer = racers.find((r) => r.id === id);
                  return racer ? `${racer.name} (#${racer.number})` : '';
                })
                .join(' & ')}
            </Text>
          </View>
        ))}
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={teams.length * 2 !== racers.length}
        />
        <Button
          title="Back to Add Racers"
          onPress={() => router.replace('/add-racer')}
          color="#888"
        />
      </View>
    </SafeAreaView>
  );
}

export default SelectTeamsScreen;
