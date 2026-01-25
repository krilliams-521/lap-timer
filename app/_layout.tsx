import { Slot } from 'expo-router';
import { RacerProvider } from '../components/racer-context';

export default function RootLayout() {
  return (
    <RacerProvider>
      <Slot />
    </RacerProvider>
  );
}
