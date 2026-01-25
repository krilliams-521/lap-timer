import { Slot } from 'expo-router';
import { RaceProvider } from '../components/race-context';
import { RacerProvider } from '../components/racer-context';

export default function Layout() {
  return (
    <RaceProvider>
      <RacerProvider>
        <Slot />
      </RacerProvider>
    </RaceProvider>
  );
}
