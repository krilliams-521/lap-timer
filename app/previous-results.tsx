import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

const STORAGE_KEY = 'previous_race_results';

export default function PreviousResultsScreen() {
  const [results, setResults] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (data) {
          setResults(JSON.parse(data));
        } else {
          setResults([]);
        }
      } catch (e) {
        setResults([]);
      }
    };
    fetchResults();
  }, []);

  const handleClearResults = () => {
    Alert.alert(
      'Clear All Results',
      'Are you sure you want to delete all previous results? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(STORAGE_KEY);
            setResults([]);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Previous Results</Text>
      {results.length === 0 ? (
        <Text>No previous results found.</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => {
                router.push({
                  pathname: '/previous-results-detail',
                  params: { index },
                });
              }}
            >
              <Text style={styles.resultTitle}>Race {index + 1}</Text>
              <Text style={styles.resultDate}>{item.date || ''}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      <TouchableOpacity style={styles.clearButton} onPress={handleClearResults}>
        <Text style={styles.clearButtonText}>Clear All Results</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultDate: {
    fontSize: 14,
    color: '#888',
  },
  clearButton: {
    marginTop: 24,
    alignSelf: 'center',
    backgroundColor: '#d32f2f',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
