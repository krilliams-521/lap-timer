import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  selected: {
    borderColor: '#00bcd4',
    shadowColor: '#00bcd4',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    backgroundColor: '#e0f7fa',
  },
  selectedArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fafbfc',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    minHeight: 64,
    zIndex: 10,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f7fa',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginVertical: 2,
    minWidth: 44,
    minHeight: 36,
    elevation: 2,
  },
  chipText: { fontSize: 16, marginRight: 8 },
  chipRemove: {
    fontSize: 18,
    color: '#d32f2f',
    paddingHorizontal: 4,
    paddingVertical: 2,
    minWidth: 28,
    textAlign: 'center',
  },
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

  // Key for AsyncStorage
  const TEAMS_STORAGE_KEY = 'teams';

  // Load teams from AsyncStorage on mount
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const stored = await AsyncStorage.getItem(TEAMS_STORAGE_KEY);
        if (stored) {
          setTeams(JSON.parse(stored));
        }
      } catch (e) {
        // Optionally handle error
      }
    };
    loadTeams();
  }, []);

  // Save teams to AsyncStorage whenever they change
  useEffect(() => {
    AsyncStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
  }, [teams]);
  const router = useRouter();
  const { setTeams: setTeamsContext } = useTeamRace();

  // Toggle selection, max 2
  const handleSelect = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((r) => r !== id);
      }
      if (prev.length >= 2) {
        // Ignore further selections
        return prev;
      }
      return [...prev, id];
    });
  };

  // Remove a single racer from selection
  const handleRemoveSelected = (id: string) => {
    setSelected((prev) => prev.filter((r) => r !== id));
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
          onPress: async () => {
            setTeams([]);
            setSelected([]);
            await AsyncStorage.removeItem(TEAMS_STORAGE_KEY);
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
      <View
        style={{
          width: '100%',
          alignItems: 'center',
          flex: 1,
          paddingBottom: 90,
        }}
      >
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
              accessibilityRole="button"
              accessibilityState={{ selected: selected.includes(item.id) }}
              disabled={selected.length === 2 && !selected.includes(item.id)}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 16 }}>
                {item.name} (#{item.number})
              </Text>
              {selected.includes(item.id) && (
                <Text style={{ fontSize: 20, color: '#00bcd4', marginLeft: 8 }}>
                  ✓
                </Text>
              )}
            </TouchableOpacity>
          )}
        />

        <Text style={styles.subtitle}>Teams</Text>
        <View
          style={{
            maxHeight: 180,
            width: '100%',
            marginBottom: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FlatList
            data={teams}
            keyExtractor={(team) => team.id}
            renderItem={({ item: team, index: idx }) => (
              <View
                key={team.id}
                style={[styles.team, { width: '90%', alignItems: 'center' }]}
              >
                <Text style={styles.teamLabel}>Team {idx + 1}:</Text>
                <Text style={{ flex: 1, marginLeft: 8 }}>
                  {team.members
                    .map((id) => {
                      const racer = racers.find((r) => r.id === id);
                      return racer ? `${racer.name} (#${racer.number})` : '';
                    })
                    .join(' & ')}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      `Remove Team ${idx + 1}?`,
                      'Are you sure you want to remove this team and return both racers to the pool?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Remove',
                          style: 'destructive',
                          onPress: () =>
                            setTeams((prev) =>
                              prev.filter((t) => t.id !== team.id),
                            ),
                        },
                      ],
                    );
                  }}
                  accessibilityLabel={`Remove Team ${idx + 1}`}
                  style={{ marginLeft: 12, padding: 4 }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={{ fontSize: 20, color: '#d32f2f' }}>×</Text>
                </TouchableOpacity>
              </View>
            )}
            showsVerticalScrollIndicator={true}
          />
        </View>
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
        <Button
          title="Clear All Teams"
          onPress={handleClearTeams}
          color="red"
        />

        {selected.length > 0 && (
          <View
            style={styles.selectedArea}
            accessibilityLabel="Selected Racers"
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                maxWidth: 360,
                width: '92%',
                marginHorizontal: '4%',
                justifyContent: 'center',
                flex: 1,
                marginBottom: 20,
              }}
            >
              {selected.map((id) => {
                const racer = racers.find((r) => r.id === id);
                if (!racer) return null;
                return (
                  <View key={id} style={styles.selectedChip}>
                    <Text style={styles.chipText}>
                      {racer.name} (#{racer.number})
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveSelected(id)}
                      accessibilityLabel={`Remove ${racer.name}`}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.chipRemove}>×</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
              <Button
                title="Add Team"
                onPress={handleAddTeam}
                disabled={selected.length !== 2}
                color={selected.length === 2 ? '#00bcd4' : '#aaa'}
                accessibilityLabel="Add selected racers as a team"
              />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

export default SelectTeamsScreen;
