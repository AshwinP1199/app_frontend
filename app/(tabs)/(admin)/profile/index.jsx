import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "../../../../api/axios";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function profile() {
  const [user, setUser] = useState();
  const navigation = useNavigation();

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.get("auth/current-user");
        setUser(res.data.data);
      } catch (error) {
        Alert.alert(
          "Error",
          error.response?.data?.message ||
            "Something went wrong. Please try again later."
        );
      }
    };
    getUser();
  }, []);
  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert("Success", "Logged Out Successfully!");
      navigation.navigate("login/index");
    } catch (error) {
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Picture */}
      <View style={styles.profileContainer}>
        <Image
          source={{
            uri: user?.profileImage || "https://via.placeholder.com/80",
          }}
          style={styles.profileImage}
        />
      </View>

      {/* User Name */}
      <Text style={styles.nameText}>{user?.fullName.toUpperCase()}</Text>

      {/* Email Address */}
      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        value={user?.email.toLowerCase()}
        editable={false}
      />

      {/* Contact Number */}
      <Text style={styles.label}>Contact Number</Text>
      <View style={styles.contactContainer}>
        <TextInput
          style={styles.input}
          value={user?.mobileNo}
          editable={false}
        />
        <TouchableOpacity style={styles.editIconContainer}>
          <MaterialIcons name="edit" size={20} color="#9b5377" />
        </TouchableOpacity>
      </View>

      {/* logoutButton */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogout}>
          <Text style={styles.loginButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    color: "#a6a3a5",
    fontWeight: "bold",
    marginBottom: 5,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  nameText: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#9b5377",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    color: "#a6a3a5",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: "#d9d9d9", // Background color for the text input
  },
  contactContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  editIconContainer: {
    position: "absolute",
    right: 10,
  },
  editIcon: {
    fontSize: 18,
    color: "#9b5377",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 40,
  },
  button: {
    backgroundColor: "#9b5377",
    paddingVertical: 25,
    paddingHorizontal: 10,
    width: 105,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginButton: {
    backgroundColor: "#9b5377",
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: "center",
    width: "70%",
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
