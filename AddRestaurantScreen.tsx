// mobile/screens/AddRestaurantScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

function getBaseUrl(): string {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  if (Platform.OS === 'ios')     return 'http://localhost:3000';
  return 'http://localhost:3000';
}

export default function AddRestaurantScreen() {
  const router = useRouter();
  const [name, setName]         = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !location.trim()) {
      Alert.alert('Validation', 'Name and location are required.');
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${getBaseUrl()}/restaurants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, location }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      Alert.alert('Success', 'Restaurant added!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add New Restaurant</Text>

      <TextInput
        style={styles.input}
        placeholder="Restaurant Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />

      {loading
        ? <ActivityIndicator style={{ marginTop: 20 }} />
        : <Button title="Create" onPress={handleSubmit} />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex:1, padding:16, backgroundColor:'#fff' },
  header:     { fontSize:20, fontWeight:'bold', marginBottom:16 },
  input:      {
    borderWidth:1,
    borderColor:'#ccc',
    borderRadius:4,
    padding:8,
    marginBottom:12,
    backgroundColor:'#fff',
  },
});
