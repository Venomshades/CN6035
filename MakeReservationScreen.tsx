// mobile/screens/MakeReservationScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  Alert,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';

const getBaseUrl = () =>
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000'
    : 'http://localhost:3000';

export default function MakeReservationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [date, setDate]               = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading]         = useState(false);

  // Called by native pickers
  const onChange = (event: DateTimePickerEvent, selected?: Date) => {
    setShowDatePicker(false);
    setShowTimePicker(false);
    if (selected) setDate(selected);
  };

  // Fallback for web: simple prompt
  const pickDateWeb = () => {
    const current = date.toISOString().slice(0, 10);
    const input = window.prompt('Enter reservation date (YYYY-MM-DD):', current);
    if (input && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
      const [y, m, d] = input.split('-').map(Number);
      const newDate = new Date(date);
      newDate.setFullYear(y, m - 1, d);
      setDate(newDate);
    } else if (input) {
      Alert.alert('Invalid date format');
    }
  };

  const pickTimeWeb = () => {
    const current = date.toTimeString().slice(0, 5);
    const input = window.prompt('Enter reservation time (HH:MM):', current);
    if (input && /^\d{2}:\d{2}$/.test(input)) {
      const [h, min] = input.split(':').map(Number);
      const newDate = new Date(date);
      newDate.setHours(h, min);
      setDate(newDate);
    } else if (input) {
      Alert.alert('Invalid time format');
    }
  };

  const submit = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const yyyy = date.toISOString().slice(0,10);
      const hhmm = date.toTimeString().slice(0,5);
      const res = await fetch(`${getBaseUrl()}/restaurants/${id}/reservations`, {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          Authorization:`Bearer ${token}`
        },
        body: JSON.stringify({ date: yyyy, time: hhmm }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      Alert.alert('Success','Reservation created',[{ text:'OK', onPress:()=>router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const displayDate = date.toLocaleDateString();
  const displayTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Choose Date & Time</Text>

      {/* Date picker */}
      <View style={styles.pickerRow}>
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>{displayDate}</Text>
        {Platform.OS === 'web' ? (
          <Button title="Change Date" onPress={pickDateWeb} />
        ) : (
          <Button title="Change Date" onPress={() => setShowDatePicker(true)} />
        )}
      </View>

      {/* Time picker */}
      <View style={styles.pickerRow}>
        <Text style={styles.label}>Time:</Text>
        <Text style={styles.value}>{displayTime}</Text>
        {Platform.OS === 'web' ? (
          <Button title="Change Time" onPress={pickTimeWeb} />
        ) : (
          <Button title="Change Time" onPress={() => setShowTimePicker(true)} />
        )}
      </View>

      {/* Native pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display="default"
          onChange={onChange}
        />
      )}

      {/* Submit */}
      {loading
        ? <ActivityIndicator style={{ marginTop: 20 }} />
        : <Button title="Confirm Reservation" onPress={submit} />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, padding: 16, backgroundColor: '#fff' },
  header:         { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  pickerRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  label:          { width: 50, fontWeight: '500' },
  value:          { flex: 1 },
});
