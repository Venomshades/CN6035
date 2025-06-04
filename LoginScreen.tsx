// mobile/screens/LoginScreen.tsx

import React, { useState } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

function getBaseUrl(): string {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  if (Platform.OS === 'ios')     return 'http://localhost:3000';
  return 'http://localhost:3000';
}

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({ email: '', password: '' });

  const validateForm = (): boolean => {
    let valid = true;
    const errs = { email: '', password: '' };
    if (!email) {
      errs.email = 'Email required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Invalid email';
      valid = false;
    }
    if (!password) {
      errs.password = 'Password required';
      valid = false;
    }
    setErrors(errs);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await fetch(`${getBaseUrl()}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Login failed');

      // Persist token & role
      await AsyncStorage.setItem('token', json.token);
      await AsyncStorage.setItem('role', json.role);

      // Navigate based on role
      if (json.role === 'admin') {
        router.replace({ pathname: '/admin' });
      } else {
        router.replace({ pathname: '/restaurants' });
      }
    } catch (err: any) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Welcome Back</Text>
            <Text style={styles.sub}>Sign in to your account</Text>
          </View>

          <View style={[styles.inputContainer, errors.email && styles.errorBorder]}>
            <Ionicons name="mail-outline" size={22} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
          </View>
          {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <View style={[styles.inputContainer, errors.password && styles.errorBorder]}>
            <Ionicons name="lock-closed-outline" size={22} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
          </View>
          {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Sign In</Text>
            }
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => router.replace({ pathname: '/register' })}
              disabled={loading}
            >
              <Text style={styles.link}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:      { flex: 1, backgroundColor: '#fff' },
  container:     { flexGrow: 1, padding: 20, justifyContent: 'center' },
  headerContainer:{ marginBottom: 40 },
  header:        { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#333' },
  sub:           { fontSize: 16, color: '#666', textAlign: 'center' },
  inputContainer:{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 12, backgroundColor: '#f9f9f9' },
  input:         { flex: 1, marginLeft: 10, height: 40, color: '#333' },
  errorBorder:   { borderColor: '#ff3b30' },
  errorText:     { color: '#ff3b30', fontSize: 12, marginBottom: 8 },
  button:        { backgroundColor: '#ff4500', borderRadius: 8, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 15 },
  buttonText:    { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footer:        { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  link:          { color: '#ff4500', fontWeight: 'bold' },
});
