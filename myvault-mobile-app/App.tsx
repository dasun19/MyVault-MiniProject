import 'react-native-get-random-values';
import React from 'react';
import LanguageScreen from './src/screens/LanguageScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginPage from './src/screens/LoginPage';
import CreateAccount from './src/screens/CreateAccount';
import HomeScreen from './src/screens/HomeScreen';
import EmailVerificationScreen from './src/screens/EmailVerificationPage';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import BottomTabs from './src/navigation/BottomTabs';
import DocumentScreen from './src/screens/DocumentScreen';

// Define navigation types for my screens
export type RootStackParamList = {
  Language: undefined; // For my LanguageScreen
  Welcome: undefined; // For my WelcomeScreen
  Signin: undefined; // For my SigninScreen
  CreateAccount: undefined; // For my CreateAccountScreen
  Home: undefined;
  Document: undefined;
  Login: undefined;
  FirstTimeLogin: undefined;
  EmailVerification: undefined;
  BottomTabs: undefined;
};

// Create a stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();


const App = () =>{
  return (
    // Navigation container to manage navigation state
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Language">
        <Stack.Screen name = "Language"
          component={LanguageScreen} 
          options = {{ headerShown: false}}
          />
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
          options = {{headerShown: false}}/>

          <Stack.Screen name = "Document"
          component={DocumentScreen} 
          options = {{headerShown: false}}/>

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
