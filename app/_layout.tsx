import { Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { RaceProvider } from '../components/race-context';
import { RacerProvider, useRacers } from '../components/racer-context';

// Custom wrapper to check racers and redirect if needed
function LayoutWithRedirect() {
  const { racers } = useRacers();
  const router = useRouter();
  useEffect(() => {
    if (racers.length === 0) {
      router.replace('/add-racer');
    }
  }, [racers, router]);
  return <Slot />;
}

export default function Layout() {
  return (
    <RaceProvider>
      <RacerProvider>
        <LayoutWithRedirect />
      </RacerProvider>
    </RaceProvider>
  );
}
