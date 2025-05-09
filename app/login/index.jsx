import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import axios from "../../api/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

export default function Login() {
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getFcmToken = async () => {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }

      const projectId = "fe924ff0-2143-4b9f-81d0-e3ea06a914f5";
      const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
        .data;

      return token;
    } catch (error) {
      alert("Error getting FCM token:", error.message);
    }
  };
  const handleLogin = async () => {
    // Basic validation
    if (!userName || !password) {
      Alert.alert("Error", "Please enter both username and password.");
      return;
    }

    const fcmToken = await getFcmToken();
    setLoading(true);

    try {
      const response = await axios.post("/auth/login", {
        userName,
        password,
        fcmToken,
      });
      if (response.status === 200) {
        // Store the token in AsyncStorage
        await AsyncStorage.setItem("user", JSON.stringify(response.data));

        if (response.data.role === "User") {
          Alert.alert("Success", "User Login successful!");
          router.push("(user)/home/dashboard", { relativeToDirectory: true });
        } else if (response.data.role === "Provider") {
          if (response.data.approved) {
            Alert.alert("Success", "Provider Login successful!");
            router.push("(provider)/home/dashboard", {
              relativeToDirectory: true,
            });
          } else {
            Alert.alert("Warning", "Your account is not approved yet.");
            router.push("(provider-not-approved)/home/dashboard", {
              relativeToDirectory: true,
            });
          }
        } else if (response.data.role === "Admin") {
          Alert.alert("Success", "Admin Login successful!");
          router.push("(admin)/home/dashboard", { relativeToDirectory: true });
        } else {
          Alert.alert("Error", "Invalid User!");
        }
      } else {
        Alert.alert("Error", "Login failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Something went wrong. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Icon and Logo */}

      {/* Title */}
      <Text style={styles.title}>Sign In</Text>

      {/* Username Input */}
      <Text style={styles.label}>Username</Text>
      <View style={styles.userNameContainer}>
        <TextInput
          style={styles.input}
          value={userName}
          onChangeText={setUserName}
          placeholderTextColor="#a6a3a5"
        />
      </View>

      {/* Password Input */}
      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          secureTextEntry={passwordVisible}
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#a6a3a5"
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Ionicons
            name={passwordVisible ? "eye-off-outline" : "eye-outline"}
            size={24}
            color="#9b5377"
          />
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Forgot Password */}
      <View style={styles.forgotPasswordContainer}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        <TouchableOpacity>
          <Link href={"/login/reset-password"}>
            <Text style={styles.resetPasswordText}>Reset Password</Text>
          </Link>
        </TouchableOpacity>
      </View>

      {/* Register Options */}
      <Text style={styles.noAccountText}>Don’t have any account?</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.registerButton}>
          <Link href={"/register/provider"}>
            <Text style={styles.registerButtonText}>Register as Provider</Text>
          </Link>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.registerButton}>
          <Link href={"/register/user"}>
            <Text style={styles.registerButtonText}>Register as User</Text>
          </Link>
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
    marginBottom: 5,
  },
  input: {
    flex: 1,
    paddingVertical: 5,
    color: "#7B4E8C",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#a6a3a5",
    marginBottom: 20,
  },
  userNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#a6a3a5",
    marginBottom: 20,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#9b5377",
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: "center",
    width: "100%",
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  forgotPasswordContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#a6a3a5",
    fontWeight: "bold",
    fontSize: 14,
  },
  resetPasswordText: {
    color: "#9b5377",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
    textDecorationLine: "underline",
  },
  noAccountText: {
    marginTop: 40,
    textAlign: "center",
    color: "#a6a3a5",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 20,
  },
  registerButton: {
    backgroundColor: "#9b5377",
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: "center",
    width: "100%",
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
