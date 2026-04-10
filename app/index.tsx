// This file redirects the root route to /add-racer
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/add-racer" />;
}
