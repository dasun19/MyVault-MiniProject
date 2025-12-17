import React, { useState } from "react";
import {
  View, Text, TextInput,
  TouchableOpacity, StyleSheet, Alert
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "ResetPassword">;

const ResetPassword: React.FC<Props> = ({ navigation, route }) => {
  // Get email from route params
  const { email } = route.params || {};
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    // Validation
    if (!otp.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (otp.length !== 6) {
      Alert.alert("Error", "OTP must be 6 digits.");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (!email) {
      Alert.alert("Error", "Email not found. Please start over.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://10.143.59.233:3000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email,
          otp,
          newPassword 
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        Alert.alert(
          "Success", 
          "Password reset successful! You can now login with your new password.",
          [{ text: "OK", onPress: () => navigation.navigate("Login") }]
        );
      } else {
        Alert.alert("Error", data.message || "Unable to reset password.");
      }

    } catch (err) {
      console.error("Reset password error:", err);
      Alert.alert("Error", "Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      Alert.alert("Error", "Email not found.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://10.143.59.233:3000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        Alert.alert("Success", "New OTP sent to your email.");
      } else {
        Alert.alert("Error", "Unable to resend OTP.");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      Alert.alert("Error", "Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit OTP sent to {email}
        </Text>

        <TextInput
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChangeText={setOtp}
          style={styles.input}
          keyboardType="number-pad"
          maxLength={6}
          placeholderTextColor="#999"
        />

        <TextInput
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          style={styles.input}
          secureTextEntry
          placeholderTextColor="#999"
        />

        <TextInput
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          secureTextEntry
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.5 }]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Resetting..." : "Reset Password"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResendOTP}
          disabled={loading}
        >
          <Text style={styles.resendText}>Didn't receive OTP? Resend</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  mainContainer: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#fff" 
  },
  container: { 
    padding: 20, 
    backgroundColor: "#fff", 
    marginTop: 50,
    borderRadius: 15
  },
  title: { 
    fontSize: 28, 
    fontWeight: "700", 
    marginBottom: 10 
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 10,
    marginTop: 10
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  resendButton: {
    marginTop: 20,
    alignItems: "center"
  },
  resendText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "600"
  }
});