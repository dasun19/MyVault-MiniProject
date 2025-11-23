import 'react-native-get-random-values';
import React, { useState, useEffect } from 'react';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginPage from './src/screens/LoginPage';
import CreateAccount from './src/screens/CreateAccount';
import HomeScreen from './src/screens/HomeScreen';
import EmailVerificationScreen from './src/screens/EmailVerificationPage';
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


export type TabParamList = {
  Home: undefined;
  'My Documents': undefined;
  More: undefined;
};
// Define navigation types for my screens
export type RootStackParamList = {
  Welcome: undefined;
  Signin: undefined;
  CreateAccount: undefined;
  Home: undefined;
  Login: undefined;
  FirstTimeLogin: undefined;
  EmailVerification: undefined;
  BottomTabs: NavigatorScreenParams<TabParamList>;
  More: undefined;
  Profile: undefined;
  Settings: undefined;
  Help: undefined;
  About: undefined;
  ForgotPassword: undefined;
  ResetPasswordConfirmation: { email: string };
  ReAuthenticate: undefined;
};

// Create a stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();


const App = () =>{
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [appState, setAppState] = useState<AppStateStatus>('active');
  const [requiresReAuth, setRequiresReAuth] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<string>('Welcome');
  const navigationRef = React.useRef<any>(null);
  const appStateRef = React.useRef<AppStateStatus>('active');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      // Only authenticated if BOTH token and userData exist
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
  }, []);

  // Add back button listener to prevent back from ReAuthenticate
  useEffect(() => {
    const backButtonListener = BackHandler.addEventListener('hardwareBackPress', () => {
      // If on ReAuthenticate screen, prevent back button
      if (currentRoute === 'ReAuthenticate') {
        console.log('🔐 Back button blocked on ReAuthenticate screen');
        return true; // Prevent default back behavior
      }
      return false; // Allow default back behavior
    });

    return () => {
      backButtonListener.remove();
    };
  }, [currentRoute]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    console.log('📱 App state changed:', appStateRef.current, '->', nextAppState);

    // App came from background to foreground
    if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('🔄 App returned from background - checking auth');
      
      // Check if user is still authenticated
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      const isCurrentlyAuthenticated = !!(token && userData);

      if (isCurrentlyAuthenticated) {
        // User is authenticated, check if PIN or biometric is set
        const pinLoginEnabled = await AsyncStorage.getItem('pinLoginEnabled');
        const biometricEnabled = await AsyncStorage.getItem('biometricEnabled');

        if (pinLoginEnabled === 'true' || biometricEnabled === 'true') {
          console.log('🔐 Re-authentication required - PIN or biometric is set');
          setRequiresReAuth(true);
          // Reset navigation stack to ReAuthenticate screen (prevents back button)
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

  // Add listener to track when user logs out (auth state changes)
  useEffect(() => {
    const interval = setInterval(() => {
      checkAuthStatus();
    }, 1000);
    
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
    // Navigation container to manage navigation state
    <NavigationContainer
      ref={navigationRef}
      onStateChange={async () => {
        // Track current route
        const state = navigationRef.current?.getRootState();
        if (state && state.routes.length > 0) {
          const currentRouteName = state.routes[state.index]?.name;
          if (currentRouteName) {
            setCurrentRoute(currentRouteName);
            console.log('📍 Current route:', currentRouteName);
          }
        }

        // Check if user is still authenticated
        const token = await AsyncStorage.getItem('authToken');
        const userData = await AsyncStorage.getItem('userData');
        const isCurrentlyAuthenticated = !!(token && userData);
        
        if (!isCurrentlyAuthenticated && isAuthenticated) {
          // User logged out, update state and force navigate to Welcome
          setIsAuthenticated(false);
          navigationRef.current?.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
          });
        }
      }}
    >
      <Stack.Navigator 
        initialRouteName={isAuthenticated ? 'BottomTabs' : 'Welcome'}
        screenOptions={{
          animationEnabled: true,
        }}
      >
        <Stack.Screen name = "Welcome"
          component={WelcomeScreen} 
          options = {{headerShown: false}}/>


        <Stack.Screen name = "Login"
          component={LoginPage} 
          options = {{headerShown: false}}/>

        <Stack.Screen name = "CreateAccount"
          component={CreateAccount} 
          options = {{headerShown: false}}/>

          <Stack.Screen name = "EmailVerification"
          component={EmailVerificationScreen} 
          options = {{headerShown: false}}/>

        <Stack.Screen name = "BottomTabs"
          component={BottomTabs} 
          options = {{
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
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
