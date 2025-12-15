import 'react-native-get-random-values';
import React, { useState, useEffect, useRef } from 'react';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginPage from './src/screens/LoginPage';
import CreateAccount from './src/screens/CreateAccount';
import HomeScreen from './src/screens/HomeScreen';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import BottomTabs from './src/navigation/BottomTabs';
import DocumentScreen from './src/screens/DocumentScreen';
import ProfileScreen from './src/screens/ProfileScreen'; 
import SettingsScreen from './src/screens/SettingsScreen';
import { NavigatorScreenParams } from '@react-navigation/native';
import ForgotPassword from './src/screens/ForgotPasswordScreen';
import ResetPasswordConfirmation from './src/screens/ResetPasswordConfirmationScreen';
import ReAuthenticateScreen from './src/screens/ReAuthenticateScreen';
import { BackHandler, View, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import './i18n';
import HelpSupportScreen from './src/screens/HelpSupportScreen';
import AboutScreen from './src/screens/AboutScreen';
import { ScanVerificationRequest } from './src/screens/ScanVerificationRequest';
import APISettings from './src/components/ApiSettings';


export type TabParamList = {
  Home: undefined;
  'My Documents': undefined;
  More: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  Signin: undefined;
  CreateAccount: undefined;
  Home: undefined;
  Login: undefined;
  FirstTimeLogin: undefined;
  BottomTabs: NavigatorScreenParams<TabParamList>;
  More: undefined;
  Profile: undefined;
  Settings: undefined;
  Help: undefined;
  About: undefined;
  ForgotPassword: undefined;
  ResetPasswordConfirmation: { email: string };
  ReAuthenticate: undefined;
  ScanVerificationRequest: undefined;
  APISettings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Screens that don't require auth checks
const PUBLIC_SCREENS = ['Welcome', 'Login', 'CreateAccount', 'ForgotPassword', 'ResetPasswordConfirmation'];
// Screens that should bypass auth redirect checks
const BYPASS_AUTH_CHECK_SCREENS = [...PUBLIC_SCREENS, 'ReAuthenticate', 'ScanVerificationRequest'];
// Screens that should NOT trigger re-auth on background/foreground
const NO_REAUTH_ON_BACKGROUND_SCREENS = ['ScanVerificationRequest', 'ReAuthenticate'];

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [appState, setAppState] = useState<AppStateStatus>('active');
  const [requiresReAuth, setRequiresReAuth] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<string>('Welcome');
  const navigationRef = useRef<any>(null);
  const appStateRef = useRef<AppStateStatus>('active');
  const backgroundTimeRef = useRef<number>(0);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      const authenticated = !!(token && userData);
      console.log('🔐 Auth check:', { hasToken: !!token, hasUserData: !!userData, authenticated });
      
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('❌ Auth check error:', error);
      setIsAuthenticated(false);
    }
  };

  // Listen for app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [currentRoute]);

  // Back button handler
  useEffect(() => {
    const backButtonListener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentRoute === 'ReAuthenticate') {
        console.log('🔐 Back button blocked on ReAuthenticate screen');
        return true;
      }
      return false;
    });

    return () => {
      backButtonListener.remove();
    };
  }, [currentRoute]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    console.log('📱 App state changed:', appStateRef.current, '->', nextAppState, '| Current screen:', currentRoute);

    // Going to background - record timestamp
    if (appStateRef.current === 'active' && nextAppState.match(/inactive|background/)) {
      backgroundTimeRef.current = Date.now();
      console.log('⏸️ App went to background');
    }

    // App came from background to foreground
    if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      const timeInBackground = Date.now() - backgroundTimeRef.current;
      console.log('🔄 App returned from background after', timeInBackground, 'ms');

      // Skip re-auth if on certain screens (like camera screens)
      if (NO_REAUTH_ON_BACKGROUND_SCREENS.includes(currentRoute)) {
        console.log('⏭️ Skipping re-auth - user is on', currentRoute);
        appStateRef.current = nextAppState;
        setAppState(nextAppState);
        return;
      }

      // Only require re-auth if app was in background for more than 3 seconds
      // This prevents camera/permission dialogs from triggering re-auth
      if (timeInBackground < 3000) {
        console.log('⏭️ Skipping re-auth - brief background time');
        appStateRef.current = nextAppState;
        setAppState(nextAppState);
        return;
      }
      
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      const isCurrentlyAuthenticated = !!(token && userData);

      if (isCurrentlyAuthenticated) {
        const pinLoginEnabled = await AsyncStorage.getItem('pinLoginEnabled');
        const biometricEnabled = await AsyncStorage.getItem('biometricEnabled');

        if (pinLoginEnabled === 'true' || biometricEnabled === 'true') {
          console.log('🔐 Re-authentication required - PIN or biometric is set');
          setRequiresReAuth(true);
          navigationRef.current?.reset({
            index: 0,
            routes: [{ name: 'ReAuthenticate' }],
          });
        }
      }
    }

    appStateRef.current = nextAppState;
    setAppState(nextAppState);
  };

  // Periodic auth check - reduced frequency for better performance
  useEffect(() => {
    const interval = setInterval(() => {
      checkAuthStatus();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={async () => {
        const state = navigationRef.current?.getRootState();
        if (state && state.routes.length > 0) {
          const currentRouteName = state.routes[state.index]?.name;
          if (currentRouteName) {
            setCurrentRoute(currentRouteName);
            console.log('📍 Current route:', currentRouteName);
          }

          // Skip auth check for screens that don't require it
          if (BYPASS_AUTH_CHECK_SCREENS.includes(currentRouteName)) {
            console.log('⏭️ Skipping auth check for:', currentRouteName);
            return;
          }
        }

        // Check if user is still authenticated (only for protected screens)
        const token = await AsyncStorage.getItem('authToken');
        const userData = await AsyncStorage.getItem('userData');
        const isCurrentlyAuthenticated = !!(token && userData);
        
        if (!isCurrentlyAuthenticated && isAuthenticated) {
          console.log('🚪 User logged out - redirecting to Welcome');
          setIsAuthenticated(false);
          navigationRef.current?.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
          });
        }
      }}
    >
      <Stack.Navigator 
        initialRouteName={isAuthenticated ? 'ReAuthenticate' : 'Welcome'}
        screenOptions={{
          animationEnabled: true,
        }}
      >
        <Stack.Screen 
          name="Welcome"
          component={WelcomeScreen} 
          options={{headerShown: false}}
        />

        <Stack.Screen 
          name="Login"
          component={LoginPage} 
          options={{headerShown: false}}
        />

        <Stack.Screen 
          name="CreateAccount"
          component={CreateAccount} 
          options={{headerShown: false}}
        />

        <Stack.Screen 
          name="BottomTabs"
          component={BottomTabs} 
          options={{
            headerShown: false,
            gestureEnabled: false,
            animationEnabled: false
          }}
        />

        <Stack.Screen 
          name="Profile"
          component={ProfileScreen} 
          options={{ 
            headerShown: false,
            gestureEnabled: true 
          }}
        />

        <Stack.Screen 
          name="Settings"
          component={SettingsScreen} 
          options={{ 
            headerShown: false,
            gestureEnabled: true 
          }}
        />

        <Stack.Screen 
          name="Help"
          component={HelpSupportScreen} 
          options={{ 
            headerShown: false,
            gestureEnabled: true 
          }}
        />

        <Stack.Screen 
          name="About"
          component={AboutScreen} 
          options={{ 
            headerShown: false,
            gestureEnabled: true 
          }}
        />

        <Stack.Screen 
          name="ForgotPassword"
          component={ForgotPassword} 
          options={{ 
            headerShown: false,
            gestureEnabled: true 
          }}
        />

        <Stack.Screen 
          name="ResetPasswordConfirmation"
          component={ResetPasswordConfirmation} 
          options={{ 
            headerShown: false,
            gestureEnabled: false 
          }}
        />

        <Stack.Screen 
          name="ReAuthenticate"
          component={ReAuthenticateScreen} 
          options={{ 
            headerShown: false,
            gestureEnabled: false,
            animationEnabled: false
          }}
        />

        <Stack.Screen 
          name="ScanVerificationRequest"
          component={ScanVerificationRequest} 
          options={{ 
            headerShown: false,
            gestureEnabled: true,
          }}
        />
        <Stack.Screen 
        name="APISettings" 
        component={APISettings}
        options={{ title: 'Server Settings' }}
/>
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;