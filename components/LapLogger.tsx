import React from 'react';
import {
    Button,
    ScrollView,
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
  onLogLap?: (racerId: string, lapTime: number) => void;
  onTeamLogLap?: (racerId: string, lapTime: number) => void;
  raceStarted: boolean;
  logByNumber?: boolean;
  setLogByNumber?: (val: boolean) => void;
  getLapTime?: (racerId: string) => number;
};

const styles = StyleSheet.create({
  container: { marginVertical: 16, minWidth: 200 },
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

type LapLoggerWithBannerProps = LapLoggerProps & {
  showBanner?: (msg: string) => void;
  hideBanner?: () => void;
};
export default function LapLogger(props: LapLoggerWithBannerProps) {
  const {
    mode,
    racers,
    onLogLap,
    onTeamLogLap,
    raceStarted,
    logByNumber,
    setLogByNumber,
  } = props;

  // State for double-tap confirmation
  const [pendingRacerId, setPendingRacerId] = React.useState<string | null>(
    null,
  );
  const [confirmTimeout, setConfirmTimeout] =
    React.useState<NodeJS.Timeout | null>(null);

  // Use showBanner/hideBanner from props
  const showBanner = props.showBanner || (() => {});
  const hideBanner = props.hideBanner || (() => {});

  // Clean up confirmation timeout on unmount
  React.useEffect(() => {
    return () => {
      if (confirmTimeout) clearTimeout(confirmTimeout);
    };
  }, [confirmTimeout]);

  const [numberInput, setNumberInput] = React.useState('');
  const [numberError, setNumberError] = React.useState('');

  if (!raceStarted) return null;

  // Shared UI for both modes
  const isTeam = mode === 'team';

  // Helper to calculate lapTime (in ms) since last lap for this racer
  const getLapTime = (racerId: string) => {
    if (props.getLapTime) {
      return props.getLapTime(racerId);
    }
    return 0;
  };

  return (
    <View style={styles.container}>
      {/* LapBanner will be rendered by parent, not here */}
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
              const lapTime = getLapTime(racer.id);
              if (isTeam) {
                onTeamLogLap && onTeamLogLap(racer.id, lapTime);
              } else {
                onLogLap && onLogLap(racer.id, lapTime);
              }
            }}
            disabled={!numberInput.trim()}
          />
        </View>
      ) : (
        <ScrollView
          style={{ maxHeight: 320, width: '100%' }}
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          {racers.map((racer: Racer) => {
            const isPending = pendingRacerId === racer.id;
            return (
              <TouchableOpacity
                key={racer.id}
                style={[
                  styles.racerButton,
                  isPending && { backgroundColor: '#FFA500' },
                ]}
                onPress={() => {
                  if (pendingRacerId === racer.id) {
                    // Confirmed
                    if (confirmTimeout) clearTimeout(confirmTimeout);
                    setPendingRacerId(null);
                    const lapTime = getLapTime(racer.id);
                    if (isTeam) {
                      onTeamLogLap && onTeamLogLap(racer.id, lapTime);
                    } else {
                      onLogLap && onLogLap(racer.id, lapTime);
                    }
                    hideBanner(); // Hide previous banner before showing new one
                    showBanner(`Lap logged for ${racer.name}!`);
                  } else {
                    // Set as pending, require second tap
                    setPendingRacerId(racer.id);
                    if (confirmTimeout) clearTimeout(confirmTimeout);
                    // Do NOT hideBanner here; keep banner until next log
                    const timeout = setTimeout(() => {
                      setPendingRacerId(null);
                    }, 2500);
                    setConfirmTimeout(timeout as unknown as NodeJS.Timeout);
                  }
                }}
              >
                <Text style={styles.racerButtonText}>
                  {racer.name} (#{racer.number})
                </Text>
                {isPending && (
                  <Text style={{ color: '#fff', fontSize: 12, marginTop: 2 }}>
                    Tap again to confirm
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
      {/* LapBanner is now rendered by parent */}
    </View>
  );
}
