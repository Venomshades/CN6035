// mobile/screens/AdminRestaurantsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

function getBaseUrl() {
  return 'http://localhost:3000'; // adjust for platform
}

export default function AdminRestaurantsScreen() {
  const [list, setList]       = useState<{id:number,name:string,location:string}[]>([]);
  const [name, setName]       = useState('');
  const [location, setLocation] = useState('');
  const router                = useRouter();

  // fetch all restaurants
  async function load() {
    const res = await fetch(`${getBaseUrl()}/restaurants`);
    const json = await res.json();
    if (json.success) setList(json.data);
  }

  useEffect(() => { load(); }, []);

  // create
  async function handleAdd() {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`${getBaseUrl()}/restaurants`, {
      method:'POST',
      headers: {
        'Content-Type':'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, location })
    });
    const json = await res.json();
    if (!res.ok) return Alert.alert('Error', json.message);
    setName(''); setLocation('');
    load();
  }

  // delete
  async function handleDelete(id:number) {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`${getBaseUrl()}/restaurants/${id}`, {
      method:'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const json = await res.json();
    if (!res.ok) return Alert.alert('Error', json.message);
    load();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin: Manage Restaurants</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />
      <Button title="Add Restaurant" onPress={handleAdd} />

      <FlatList
        style={{marginTop:20}}
        data={list}
        keyExtractor={i=>i.id.toString()}
        renderItem={({item})=>(
          <View style={styles.row}>
            <Text>{item.name} — {item.location}</Text>
            <Button title="Delete" color="red" onPress={()=>handleDelete(item.id)} />
          </View>
        )}
      />
      <Button title="Back" onPress={()=>router.replace('/restaurants')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:16, backgroundColor:'#fff' },
  header:{ fontSize:20, fontWeight:'bold', marginBottom:12 },
  input:{ borderWidth:1, borderColor:'#ccc', borderRadius:4, padding:8, marginVertical:4 },
  row:{ flexDirection:'row', justifyContent:'space-between', paddingVertical:8 }
});
