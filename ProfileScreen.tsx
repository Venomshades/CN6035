// mobile/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Button,
  Alert, StyleSheet, Platform, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getBaseUrl = () =>
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export default function ProfileScreen() {
  const [reservations, setReservations] = useState<
    { id:number; restaurantName:string; date:string; time:string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res   = await fetch(`${getBaseUrl()}/users/me/reservations`, {
        headers:{ Authorization:`Bearer ${token}` }
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setReservations(json.data);
    } catch (err:any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cancel = async (id:number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res   = await fetch(`${getBaseUrl()}/reservations/${id}`, {
        method:'DELETE', headers:{ Authorization:`Bearer ${token}` }
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      load();
    } catch (err:any) {
      Alert.alert('Error', err.message);
    }
  };

  if (loading) return <ActivityIndicator style={styles.center} />;

  if (reservations.length === 0) {
    return <View style={styles.center}><Text>No reservations yet</Text></View>;
  }

  return (
    <FlatList
      data={reservations}
      keyExtractor={i=>i.id.toString()}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View>
            <Text style={styles.name}>{item.restaurantName}</Text>
            <Text>{item.date} @ {item.time}</Text>
          </View>
          <Button title="Cancel" color="red" onPress={()=>cancel(item.id)} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list:   { padding:16, backgroundColor:'#fff' },
  row:    {
    flexDirection:'row', justifyContent:'space-between',
    paddingVertical:12, borderBottomWidth:1, borderColor:'#eee'
  },
  name:   { fontSize:16, fontWeight:'500' },
  center: { flex:1, alignItems:'center', justifyContent:'center', backgroundColor:'#fff' },
});
