import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EmailVerificationScreen = ({ navigation, route }) => {
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, success, error
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    loadEmailAndCheckToken();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const loadEmailAndCheckToken = async () => {
    try {
      // Get email from AsyncStorage or route params
      const registrationEmail = await AsyncStorage.getItem('registrationEmail');
      const token = route?.params?.token;
      
      if (registrationEmail) {
        setEmail(registrationEmail);
      }

      // If there's a token from deep link, verify it automatically
      if (token) {
        verifyEmail(token);
      }
    } catch (error) {
      console.error('Error loading email:', error);
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await fetch(`http://10.218.76.233:3000/api/auth/verify-email?token=${token}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (data.success) {
        setVerificationStatus('success');
        await AsyncStorage.removeItem('registrationEmail');
        
        Alert.alert(
          'Email Verified!',
          'Your email has been verified successfully. You can now log in.',
          [
            {
              text: 'Continue to Login',
              onPress: () => navigation.replace('FirstTimeLogin')
            }
          ]
        );
      } else {
        setVerificationStatus('error');
        Alert.alert('Verification Failed', data.message || 'Email verification failed. Please try again.');
      }
    } catch (error) {
      setVerificationStatus('error');
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    }
  };

  const resendVerificationEmail = async () => {
    if (countdown > 0 || !email) return;

    setIsResending(true);
    
    try {
      const response = await fetch('http://10.218.76.233:3000/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Email Sent', 'Verification email sent! Please check your inbox.');
        setCountdown(60); // 1 minute cooldown
      } else {
        Alert.alert('Failed', data.message || 'Failed to send verification email.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const openEmailApp = () => {
    Linking.openURL('mailto:').catch(() => {
      Alert.alert('Error', 'Unable to open email app');
    });
  };

  const renderSuccessState = () => (
    <View style={styles.centerContent}>
      <View style={styles.iconContainer}>
        <Text style={styles.successIcon}>✅</Text>
      </View>
      <Text style={styles.title}>Email Verified!</Text>
      <Text style={styles.message}>
        Your email has been verified successfully. You can now continue to set up your account.
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.replace('FirstTimeLogin')}
      >
        <Text style={styles.primaryButtonText}>Continue to Login</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.centerContent}>
      <View style={styles.iconContainer}>
        <Text style={styles.errorIcon}>❌</Text>
      </View>
      <Text style={styles.title}>Verification Failed</Text>
      <Text style={styles.message}>
        The verification link may have expired or is invalid. Please request a new verification email.
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.primaryButton, (isResending || countdown > 0) && styles.disabledButton]}
          onPress={resendVerificationEmail}
          disabled={isResending || countdown > 0}
        >
          {isResending ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Email'}
            </Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('CreateAccount')}
        >
          <Text style={styles.secondaryButtonText}>Back to Registration</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPendingState = () => (
    <View style={styles.centerContent}>
      <View style={styles.iconContainer}>
        <Text style={styles.pendingIcon}>📧</Text>
      </View>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.message}>
        We've sent a verification email to:
      </Text>
      <Text style={styles.emailText}>{email}</Text>
      <Text style={styles.subMessage}>
        Please check your inbox and click the verification link to complete your registration.
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={openEmailApp}
        >
          <Text style={styles.primaryButtonText}>Open Email App</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.secondaryButton, (isResending || countdown > 0) && styles.disabledButton]}
          onPress={resendVerificationEmail}
          disabled={isResending || countdown > 0 || !email}
        >
          {isResending ? (
            <ActivityIndicator color="#2563eb" size="small" />
          ) : (
            <Text style={styles.secondaryButtonText}>
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Email'}
            </Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.linkText}>Already Verified? Login</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Didn't receive the email?</Text>
        <Text style={styles.tipsText}>• Check your spam/junk folder</Text>
        <Text style={styles.tipsText}>• Make sure the email address is correct</Text>
        <Text style={styles.tipsText}>• Wait a few minutes for the email to arrive</Text>
        <Text style={styles.tipsText}>• Tap "Resend Email" if needed</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {verificationStatus === 'success' && renderSuccessState()}
      {verificationStatus === 'error' && renderErrorState()}
      {verificationStatus === 'pending' && renderPendingState()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  successIcon: {
    fontSize: 40,
  },
  errorIcon: {
    fontSize: 40,
  },
  pendingIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  subMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emailText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#6b7280',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  linkButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  tipsContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginTop: 32,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
});

export default EmailVerificationScreen;