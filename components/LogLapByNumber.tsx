import React, { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { Race } from './types';

interface LogLapByNumberProps {
  race: Race | null;
  onLogLap: (racerId: string) => void;
}

export default function LogLapByNumber({
  race,
  onLogLap,
}: LogLapByNumberProps) {
  const [numberInput, setNumberInput] = useState('');
  const [numberError, setNumberError] = useState('');

  return (
    <View style={{ width: '100%', marginTop: 16, alignItems: 'center' }}>
      <Text>Enter Racer Number:</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: numberError ? 'red' : '#ccc',
          borderRadius: 4,
          padding: 8,
          width: 160,
          marginTop: 8,
          marginBottom: 4,
          textAlign: 'center',
        }}
        value={numberInput}
        onChangeText={setNumberInput}
        keyboardType="number-pad"
        placeholder="Racer Number"
        onSubmitEditing={() => {
          setNumberError('');
          const racer = race?.racers.find(
            (r: any) => r.number === numberInput.trim(),
          );
          if (!racer) {
            setNumberError('No racer with that number');
            return;
          }
          onLogLap(racer.id);
          setNumberInput('');
        }}
        returnKeyType="done"
      />
      <Button
        title="Log Lap"
        onPress={() => {
          setNumberError('');
          const racer = race?.racers.find(
            (r: any) => r.number === numberInput.trim(),
          );
          if (!racer) {
            setNumberError('No racer with that number');
            return;
          }
          onLogLap(racer.id);
          setNumberInput('');
        }}
        disabled={!numberInput.trim()}
      />
      {numberError ? (
        <Text style={{ color: 'red', marginTop: 4 }}>{numberError}</Text>
      ) : null}
    </View>
  );
}
