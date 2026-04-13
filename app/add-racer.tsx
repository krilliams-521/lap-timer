import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRace } from '../components/race-context';
import { useRacers } from '../components/racer-context';
import { useTeamRace } from '../components/team-race-context';

import { useIsFocused } from '@react-navigation/native';
import { Racer } from '../components/types';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingTop: 64,
    paddingBottom: 36,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  success: {
    marginTop: 16,
    color: 'green',
    fontWeight: 'bold',
  },
  racerListContainer: {
    width: '80%',
    marginTop: 24,
    maxHeight: 300, // Limit height for scroll
  },
  racerListTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  racerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
});

export default function AddRacerScreen() {
  const numberInputRef = useRef<TextInput>(null);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { addRacer, racers, clearRacers } = useRacers();
  const { resetRace } = useRace();
  const { resetTeamRace } = useTeamRace();
  const [raceType, setRaceType] = useState('Individual');
  const router = useRouter();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      clearRacers();
      resetRace();
      resetTeamRace();
    }
  }, [isFocused, clearRacers, resetRace, resetTeamRace]);

  const handleAdd = () => {
    if (name.trim() && number.trim()) {
      const newRacer: Racer = {
        id: Math.random().toString(36).substr(2, 9),
        name: name.trim(),
        number: number.trim(),
        lapTimes: [],
        lapsCompleted: 0,
      };
      addRacer(newRacer);
      setSubmitted(true);
      setName('');
      setNumber('');
      numberInputRef.current?.blur();
      setTimeout(() => setSubmitted(false), 1500);
    }
  };

  const handleClearRacers = () => {
    Alert.alert(
      'Clear All Racers',
      'Are you sure you want to remove all racers?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => clearRacers() },
      ],
    );
  };

  const handleAddFourRacers = () => {
    const testRacers = [
      { name: 'Alice', number: '1' },
      { name: 'Bob', number: '2' },
      { name: 'Charlie', number: '3' },
      { name: 'Dana', number: '4' },
    ];
    testRacers.forEach(({ name, number }) => {
      const newRacer: Racer = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        number,
        lapTimes: [],
        lapsCompleted: 0,
      };
      addRacer(newRacer);
    });
  };

  // Add 20 riders automatically
  const handleAddTwentyRiders = () => {
    for (let i = 1; i <= 20; i++) {
      const newRacer: Racer = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Rider ${i}`,
        number: `${i}`,
        lapTimes: [],
        lapsCompleted: 0,
      };
      addRacer(newRacer);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 36,
        paddingTop: 64,
        paddingBottom: 36,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Add Racer</Text>
      <Button
        title="Add 4 Test Racers"
        onPress={handleAddFourRacers}
        color="#888"
      />
      <View style={{ height: 8 }} />
      <Button
        title="Add 20 Riders Automatically"
        onPress={handleAddTwentyRiders}
        color="#888"
      />
      <View style={{ height: 12 }} />
      <TextInput
        style={styles.input}
        placeholder="Racer Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        ref={numberInputRef}
        style={styles.input}
        placeholder="Racer Number"
        value={number}
        onChangeText={setNumber}
        keyboardType="numeric"
      />
      <Button title="Add" onPress={handleAdd} />
      {submitted && <Text style={styles.success}>Racer added!</Text>}

      {racers.length > 0 && (
        <View style={styles.racerListContainer}>
          <Text style={styles.racerListTitle}>Racers:</Text>
          <ScrollView style={{ maxHeight: 300 }}>
            {racers.map((racer) => (
              <View key={racer.id} style={styles.racerRow}>
                <Text>{racer.name}</Text>
                <Text>#{racer.number}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      {racers.length > 0 && (
        <View style={{ marginTop: 20, width: '80%' }}>
          <Button
            title="Clear All Racers"
            onPress={handleClearRacers}
            color="red"
          />
          <View style={{ height: 12 }} />
          <Text style={{ marginTop: 12, marginBottom: 4 }}>Race Type:</Text>
          <Picker
            selectedValue={raceType}
            onValueChange={(itemValue) => setRaceType(itemValue)}
            style={{ width: '100%', marginBottom: 12 }}
          >
            <Picker.Item label="Individual" value="Individual" />
            <Picker.Item label="Team" value="Team" />
          </Picker>
          <Button
            title="Continue"
            onPress={() => {
              if (raceType === 'Individual') {
                router.push({ pathname: '/start-race', params: { raceType } });
              } else if (raceType === 'Team') {
                router.push({
                  pathname: '/select-teams',
                  params: { raceType },
                });
              }
            }}
            color="#007AFF"
          />
        </View>
      )}
    </ScrollView>
  );
}
