import React, { useState } from "react";
import {
  View, Text, TextInput,
  TouchableOpacity, StyleSheet, Alert
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "ForgotPassword">;

const ForgotPassword: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Email is required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://10.143.59.233:3000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        Alert.alert("Error", "Invalid server response.");
        setLoading(false);
        return;
      }

      if (res.ok && data.success) {
        Alert.alert(
          "Success",
          "Verification code sent to your email!",
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate to ResetPasswordConfirmation with email
                navigation.navigate("ResetPasswordConfirmation", { email });
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", data.message || "Unable to send verification code.");
      }

    } catch (err) {
      console.error("Forgot password error:", err);
      Alert.alert("Error", "Network error. Check your server or connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>

      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.5 }]}
        onPress={handleSend}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Sending..." : "Send Verification Code"}
        </Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  mainContainer: { flex: 1, padding: 20, backgroundColor: "#fff",  },
  container: {  padding: 20, backgroundColor: "#ffff", marginTop: 100 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
