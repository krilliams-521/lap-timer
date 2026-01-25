import { StyleSheet, Text, View } from 'react-native';

export default function StartRaceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start Race</Text>
      <Text>This is the Start Race screen.</Text>
    </View>
  );
}

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
});
