import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Make sure to install @expo/vector-icons

export default function resetPassword() {
  // State to manage password visibility
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Back Icon and Logo */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="#7B4E8C" />
        <Text style={styles.logo}>Beside</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Reset Password</Text>

      {/* New Password Input */}
      <Text style={styles.label}>New Password</Text>
      <View style={styles.passwordContainer}>
        <TextInput style={styles.input} secureTextEntry={!newPasswordVisible} />
        <TouchableOpacity
          onPress={() => setNewPasswordVisible(!newPasswordVisible)}
        >
          <Ionicons
            name={newPasswordVisible ? "eye-off-outline" : "eye-outline"}
            size={24}
            color="#a6a3a5"
          />
        </TouchableOpacity>
      </View>

      {/* Confirm New Password Input */}
      <Text style={styles.label}>Confirm New Password</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          secureTextEntry={!confirmPasswordVisible}
        />
        <TouchableOpacity
          onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
        >
          <Ionicons
            name={confirmPasswordVisible ? "eye-off-outline" : "eye-outline"}
            size={24}
            color="#a6a3a5"
          />
        </TouchableOpacity>
      </View>

      {/* Reset Password Button */}
      <View style={styles.resetButtonContainer}>
        <TouchableOpacity style={styles.resetButton}>
          <Text style={styles.resetButtonText}>Reset Password</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#9b5377",
    marginLeft: 10,
    textAlign: "center",
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#9b5377",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#a6a3a5",
    fontWeight: "bold",
    marginBottom: 5,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#a6a3a5",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    paddingVertical: 5,
    color: "#7B4E8C",
  },
  resetButtonContainer: {
    alignItems: "center",
  },
  resetButton: {
    backgroundColor: "#9b5377",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 30,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
