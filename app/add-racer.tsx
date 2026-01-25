import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
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
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { addRacer, racers } = useRacers();

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
      setTimeout(() => setSubmitted(false), 1500);
    }
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
    </View>
  );
}
