import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LogoutScreen = ({ navigation }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Fetch user data from AsyncStorage when component mounts
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              // Clear all user-related data from local storage
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('userData');
              await AsyncStorage.removeItem('pinLoginEnabled');
              await AsyncStorage.removeItem('biometricEnabled');
              await AsyncStorage.removeItem('securitySetupComplete');

              // Navigate back to the main login screen
              navigation.replace('Login');
            } catch (error) {
              console.error('Logout error:', error);
              // Even if there's an error, still try to navigate back
              navigation.replace('Login');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>👤</Text>
        </View>
        <Text style={styles.title}>Account Details</Text>
        
        {userData ? (
          <View style={styles.accountDetails}>
             <Text style={styles.detailText}>
              Name: {userData.fullName || 'N/A'}
                </Text>
                <Text style={styles.detailText}>
              National ID number: {userData.idNumber || 'N/A'}
                </Text>
            <Text style={styles.detailText}>
              Email: {userData.email || 'N/A'}
            </Text>

           
            <Text style={styles.detailText}>
              Last Login: {userData.createdAt ? new Date(userData.createdAt).toLocaleString() : 'N/A'}
            </Text>
          </View>
        ) : (
          <Text style={styles.subtitle}>
            Loading account details...
          </Text>
        )}

        {isLoggingOut && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.subtitle}>Logging out...</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, isLoggingOut && styles.buttonDisabled]}
        onPress={handleLogout}
        disabled={isLoggingOut}
      >
        <Text style={styles.buttonText}>
          {isLoggingOut ? 'Logging Out...' : 'Log Out'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  accountDetails: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  detailText: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 8,
  },
  loadingContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 5,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '50%',
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LogoutScreen;