import React from 'react';
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import type { Racer } from './types';

export type LapLoggerProps = {
  mode: 'individual' | 'team';
  racers: Racer[];
  onLogLap?: (racerId: string) => void;
  onTeamLogLap?: (racerId: string) => void;
  raceStarted: boolean;
  logByNumber?: boolean;
  setLogByNumber?: (val: boolean) => void;
};

const styles = StyleSheet.create({
  container: { marginVertical: 16 },
  racerButton: {
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  racerButtonText: { color: '#fff', fontWeight: 'bold' },
  toggleRow: { flexDirection: 'row', marginBottom: 12 },
  toggleButton: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  toggleActive: { backgroundColor: '#007AFF' },
  toggleText: { color: '#007AFF', fontWeight: 'bold' },
  toggleTextActive: { color: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    width: '100%',
  },
});

export default function LapLogger(props: LapLoggerProps) {
  const {
    mode,
    racers,
    onLogLap,
    onTeamLogLap,
    raceStarted,
    logByNumber,
    setLogByNumber,
  } = props;

  const [numberInput, setNumberInput] = React.useState('');
  const [numberError, setNumberError] = React.useState('');

  if (!raceStarted) return null;

  // Shared UI for both modes
  const isTeam = mode === 'team';

  return (
    <View style={styles.container}>
      {setLogByNumber && (
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleButton, !logByNumber && styles.toggleActive]}
            onPress={() => setLogByNumber(false)}
          >
            <Text
              style={[
                styles.toggleText,
                !logByNumber && styles.toggleTextActive,
              ]}
            >
              By Name
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, logByNumber && styles.toggleActive]}
            onPress={() => setLogByNumber(true)}
          >
            <Text
              style={[
                styles.toggleText,
                logByNumber && styles.toggleTextActive,
              ]}
            >
              By Number
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {logByNumber ? (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Enter Racer Number"
            value={numberInput}
            onChangeText={setNumberInput}
            keyboardType="numeric"
          />
          {numberError ? (
            <Text style={{ color: 'red' }}>{numberError}</Text>
          ) : null}
          <Button
            title="Log Lap"
            onPress={() => {
              const racer = racers.find(
                (r: Racer) => r.number === numberInput.trim(),
              );
              if (!racer) {
                setNumberError('Racer not found');
                return;
              }
              setNumberError('');
              setNumberInput('');
              if (isTeam) {
                onTeamLogLap && onTeamLogLap(racer.id);
              } else {
                onLogLap && onLogLap(racer.id);
              }
            }}
            disabled={!numberInput.trim()}
          />
        </View>
      ) : (
        <View>
          {racers.map((racer: Racer) => (
            <TouchableOpacity
              key={racer.id}
              style={styles.racerButton}
              onPress={() => {
                if (isTeam) {
                  onTeamLogLap && onTeamLogLap(racer.id);
                } else {
                  onLogLap && onLogLap(racer.id);
                }
              }}
            >
              <Text style={styles.racerButtonText}>
                {racer.name} (#{racer.number})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
