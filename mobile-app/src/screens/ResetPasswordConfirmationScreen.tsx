import React, { useState } from "react";
import {
  View, Text, TextInput,
  TouchableOpacity, StyleSheet, Alert
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useTranslation } from 'react-i18next';
import { getServerUrl } from '../components/ApiSettings';

type Props = NativeStackScreenProps<RootStackParamList, "ResetPasswordConfirmation">;

const ResetPasswordConfirmation: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { email } = route.params;
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!verificationCode.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert(t('resetPassword.errorTitle'), t('resetPassword.fillAllFields'));
      return;
    }

    if (verificationCode.length !== 5) {
      Alert.alert(t('resetPassword.errorTitle'), t('resetPassword.codeMustBe5Digits'));
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(t('resetPassword.errorTitle'), t('resetPassword.passwordTooShort'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('resetPassword.errorTitle'), t('resetPassword.passwordsDoNotMatch'));
      return;
    }

    setLoading(true);

    try {
      const baseUrl = await getServerUrl();
      const res = await fetch(`${baseUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          verificationCode,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        Alert.alert(
          t('resetPassword.successTitle'),
          t('resetPassword.successMessage'),
          [{ text: t('common.ok'), onPress: () => navigation.navigate("Login") }]
        );
      } else {
        Alert.alert(t('resetPassword.errorTitle'), data.message || t('resetPassword.unableToReset'));
      }
    } catch (err) {
      console.error("Reset password error:", err);
      Alert.alert(t('resetPassword.errorTitle'), t('resetPassword.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForgot = () => {
    navigation.navigate("ForgotPassword");
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('resetPassword.title')}</Text>
        <Text style={styles.subtitle}>
          {t('resetPassword.subtitle', { email })}
        </Text>

        <TextInput
          placeholder={t('resetPassword.verificationCodePlaceholder')}
          value={verificationCode}
          onChangeText={setVerificationCode}
          style={styles.input}
          keyboardType="number-pad"
          maxLength={5}
          placeholderTextColor="#999"
        />

        <TextInput
          placeholder={t('resetPassword.newPasswordPlaceholder')}
          value={newPassword}
          onChangeText={setNewPassword}
          style={styles.input}
          secureTextEntry
          placeholderTextColor="#999"
        />

        <TextInput
          placeholder={t('resetPassword.confirmPasswordPlaceholder')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          secureTextEntry
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? t('resetPassword.resetting') : t('resetPassword.resetButton')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToForgot}
        >
          <Text style={styles.backText}>{t('resetPassword.backToForgot')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ResetPasswordConfirmation;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  container: {
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 50,
    borderRadius: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    marginTop: 20,
    alignItems: "center",
  },
  backText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "600",
  },
});