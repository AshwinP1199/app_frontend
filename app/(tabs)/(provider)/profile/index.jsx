import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Linking, // Import Linking
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "../../../../api/axios";

export default function ProviderProfile() {
  const [user, setUser] = useState();
  const [editable, setEditable] = useState(false); // State for edit mode
  const [newPhoneNumber, setNewPhoneNumber] = useState(""); // State for new phone number
  const navigation = useNavigation();

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.get("auth/current-user");
        setUser(res.data.data);
        setNewPhoneNumber(res.data.data?.mobileNo); // Initialize phone number for editing
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

  const handleUpdatePhoneNumber = async () => {
    try {
      const userId = user?._id;
      if (!newPhoneNumber) {
        Alert.alert("Error", "Phone number cannot be empty.");
        return;
      }

      const res = await axios.put(`user/${userId}`, {
        mobileNo: newPhoneNumber,
      });
      if (res.status === 200) {
        Alert.alert("Success", "Phone number updated successfully!");
        setUser({ ...user, mobileNo: newPhoneNumber }); // Update user state
        setEditable(false); // Disable edit mode after update
      } else {
        throw new Error("Failed to update phone number.");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update phone number."
      );
    }
  };

  const openDocument = () => {
    // Open the document link
    Linking.openURL(user?.document).catch((err) =>
      Alert.alert("Error", "Unable to open the document link.")
    );
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
          value={newPhoneNumber}
          onChangeText={setNewPhoneNumber}
          editable={editable} // Allow editing based on editable state
        />
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditable(!editable)} // Toggle edit mode
        >
          <MaterialIcons name="edit" size={20} color="#9b5377" />
        </TouchableOpacity>
      </View>

      {editable && (
        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleUpdatePhoneNumber} // Handle phone number update
        >
          <Text style={styles.updateButtonText}>Save Changes</Text>
        </TouchableOpacity>
      )}

      {/* Verification Documents */}
      <Text style={styles.label}>Verification Documents</Text>
      <TouchableOpacity style={styles.documentContainer} onPress={openDocument}>
        <Text style={styles.documentText}>
          {user?.document ? "View Document" : "No Document Available"}
        </Text>
      </TouchableOpacity>

      {/* Logout Button */}
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
  nameText: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#9b5377",
    marginBottom: 20,
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
  updateButton: {
    backgroundColor: "#9b5377",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
  },
  updateButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  documentContainer: {
    padding: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  documentText: {
    color: "#9b5377",
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
});
