import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "ResetPassword">;

const ResetPasswordScreen: React.FC<Props> = ({ route, navigation }) => {
  const { token } = route.params;
  const [password, setPassword] = useState("");

  const handleReset = async () => {
    try {
      const res = await fetch(`http://10.143.59.233:3000/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password }),
      });

      const data = await res.json();

      if (data.success) {
        Alert.alert("Success", "Password reset successful");
        navigation.replace("Login");
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>

      <TextInput
        placeholder="Enter new password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8fafc" },
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
  buttonText: { color: "#fff", textAlign: "center", fontSize: 16, fontWeight: "600" },
});
