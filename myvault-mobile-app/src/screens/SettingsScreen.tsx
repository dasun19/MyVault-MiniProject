import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@app_language';

const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const [isSinhala, setIsSinhala] = useState(i18n.language === 'si');

  const toggleLanguage = async () => {
    try {
      const newLanguage = isSinhala ? 'en' : 'si';
      await i18n.changeLanguage(newLanguage);
      await AsyncStorage.setItem(LANGUAGE_KEY, newLanguage);
      setIsSinhala(!isSinhala);
      
      Alert.alert(
        t('common.confirm'),
        `Language changed to ${newLanguage === 'si' ? 'Sinhala' : 'English'}`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to change language');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings.title')}</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>{t('settings.language')}</Text>
          <Text style={styles.settingValue}>
            {isSinhala ? t('settings.sinhala') : t('settings.english')}
          </Text>
        </View>
        
        <Switch
          value={isSinhala}
          onValueChange={toggleLanguage}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isSinhala ? '#2196F3' : '#f4f3f4'}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
  },
});

export default SettingsScreen;