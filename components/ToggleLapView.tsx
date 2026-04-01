import React, { useState } from 'react';
import { Button, ScrollView, Text, View } from 'react-native';
import LogLapByNumber from './LogLapByNumber';
import { Race, Racer } from './types';

export default function ToggleLapView({
  race,
  racers,
  onLogLap,
  styles,
}: {
  race: Race | null;
  racers: Racer[];
  onLogLap: (racerId: string) => void;
  styles: any;
}) {
  const [logByNumber, setLogByNumber] = useState(false);
  return (
    <>
      <Button
        title={logByNumber ? 'Switch to Log by Name' : 'Log Lap by Number'}
        onPress={() => setLogByNumber((prev) => !prev)}
        color={logByNumber ? '#888' : '#007AFF'}
      />
      {logByNumber ? (
        <LogLapByNumber race={race} onLogLap={onLogLap} />
      ) : (
        <ScrollView
          style={{ width: '100%' }}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {race?.racers.map((racer) => (
            <View key={racer.id} style={styles.racerButtonRow}>
              <Button
                title={`${racer.name} (#${racer.number})`}
                onPress={() => onLogLap(racer.id)}
              />
              <Text style={styles.lapInfo}>
                Laps: {racer.lapsCompleted} | Last Lap:{' '}
                {racer.lapTimes[racer.lapTimes.length - 1]?.toFixed(2) || '-'}s
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </>
  );
}
