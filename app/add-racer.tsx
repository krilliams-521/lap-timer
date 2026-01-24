import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function AddRacerScreen() {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleAdd = () => {
    if (name.trim()) {
      setSubmitted(true);
      // TODO: Add racer logic here
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Racer</Text>
      <TextInput
        style={styles.input}
        placeholder="Racer Name"
        value={name}
        onChangeText={setName}
      />
      <Button title="Add" onPress={handleAdd} />
      {submitted && <Text style={styles.success}>Racer added!</Text>}
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
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  success: {
    marginTop: 16,
    color: 'green',
    fontWeight: 'bold',
  },
});
