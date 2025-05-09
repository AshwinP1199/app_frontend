import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "../../../../api/axios";

export default function ProviderProfile() {
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
      {/* Profile Image and Name */}
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
      {/* Email Address Input */}
      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        value={user?.email.toLowerCase()}
        editable={false}
      />
      {/* Contact Number Input */}
      <Text style={styles.label}>Contact Number</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={user?.mobileNo}
          editable={false}
        />
        <TouchableOpacity style={styles.editButton}>
          <MaterialIcons name="edit" size={20} color="#9b5377" />
        </TouchableOpacity>
      </View>

      {/* Verification Documents */}
      <Text style={styles.label}>Verification Documents</Text>
      <View style={styles.inputWrapper}>
        <View style={styles.documentContainer}>
          <Text style={styles.documentText}>Police_Verification.pdf</Text>
        </View>
      </View>
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
  editIcon: {
    position: "absolute",
    bottom: 5,
    right: 0,
    backgroundColor: "#9b5377",
    borderRadius: 15,
    padding: 5,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#9b5377",
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    color: "#a6a3a5",
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#E0E0E0",
    padding: 10,
    borderRadius: 5,
    color: "#a6a3a5",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    marginBottom: 10,
  },
  editButton: {
    padding: 5,
    marginLeft: 5,
  },
  documentContainer: {
    flex: 1,
    padding: 10,
  },
  documentText: {
    color: "#9b5377",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#a6a3a5",
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 10,
    marginTop: 20,
  },
  uploadButtonText: {
    color: "#a6a3a5",
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 40,
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
  nameText: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#9b5377",
    marginBottom: 20,
  },
});
