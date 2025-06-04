// mobile/screens/RestaurantsListScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

function getBaseUrl(): string {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  if (Platform.OS === 'ios')     return 'http://localhost:3000';
  return 'http://localhost:3000';
}

export default function RestaurantsListScreen() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<{ id: number; name: string; location: string }[]>([]);
  const [filtered, setFiltered] = useState(restaurants);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${getBaseUrl()}/restaurants`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to load');
      setRestaurants(json.data);
      setFiltered(json.data);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const s = search.trim().toLowerCase();
    setFiltered(s ? restaurants.filter(r => r.name.toLowerCase().includes(s)) : restaurants);
  }, [search, restaurants]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search by name…"
        value={search}
        onChangeText={setSearch}
      />

      {filtered.length === 0 ? (
        <View style={styles.center}><Text>No restaurants found.</Text></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push({ pathname: '/restaurants/[id]', params: { id: item.id.toString() } })}
            >
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.loc}>{item.location}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8, backgroundColor: '#fff' },
  searchBar: {
    height: 40,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  list:    { paddingHorizontal: 16, paddingBottom: 16 },
  row:     { padding: 16, backgroundColor: '#fff', marginBottom: 12, borderRadius: 8, elevation: 2 },
  name:    { fontSize: 18, fontWeight: 'bold' },
  loc:     { fontSize: 14, color: '#666', marginTop: 4 },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
