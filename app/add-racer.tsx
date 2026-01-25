import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRacers } from '../components/racer-context';
import { Racer } from '../components/types';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
  const router = useRouter();

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Racer</Text>
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
          {racers.map((racer) => (
            <View key={racer.id} style={styles.racerRow}>
              <Text>{racer.name}</Text>
              <Text>#{racer.number}</Text>
            </View>
          ))}
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
          <Button
            title="Start Race"
            onPress={() => router.push('/start-race')}
            color="#007AFF"
          />
        </View>
      )}
    </View>
  );
}
