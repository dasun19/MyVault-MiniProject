import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// SIMPLE: Export this function to get the URL
// ============================================
export const getServerUrl = async (): Promise<string> => {
  try {
    const url = await AsyncStorage.getItem('@server_url');
    return url || 'http://10.25.233.234:3000'; // Default URL
  } catch (error) {
    return 'http://10.25.233.234:3000'; // Fallback
  }
};

// ============================================
// Settings Component
// ============================================
const APISettings: React.FC = () => {
  const [serverUrl, setServerUrl] = useState<string>('');

  useEffect(() => {
    loadUrl();
  }, []);

  const loadUrl = async () => {
    const url = await getServerUrl();
    setServerUrl(url);
  };

  const saveUrl = async () => {
    if (!serverUrl.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    try {
      await AsyncStorage.setItem('@server_url', serverUrl.trim());
      Alert.alert('Success', 'URL saved!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Server URL</Text>
      
      <TextInput
        style={styles.input}
        value={serverUrl}
        onChangeText={setServerUrl}
        placeholder="http://192.168.1.100:3000"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TouchableOpacity style={styles.button} onPress={saveUrl}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>

      <Text style={styles.help}>
        💡 Enter your computer's IP address
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  help: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default APISettings;