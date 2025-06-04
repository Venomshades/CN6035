// mobile/screens/RestaurantDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const getBaseUrl = () =>
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000'
    : 'http://localhost:3000';

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [data, setData]       = useState<{ name: string; location: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${getBaseUrl()}/restaurants/${id}`)
      .then(res => res.json())
      .then(json => {
        if (!json.success) throw new Error(json.message);
        setData(json.data);
      })
      .catch(err => Alert.alert('Error', err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }
  if (!data) {
    return <View style={styles.center}><Text>Restaurant not found.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{data.name}</Text>
      <Text style={styles.loc}>{data.location}</Text>

      <Button
        title="Make Reservation"
        onPress={() =>
          router.push({ pathname: '/restaurants/[id]/reserve', params: { id } })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex: 1, padding: 16, backgroundColor: '#fff' },
  name:     { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  loc:      { fontSize: 16, color: '#666', marginBottom: 16 },
  center:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
