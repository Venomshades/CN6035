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
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

function getBaseUrl() {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  if (Platform.OS === 'ios')     return 'http://localhost:3000';
  return 'http://localhost:3000';
}

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPassword, setConfirm] = useState('');
  const [phone, setPhone]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [errors, setErrors]           = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });

  function validate() {
    const errs = { name:'', email:'', password:'', confirm:'' };
    let valid = true;
    if (!name.trim()) {
      errs.name = 'Name is required';
      valid = false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Valid email is required';
      valid = false;
    }
    if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
      valid = false;
    }
    if (password !== confirmPassword) {
      errs.confirm = 'Passwords must match';
      valid = false;
    }
    setErrors(errs);
    return valid;
  }

  async function handleRegister() {
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch(`${getBaseUrl()}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone: phone || null }),
      });

      const json = await res.json();
      if (!res.ok) {
        // server responded with 4xx/5xx
        throw new Error(json.message || 'Registration failed');
      }

      // store the JWT if you like
      await AsyncStorage.setItem('token', json.token);
      // navigate back to login
      router.replace('/');
    } catch (err: any) {
      Alert.alert('Registration Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity
            style={styles.back}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.sub}>Sign up to get started</Text>

          {/* Name */}
          <View style={[styles.inputContainer, errors.name && styles.errorBorder]}>
            <Ionicons name="person-outline" size={22} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
          </View>
          {!!errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          {/* Email */}
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

          {/* Password */}
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

          {/* Confirm Password */}
          <View style={[styles.inputContainer, errors.confirm && styles.errorBorder]}>
            <Ionicons name="lock-closed-outline" size={22} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirm}
              editable={!loading}
            />
          </View>
          {!!errors.confirm && <Text style={styles.errorText}>{errors.confirm}</Text>}

          {/* Phone */}
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={22} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Phone (Optional)"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              editable={!loading}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Sign Up</Text>
            }
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text>Have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/')}>
              <Text style={styles.link}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:   { flex:1, backgroundColor:'#fff' },
  container:  { flexGrow:1, padding:20, justifyContent:'center' },
  back:       { marginBottom:20, width:40, height:40, alignItems:'center', justifyContent:'center' },
  title:      { fontSize:24, fontWeight:'bold', textAlign:'center', marginBottom:8, color:'#333' },
  sub:        { fontSize:16, color:'#666', textAlign:'center', marginBottom:30 },
  inputContainer:{ flexDirection:'row', alignItems:'center', borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:10, marginBottom:8, backgroundColor:'#f9f9f9' },
  input:      { flex:1, height:50, marginLeft:10, color:'#333' },
  errorBorder:{ borderColor:'#ff3b30' },
  errorText:  { color:'#ff3b30', fontSize:12, marginBottom:10, marginLeft:5 },
  button:     { backgroundColor:'#28a745', borderRadius:8, height:55, alignItems:'center', justifyContent:'center', marginVertical:20 },
  btnText:    { color:'#fff', fontSize:18, fontWeight:'bold' },
  footer:     { flexDirection:'row', justifyContent:'center' },
  link:       { color:'#28a745', fontSize:16, fontWeight:'bold' },
});
