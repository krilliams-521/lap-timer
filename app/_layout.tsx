import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { RaceProvider } from '../components/race-context';
import { RacerProvider, useRacers } from '../components/racer-context';
import { TeamRaceContextProvider } from '../components/team-race-context';

// Custom wrapper to check racers and redirect if needed
function LayoutWithRedirect() {
  const { racers } = useRacers();
  const router = useRouter();
  const segments = useSegments();
  useEffect(() => {
    // Only redirect if router is ready and not already on add-racer
    if (!router || !router.replace) return;
    const isOnAddRacer = segments[0] === 'add-racer';
    // Avoid redirecting before router is mounted
    if (racers.length === 0 && !isOnAddRacer) {
      setTimeout(() => {
        router.replace('/add-racer');
      }, 0);
    }
  }, [racers, router, segments]);
  return <Slot />;
}
export default function Layout() {
  return (
    <RaceProvider>
      <RacerProvider>
        <TeamRaceContextProvider>
          <LayoutWithRedirect />
        </TeamRaceContextProvider>
      </RacerProvider>
    </RaceProvider>
  );
}
