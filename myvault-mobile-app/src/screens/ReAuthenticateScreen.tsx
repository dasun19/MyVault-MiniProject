import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics from 'react-native-biometrics';
import CryptoJS from 'crypto-js';
import { Lock, SquareAsterisk, Fingerprint } from 'lucide-react-native';
import { useTranslation } from 'react-i18next'; 

interface ReAuthenticateScreenProps {
  navigation: any;
}

const ReAuthenticateScreen: React.FC<ReAuthenticateScreenProps> = ({ navigation }) => {
  const { t } = useTranslation(); 
  
  const [pin, setPin] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [biometricSupported, setBiometricSupported] = useState<boolean>(false);
  const [biometricTypes, setBiometricTypes] = useState<string[]>([]);
  const [hasPinSetup, setHasPinSetup] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    try {
      const pinLoginEnabled = await AsyncStorage.getItem('pinLoginEnabled');
      const biometricEnabled = await AsyncStorage.getItem('biometricEnabled');
      
      setHasPinSetup(pinLoginEnabled === 'true');

      const rnBiometrics = new ReactNativeBiometrics();
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      
      setBiometricSupported(available && biometricEnabled === 'true');
      if (available && biometryType) {
        setBiometricTypes([biometryType]);
      }

      if (available && biometricEnabled === 'true') {
        console.log('👆 Attempting automatic biometric authentication');
        setTimeout(() => {
          handleBiometricAuth();
        }, 500);
      }
    } catch (error) {
      console.error('❌ Initialization error:', error);
    }
  };

  const hashPin = async (pin: string): Promise<string> => {
    return CryptoJS.SHA256(pin).toString();
  };

  const verifyPin = async (inputPin: string, storedHash: string): Promise<boolean> => {
    const inputHash = await hashPin(inputPin);
    return inputHash === storedHash;
  };

  const handlePinAuth = async () => {
    if (!pin || pin.length !== 6) {
      setErrors({ pin: t('reAuthenticate.errors.pinRequired') });
      return;
    }

    setIsLoading(true);

    try {
      const storedPin = await AsyncStorage.getItem('userPin');
      if (!storedPin) {
        setErrors({ pin: t('reAuthenticate.errors.pinNotFound') });
        setIsLoading(false);
        return;
      }

      const isValidPin = await verifyPin(pin, storedPin);
      if (!isValidPin) {
        setErrors({ pin: t('reAuthenticate.errors.pinInvalid') });
        setPin('');
        setIsLoading(false);
        return;
      }

      console.log('✅ PIN authentication successful');
      Alert.alert(t('reAuthenticate.successTitle'), t('reAuthenticate.successMessage'), [
        {
          text: t('common.ok'),
          onPress: () => {
            navigation.replace('BottomTabs');
          },
        },
      ]);
    } catch (error) {
      setErrors({ pin: t('reAuthenticate.errors.pinAuthFailed') });
      console.error('❌ PIN auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    console.log('👆 Attempting biometric authentication');
    try {
      const rnBiometrics = new ReactNativeBiometrics();
      const { available } = await rnBiometrics.isSensorAvailable();

      if (!available) {
        Alert.alert(
          t('reAuthenticate.biometricAuth'),
          t('reAuthenticate.biometricNotAvailable'),
          [{ text: t('common.ok'), onPress: () => console.log('OK') }]
        );
        return;
      }

      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: t('login.biometricPrompt'),
      });

      if (success) {
        console.log('✅ Biometric authentication successful');
        Alert.alert(t('reAuthenticate.successTitle'), t('reAuthenticate.successMessage'), [
          {
            text: t('common.ok'),
            onPress: () => {
              navigation.replace('BottomTabs');
            },
          },
        ]);
      } else {
        console.log('❌ Biometric authentication failed');
      }
    } catch (error) {
      console.error('❌ Biometric error:', error);
    }
  };

  const getBiometricTypeText = (): string => {
    return biometricTypes.includes('FaceID') ? t('login.faceId') : t('login.fingerprint');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Lock size={40} color='#2563eb' />
          </View>
          <Text style={styles.title}>{t('reAuthenticate.title')}</Text>
          <Text style={styles.subtitle}>
            {t('reAuthenticate.subtitle')}
          </Text>
        </View>

        <View style={styles.form}>
          {/* Biometric Option */}
          {biometricSupported && (
            <>
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricAuth}
                disabled={isLoading}
              >
                <View style={styles.biometricContent}>
                  <Fingerprint size={35} color="#2563eb" />
                  <View style={styles.biometricText}>
                    <Text style={styles.biometricTitle}>
                      {t('reAuthenticate.useBiometric', { type: getBiometricTypeText() })}
                    </Text>
                    <Text style={styles.biometricSubtitle}>
                      {t('reAuthenticate.biometricSubtitle')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {hasPinSetup && (
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t('reAuthenticate.or')}</Text>
                  <View style={styles.dividerLine} />
                </View>
              )}
            </>
          )}

          {/* PIN Option */}
          {hasPinSetup && (
            <View style={styles.pinContainer}>
              <Text style={styles.label}>{t('reAuthenticate.enterPin')}</Text>
              <TextInput
                style={[styles.input, errors.pin && styles.inputError]}
                placeholder={t('reAuthenticate.pinPlaceholder')}
                value={pin}
                onChangeText={(text) => {
                  setPin(text);
                  if (errors.pin) {
                    setErrors({});
                  }
                }}
                keyboardType="numeric"
                maxLength={6}
                secureTextEntry
                editable={!isLoading}
              />
              {errors.pin && <Text style={styles.errorText}>{errors.pin}</Text>}

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handlePinAuth}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? t('reAuthenticate.authenticating') : t('reAuthenticate.authenticateWithPin')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* No security methods set up */}
          {!hasPinSetup && !biometricSupported && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                {t('reAuthenticate.noSecurityMethods')}
              </Text>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => {
                  navigation.replace('Login');
                }}
              >
                <Text style={styles.submitButtonText}>{t('reAuthenticate.logIn')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
  lockIcon: {
    fontSize: 40,
    color: '#2563eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  biometricButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  biometricContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  biometricIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  biometricText: {
    flex: 1,
  },
  biometricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  biometricSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d1d5db',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  pinContainer: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    color: '#1f2937',
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: 8,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  warningContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  warningText: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
});

export default ReAuthenticateScreen;