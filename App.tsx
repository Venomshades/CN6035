// App.tsx

import React, { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  // add Home or others here as needed
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    // if coming from background/inactive → active
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // Reset navigation to the Login screen
      if (navigationRef.current) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    }

    appState.current = nextAppState;
    setAppStateVisible(appState.current);
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
