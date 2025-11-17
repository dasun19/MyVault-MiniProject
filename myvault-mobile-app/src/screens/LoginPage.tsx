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
  Switch,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics from 'react-native-biometrics';
import CryptoJS from 'crypto-js';

type LoginMode = 'idNumber' | 'pin' | 'biometric';
type FlowStep = 'login' | 'security-setup' | 'complete';

interface LoginScreenProps {
  navigation: any;
}

const validateToken = async (token: string | null): Promise<boolean> => {
  if (!token) {
    return false;
  }

  try {
    const response = await fetch('http://10.143.59.233:3000/api/auth/validate-token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return true;
    } else if (response.status === 401) {
      console.warn('Token validation failed: 401 Unauthorized');
      return false;
    } else {
      console.error('Server error during token validation:', response.status);
      return true; // Don't invalidate token for server errors
    }
  } catch (error) {
    console.error('Network error during token validation:', error);
    return true; // Don't invalidate token for network errors
  }
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  // State for flow control
  const [flowStep, setFlowStep] = useState<FlowStep>('login');
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState<boolean>(false);
  const [loginMode, setLoginMode] = useState<LoginMode>('idNumber');

  // Form data
  const [idNumber, setIdNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // UI states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // User data
  const [user, setUser] = useState<any>(null);

  // Biometric states
  const [biometricSupported, setBiometricSupported] = useState<boolean>(false);
  const [biometricTypes, setBiometricTypes] = useState<string[]>([]);
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);

  // Local PIN state variables
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [storedPinHash, setStoredPinHash] = useState<string>('');

  // Security setup options
  const [securityOptions, setSecurityOptions] = useState({
    enablePinLogin: true,
    enableBiometric: false,
  });

  useEffect(() => {
    initializeApp();
  }, []);

  // PIN hashing utilities
  const hashPin = async (pin: string): Promise<string> => {
    return CryptoJS.SHA256(pin).toString();
  };

  const verifyPin = async (inputPin: string, storedHash: string): Promise<boolean> => {
    const inputHash = await hashPin(inputPin);
    return inputHash === storedHash;
  };

  const initializeApp = async (): Promise<void> => {
    try {
      console.log('🔄 Starting app initialization...');
      
      // Clear everything for debugging - remove this line once it's working
      // await AsyncStorage.clear();
      
      const securitySetupComplete = await AsyncStorage.getItem('securitySetupComplete');
      const userData = await AsyncStorage.getItem('userData');
      const storedPin = await AsyncStorage.getItem('userPin');
      const token = await AsyncStorage.getItem('authToken');
      const biometricPref = await AsyncStorage.getItem('biometricEnabled');

      console.log('📱 Storage values:', {
        securitySetupComplete,
        hasUserData: !!userData,
        hasStoredPin: !!storedPin,
        hasToken: !!token,
        biometricPref,
      });

      // Always check biometric support first
      await checkBiometricSupport();

      // If no security setup completed, this is first time
      if (securitySetupComplete !== 'true') {
        console.log('✨ First time login detected');
        setIsFirstTimeLogin(true);
        setLoginMode('idNumber');
        return;
      }

      // Security setup is complete, determine available methods
      console.log('🔐 Security setup complete, checking available methods...');
      setIsFirstTimeLogin(false);

      // Check what security methods are available
      const hasPinSetup = !!storedPin;
      const hasBiometricSetup = biometricPref === 'true' && biometricSupported;

      console.log('🔍 Available security methods:', {
        hasPinSetup,
        hasBiometricSetup,
        biometricSupported
      });

      if (hasBiometricSetup) {
        console.log('👆 Setting biometric login mode');
        setBiometricEnabled(true);
        setLoginMode('biometric');
      } else if (hasPinSetup) {
        console.log('🔢 Setting PIN login mode');
        setLoginMode('pin');
      } else {
        console.log('📧 No security methods available, using idNumber');
        setLoginMode('idNumber');
      }

      // Validate existing token if present
      if (token && userData) {
        const isTokenValid = await validateToken(token);
        if (!isTokenValid) {
          console.log('🚫 Invalid token detected, logging out');
          await handleLogout();
          Alert.alert('Session Expired', 'Please log in again.');
        }
      }

    } catch (error) {
      console.error('❌ Initialization error:', error);
      setIsFirstTimeLogin(true);
      setLoginMode('idNumber');
    }
  };

  const checkBiometricSupport = async (): Promise<void> => {
    try {
      const rnBiometrics = new ReactNativeBiometrics();
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      
      console.log('👆 Biometric check:', { available, biometryType });
      
      setBiometricSupported(available);
      if (available && biometryType) {
        setBiometricTypes([biometryType]);
      }
    } catch (error) {
      console.log('❌ Biometric check failed:', error);
      setBiometricSupported(false);
    }
  };

  const handleChange = (field: string, value: string): void => {
    if (field === 'idNumber') setIdNumber(value);
    if (field === 'password') setPassword(value);

    // Clear errors
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (loginMode === 'idNumber' || isFirstTimeLogin) {
      if (!idNumber.trim()) {
        newErrors.idNumber = 'National ID number is required';
      } else if (!/^\d{9}[vVxX]$|^\d{12}$/.test(idNumber)) {
        newErrors.idNumber = 'Please enter a valid Sri Lankan National ID number';
      }

      if (!password.trim()) {
        newErrors.password = 'Password is required';
      } else if (password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (): Promise<void> => {
    console.log('🔑 Login attempt with mode:', loginMode);

    if (loginMode === 'biometric') {
      handleBiometricLogin();
      return;
    }

    if (loginMode === 'pin') {
      handlePinLogin();
      return;
    }

    // ID/password login
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const endpoint = 'http://10.143.59.233:3000/api/auth/login';
      const body = { idNumber, password };

      console.log('📡 Making login request to:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setErrors({ submit: 'Invalid ID number or password' });
        } else if (response.status === 429) {
          setErrors({ submit: 'Too many attempts. Please try again later.' });
        } else {
          setErrors({ submit: 'Server error. Please try again.' });
        }
        return;
      }

      const data = await response.json();
      console.log('✅ Login successful:', data.success);

      if (data?.success) {
        setUser(data.user);
        await AsyncStorage.setItem('authToken', data.token || '');
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));

        if (isFirstTimeLogin) {
          console.log('👆 First time login, showing security setup');
          setFlowStep('security-setup');
        } else {
          console.log('🚀 Navigating to BottomTabs');
          navigation.replace('BottomTabs');
        }
      } else {
        setErrors({ submit: data?.message || 'Login failed' });
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setErrors({ submit: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async (): Promise<void> => {
    console.log('👆 Attempting biometric login');
    try {
      const rnBiometrics = new ReactNativeBiometrics();
      const { available } = await rnBiometrics.isSensorAvailable();

      if (!available) {
        Alert.alert(
          'Biometric Authentication',
          'Biometric authentication is not available on this device.',
          [{ text: 'OK', onPress: () => setLoginMode('pin') }]
        );
        return;
      }

      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Confirm your identity to access MyVault',
      });

      if (success) {
        console.log('✅ Biometric authentication successful');
        navigation.replace('BottomTabs');
      } else {
        console.log('❌ Biometric authentication failed');
        Alert.alert('Authentication Failed', 'Biometric authentication was cancelled or failed.');
      }
    } catch (error) {
      console.error('❌ Biometric error:', error);
      Alert.alert('Biometric Error', 'Biometric authentication failed');
    }
  };

  const handlePinLogin = async (): Promise<void> => {
    console.log('🔢 Attempting PIN login');
    if (!pin || pin.length !== 6) {
      setErrors({ pin: 'Please enter your 6-digit PIN' });
      return;
    }

    try {
      const storedPin = await AsyncStorage.getItem('userPin');
      if (!storedPin) {
        setErrors({ pin: 'PIN not found. Please login with email.' });
        return;
      }

      const isValidPin = await verifyPin(pin, storedPin);
      if (!isValidPin) {
        setErrors({ pin: 'Invalid PIN' });
        return;
      }

      console.log('✅ PIN authentication successful');
      navigation.replace('BottomTabs');
    } catch (error) {
      setErrors({ pin: 'PIN authentication failed' });
      console.error('❌ PIN login error:', error);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        'authToken', 
        'userData', 
        'userPin', 
        'biometricEnabled', 
        'securitySetupComplete',
        'pinLoginEnabled'
      ]);
      setUser(null);
      setFlowStep('login');
      setLoginMode('idNumber');
      setPin('');
      setConfirmPin('');
      setIdNumber('');
      setPassword('');
      setBiometricEnabled(false);
      setIsFirstTimeLogin(true);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  const handlePinCreation = async (): Promise<boolean> => {
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setErrors({ pin: 'PIN must be exactly 6 digits' });
      return false;
    }

    if (pin !== confirmPin) {
      setErrors({ confirmPin: 'PINs do not match' });
      return false;
    }

    const hashedPin = await hashPin(pin);
    await AsyncStorage.setItem('userPin', hashedPin);
    console.log('✅ PIN created and stored');
    return true;
  };

  const setupBiometric = async (): Promise<boolean> => {
    try {
      const rnBiometrics = new ReactNativeBiometrics();
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Set up biometric authentication for MyVault',
      });

      if (success) {
        console.log('✅ Biometric setup successful');
        return true;
      } else {
        Alert.alert('Setup Failed', 'Biometric authentication setup was cancelled or failed.');
        return false;
      }
    } catch (error) {
      console.error('❌ Biometric setup failed:', error);
      Alert.alert('Setup Failed', 'Failed to setup biometric authentication.');
      return false;
    }
  };

  const handleSecuritySetup = async (): Promise<void> => {
    console.log('🔐 Starting security setup...');
    setIsLoading(true);

    try {
      // Create PIN if enabled
      if (securityOptions.enablePinLogin) {
        const pinCreated = await handlePinCreation();
        if (!pinCreated) {
          setIsLoading(false);
          return;
        }
      }

      let biometricSuccess = true;
      if (securityOptions.enableBiometric && biometricSupported) {
        biometricSuccess = await setupBiometric();
      }

      // Store all settings
      await AsyncStorage.setItem('pinLoginEnabled', securityOptions.enablePinLogin.toString());
      await AsyncStorage.setItem('biometricEnabled', (securityOptions.enableBiometric && biometricSuccess).toString());
      await AsyncStorage.setItem('securitySetupComplete', 'true');

      console.log('✅ Security setup complete');
      setFlowStep('complete');
      setTimeout(() => {
        navigation.replace('BottomTabs');
      }, 2000);
    } catch (error) {
      console.error('❌ Security setup error:', error);
      setErrors({ submit: 'Error during security setup. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (newMode: LoginMode): void => {
    console.log('🔄 Changing login mode to:', newMode);
    setLoginMode(newMode);
    setErrors({});
    setPin('');
    if (newMode !== 'idNumber') {
      setIdNumber('');
      setPassword('');
    }
  };

  const getBiometricTypeText = (): string => {
    return biometricTypes.includes('FaceID') ? 'Face ID' : 'Fingerprint';
  };

  // Debug function - add this button temporarily
  // const clearStorage = async () => {
  //   await AsyncStorage.clear();
  //   Alert.alert('Storage Cleared', 'All data cleared. Restart the app.');
  // };

  const renderLoginStep = (): JSX.Element => (
  <KeyboardAvoidingView
    style={styles.container}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  >
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isFirstTimeLogin ? 'Welcome to MyVault' : 'Welcome Back'}
        </Text>
        <Text style={styles.subtitle}>
          {isFirstTimeLogin
            ? 'Sign in to complete your account setup'
            : 'Sign in to access your secure vault'}
        </Text>
      </View>

      {/* DEBUG BUTTON - Remove this once it's working
      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: '#ef4444', marginHorizontal: 24 }]}
        onPress={clearStorage}
      >
        <Text style={styles.submitButtonText}>Clear Storage (Debug)</Text>
      </TouchableOpacity> */}

      {/* Mode Switcher - Only for returning users */}
      {!isFirstTimeLogin && (
        <View style={styles.methodSwitcher}>
          <TouchableOpacity
            style={[styles.modeButton, loginMode === 'pin' && styles.activeModeButton]}
            onPress={() => handleModeChange('pin')}
          >
            <Text style={[styles.modeText, loginMode === 'pin' && styles.activeModeText]}>
              PIN
            </Text>
          </TouchableOpacity>

          {biometricSupported && (
            <TouchableOpacity
              style={[styles.modeButton, loginMode === 'biometric' && styles.activeModeButton]}
              onPress={() => handleModeChange('biometric')}
            >
              <Text style={[styles.modeText, loginMode === 'biometric' && styles.activeModeText]}>
                Biometric
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.form}>
        {/* ID Number Input */}
        {(isFirstTimeLogin || loginMode === 'idNumber') && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>National ID Number</Text>
            <TextInput
              style={[styles.input, errors.idNumber && styles.inputError]}
              placeholder="Enter your National ID number"
              value={idNumber}
              onChangeText={(text) => handleChange('idNumber', text)}
              autoCapitalize="characters"
              editable={!isLoading}
            />
            {errors.idNumber && <Text style={styles.errorText}>{errors.idNumber}</Text>}
          </View>
          
        )}

        {/* PIN Input */}
        {loginMode === 'pin' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Enter Your 6-Digit PIN</Text>
            <TextInput
              style={[styles.input, errors.pin && styles.inputError]}
              placeholder="Enter your PIN"
              value={pin}
              onChangeText={setPin}
              keyboardType="numeric"
              maxLength={6}
              secureTextEntry
              editable={!isLoading}
            />
            {errors.pin && <Text style={styles.errorText}>{errors.pin}</Text>}
          </View>
        )}

        {/* Password Input */}
        {(isFirstTimeLogin || loginMode === 'idNumber') && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, errors.password && styles.inputError]}
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => handleChange('password', text)}
                secureTextEntry={!showPassword}
                maxLength={20}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>

              

            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>
        )}

        {/* Biometric Display */}
        {loginMode === 'biometric' && (
          <View style={styles.biometricContainer}>
            <View style={styles.biometricIcon}>
              <Text style={styles.biometricIconText}>🔐</Text>
            </View>
            <Text style={styles.biometricTitle}>Biometric Authentication</Text>
            <Text style={styles.biometricSubtitle}>
              Use your {getBiometricTypeText().toLowerCase()} to securely access your account
            </Text>
          </View>
        )}

        {/* Submit Button */}
        {errors.submit && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errors.submit}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Signing In...' : 
             loginMode === 'biometric' ? 'Authenticate' : 
             loginMode === 'pin' ? 'Sign In with PIN' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        {/* Create Account Link */}
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('CreateAccount')}
        >
          <Text style={styles.linkText}>
            Don't have an account? <Text style={styles.linkTextBold}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style = {styles.linkButton} onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={styles.forgetPasswordText}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
);

  const renderSecuritySetup = (): JSX.Element => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.shieldIcon}>🔒</Text>
        </View>
        <Text style={styles.title}>Secure Your Account</Text>
        <Text style={styles.subtitle}>
          Choose your preferred security methods for future logins
        </Text>
      </View>

      <View style={styles.securityOptions}>
        <View style={styles.optionCard}>
          <View style={styles.optionHeader}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionIcon}>🔢</Text>
              <View>
                <Text style={styles.optionTitle}>PIN Login</Text>
                <Text style={styles.optionDescription}>Quick access with your 6-digit PIN</Text>
              </View>
            </View>
            <Switch
              value={securityOptions.enablePinLogin}
              onValueChange={(value) =>
                setSecurityOptions((prev) => ({ ...prev, enablePinLogin: value }))
              }
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor={securityOptions.enablePinLogin ? '#ffffff' : '#f3f4f6'}
              disabled={isLoading}
            />
          </View>

          {securityOptions.enablePinLogin && (
            <View style={styles.pinSetupContainer}>
              <Text style={styles.sectionTitle}>Create Your 6-Digit PIN</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Enter PIN</Text>
                <TextInput
                  style={[styles.input, errors.pin && styles.inputError]}
                  placeholder="Enter 6-digit PIN"
                  value={pin}
                  onChangeText={setPin}
                  keyboardType="numeric"
                  maxLength={6}
                  secureTextEntry
                />
                {errors.pin && <Text style={styles.errorText}>{errors.pin}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm PIN</Text>
                <TextInput
                  style={[styles.input, errors.confirmPin && styles.inputError]}
                  placeholder="Confirm 6-digit PIN"
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  keyboardType="numeric"
                  maxLength={6}
                  secureTextEntry
                />
                {errors.confirmPin && <Text style={styles.errorText}>{errors.confirmPin}</Text>}
              </View>
            </View>
          )}
        </View>

        <View style={styles.optionCard}>
          <View style={styles.optionHeader}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionIcon}>👆</Text>
              <View>
                <Text style={styles.optionTitle}>{getBiometricTypeText()} Login</Text>
                <Text style={styles.optionDescription}>
                  {biometricSupported
                    ? `Use ${getBiometricTypeText().toLowerCase()} for secure access`
                    : 'Not available on this device'}
                </Text>
              </View>
            </View>
            <Switch
              value={securityOptions.enableBiometric}
              onValueChange={(value) =>
                setSecurityOptions((prev) => ({ ...prev, enableBiometric: value }))
              }
              disabled={!biometricSupported || isLoading}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor={securityOptions.enableBiometric ? '#ffffff' : '#f3f4f6'}
            />
          </View>
        </View>
      </View>

      {errors.submit && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errors.submit}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setFlowStep('login')}
          disabled={isLoading}
        >
          <Text style={styles.secondaryButtonText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSecuritySetup}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Setting Up...' : 'Complete Setup'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderComplete = (): JSX.Element => (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <View style={styles.iconContainer}>
          <Text style={styles.successIcon}>✅</Text>
        </View>
        <Text style={styles.title}>Setup Complete!</Text>
        <Text style={styles.message}>
          Your account is now secure and ready to use.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.replace('BottomTabs')}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      {flowStep === 'login' && renderLoginStep()}
      {flowStep === 'security-setup' && renderSecuritySetup()}
      {flowStep === 'complete' && renderComplete()}
    </>
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
  shieldIcon: {
    fontSize: 40,
    color: '#2563eb',
  },
  successIcon: {
    fontSize: 50,
    color: '#10b981',
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
  methodSwitcher: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 32,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeModeButton: {
    backgroundColor: '#2563eb',
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeModeText: {
    color: '#ffffff',
  },
  form: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
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
    fontSize: 16,
    color: '#1f2937',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  eyeText: {
    fontSize: 18,
    color: '#6b7280',
  },
  biometricContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  biometricIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  biometricIconText: {
    fontSize: 32,
  },
  biometricTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  biometricSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  securityOptions: {
    gap: 16,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    fontSize: 24,
    color: '#2563eb',
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  pinSetupContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  warningContainer: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 24,
    marginBottom: 24,
  },
  warningIcon: {
    fontSize: 20,
    color: '#92400e',
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  tipsContainer: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#1e40af',
    marginBottom: 4,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
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
  forgotPasswordButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#6b7280',
  },
  forgetPasswordText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
  },
  linkTextBold: {
    color: '#2563eb',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 24,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    minWidth: 200,
    borderRadius: 5,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#6b7280',
    borderRadius: 5,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  successContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#166534',
    marginBottom: 4,
  },
  forgotText: {
  color: "#2563eb",
  marginBottom: 16,
  textAlign: "right",
  fontWeight: "600"
},

});

export default LoginScreen;