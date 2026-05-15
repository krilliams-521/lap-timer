import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRacers } from '../components/racer-context';
import { useTeamRace } from '../components/team-race-context';
import { Racer } from '../components/types';
import defaultRacers from '../constants/racers';

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
    alignItems: 'center', // vertically center items
    marginBottom: 4,
  },
});

export default function AddRacerScreen() {
  // Add all default racers from constants/racers.ts
  const handleAddDefaultRacers = () => {
    defaultRacers.forEach(({ name, number }) => {
      const newRacer: Racer = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        number,
      };
      addRacer(newRacer);
    });
  };
  const numberInputRef = useRef<TextInput>(null);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { addRacer, racers, clearRacers, editRacer, deleteRacer } = useRacers();
  const { resetTeamRace } = useTeamRace();
  const [raceType, setRaceType] = useState('Team');
  const router = useRouter();
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editNumber, setEditNumber] = useState('');

  const racersWithInvalidNumbers = racers.filter(
    (r) => !r.number || r.number.trim().toLowerCase() === 'none',
  );

  const handleAdd = () => {
    if (name.trim() && number.trim()) {
      const newRacer: Racer = {
        id: Math.random().toString(36).substr(2, 9),
        name: name.trim(),
        number: number.trim(),
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
      'Are you sure you want to remove all racers? This will also clear all teams.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            clearRacers();
            resetTeamRace();
            await AsyncStorage.removeItem('teams');
          },
        },
      ],
    );
  };

  const startEdit = (racer: Racer) => {
    setEditingId(racer.id);
    setEditName(racer.name);
    setEditNumber(racer.number);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditNumber('');
  };
  const saveEdit = () => {
    if (editingId && editName.trim() && editNumber.trim()) {
      editRacer(editingId, {
        name: editName.trim(),
        number: editNumber.trim(),
      });
      cancelEdit();
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 64,
        paddingBottom: 36,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Add Racer</Text>

      {racersWithInvalidNumbers.length > 0 && (
        <View
          style={{
            backgroundColor: '#ffe5e5',
            borderColor: '#ff4d4f',
            borderWidth: 1,
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            width: '90%',
          }}
        >
          <Text
            style={{ color: '#b71c1c', fontWeight: 'bold', marginBottom: 4 }}
          >
            Warning: Some racers are missing numbers!
          </Text>
          <Text style={{ color: '#b71c1c', fontSize: 13 }}>
            Please assign a number to the following racers before starting the
            race:
          </Text>
          {racersWithInvalidNumbers.map((r) => (
            <Text
              key={r.id || r.name}
              style={{ color: '#b71c1c', marginLeft: 8 }}
            >
              • {r.name}
            </Text>
          ))}
        </View>
      )}

      {/* Previous Results Button */}
      <Button
        title="Previous Results"
        onPress={() => router.push('/previous-results')}
        color="#007AFF"
      />
      <View style={{ height: 16 }} />

      <Button
        title="Add Default Racers"
        onPress={handleAddDefaultRacers}
        color="#888"
      />
      <View style={{ height: 8 }} />
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
              <View
                key={racer.id}
                style={
                  editingId === racer.id
                    ? [
                        styles.racerRow,
                        { alignItems: 'flex-start', flexDirection: 'column' },
                      ]
                    : styles.racerRow
                }
              >
                {editingId === racer.id ? (
                  <>
                    <TextInput
                      style={[
                        styles.input,
                        { marginBottom: 0, width: 100, fontSize: 14 },
                      ]}
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Name"
                    />
                    <TextInput
                      style={[
                        styles.input,
                        { marginBottom: 0, width: 60, fontSize: 14 },
                      ]}
                      value={editNumber}
                      onChangeText={setEditNumber}
                      placeholder="Number"
                      keyboardType="numeric"
                    />
                    <View style={{ alignSelf: 'stretch', marginTop: 4 }}>
                      <Button title="Save" onPress={saveEdit} />
                      <View style={{ height: 4 }} />
                      <Button
                        title="Cancel"
                        onPress={cancelEdit}
                        color="#888"
                      />
                      <View style={{ height: 4 }} />
                      <Button
                        title="Delete"
                        onPress={() => {
                          deleteRacer(racer.id);
                          cancelEdit();
                        }}
                        color="#d32f2f"
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <Text>{racer.name}</Text>
                    <Text>#{racer.number}</Text>
                    <Button title="Edit" onPress={() => startEdit(racer)} />
                  </>
                )}
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
          {/* <Text style={{ marginTop: 12, marginBottom: 4 }}>Race Type:</Text>
          <Picker
            selectedValue={raceType}
            onValueChange={(itemValue) => setRaceType(itemValue)}
            style={{ width: '100%', marginBottom: 12 }}
          >
            <Picker.Item label="Individual" value="Individual" />
            <Picker.Item label="Team" value="Team" />
          </Picker> */}
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
